"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Checkbox } from "@/components/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/select";
import { EventDateTimeField } from "../DateField";
import { createTask, updateTask } from "@/services/core services/taskService";
import { addCalendarEvent } from "@/lib/helpers/calendarHelpers";
import { updateGoogleCalendarEvent } from "@/services/google";
import { AnimatePresence, motion } from "framer-motion";
import { Task, TaskType } from "@/services/db";

const CALENDAR_EVENTS_UPDATED_EVENT = "calmeca:calendar-events-updated";

interface CourseItem {
  id: string;
  name: string;
}

const taskTypeOptions: TaskType[] = [
  "problem set",
  "lab",
  "project task",
  "report",
  "tutorial",
  "custom",
];

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
  courseId?: string;
  courses?: CourseItem[];
  taskToEdit?: Task;
  outsideCourseOrigin?: boolean;
}

const taskTypeLabels: Record<TaskType, string> = {
  default: "",
  "problem set": "problem set",
  lab: "lab",
  "project task": "project task",
  report: "report",
  tutorial: "tutorial",
  custom: "custom",
};

export default function AddTaskDialog({
  isOpen,
  onClose,
  onTaskAdded,
  courseId,
  courses = [],
  taskToEdit,
  outsideCourseOrigin = false,
}: AddTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(new Date());
  const [allDay, setAllDay] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<string>("none");
  const [customDays, setCustomDays] = useState("");
  const [selectedType, setSelectedType] = useState<TaskType>("default");
  const [customType, setCustomType] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courseId || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const loadedTaskId = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit?.id) {
      if (loadedTaskId.current === taskToEdit.id) return;
      setTitle(taskToEdit.title || "");
      setSummary(taskToEdit.summary || "");
      setDeadline(taskToEdit.deadline ? new Date(taskToEdit.deadline) : null);
      setAllDay(taskToEdit.allDay || false);
      setRecurring(taskToEdit.recurring || false);
      setRecurrence(taskToEdit.recurrence || "none");
      setSelectedType((taskToEdit.type as TaskType) || "default");
      setCustomType(
        taskToEdit.type &&
          !taskTypeOptions.includes(taskToEdit.type as TaskType)
          ? taskToEdit.type
          : "",
      );
      setSelectedCourseId(taskToEdit.courseId || courseId || "");
      loadedTaskId.current = taskToEdit.id;
    } else {
      setTitle("");
      setSummary("");
      setDeadline(null);
      setAllDay(false);
      setRecurring(false);
      setRecurrence("none");
      setCustomDays("");
      setSelectedType("default");
      setCustomType("");
      setSelectedCourseId(courseId || "");
      loadedTaskId.current = null;
    }
  }, [isOpen, taskToEdit, courseId]);

  useEffect(() => {
    if (!isOpen) {
      const timeoutId = setTimeout(() => {
        setTitle("");
        setSummary("");
        setDeadline(null);
        setAllDay(false);
        setRecurring(false);
        setRecurrence("none");
        setCustomDays("");
        setSelectedType("default");
        setCustomType("");
        setSelectedCourseId("");
        setActivePicker(null);
        loadedTaskId.current = null;
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const isButtonDisabled = isSubmitting || !title.trim();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      let savedTaskId = taskToEdit?.id;
      const resolvedType =
        selectedType === "custom"
          ? (customType.trim() as TaskType) || "custom"
          : selectedType;

      const payloadData: any = {
        title: title.trim(),
        deadline: deadline || undefined,
        type: resolvedType,
      };

      const finalCourseId = selectedCourseId || courseId;
      if (finalCourseId && finalCourseId.trim() !== "") {
        payloadData.courseId = finalCourseId;
      }

      if (taskToEdit?.id) {
        await updateTask(taskToEdit.id, payloadData);
      } else {
        const createdTask = await createTask(payloadData);
        savedTaskId = createdTask.id;
      }

      if (deadline) {
        try {
          if (taskToEdit?.googleCalendarEventId) {
            await updateGoogleCalendarEvent(taskToEdit.googleCalendarEventId, {
              summary: title.trim(),
              start: deadline.toISOString(),
              end: deadline.toISOString(),
            });
          } else {
            const createdCalendarEvent = await addCalendarEvent(
              title.trim(),
              deadline,
              deadline,
              "deadline",
              allDay,
              recurrence,
            );

            if (createdCalendarEvent?.id && savedTaskId) {
              await updateTask(savedTaskId, {
                googleCalendarEventId: createdCalendarEvent.id,
              });
            }
          }

          window.dispatchEvent(new Event(CALENDAR_EVENTS_UPDATED_EVENT));
        } catch (calendarErr) {
          console.error("Calendar event error:", calendarErr);
        }
      }

      onTaskAdded();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save task. Please verify your course selection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTypeChange = (type: TaskType) => {
    setSelectedType(type);
    if (
      type === "problem set" ||
      type === "tutorial exercise" ||
      type === "lab"
    ) {
      setRecurring(true);
    } else if (type !== "custom") {
      setRecurring(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-stretch justify-end p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-md h-full min-h-screen transform rounded-l-2xl bg-zinc-900 border-l border-zinc-800 p-6 text-left shadow-2xl transition-all overflow-y-auto flex flex-col justify-between">
                <div>
                  <Dialog.Title className="text-xl text-white font-dm font-semibold mb-6">
                    {taskToEdit ? "edit task" : "add task"}
                  </Dialog.Title>
                  <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                    <div className="space-y-6">
                      <div className="space-y-2.5">
                        <Label className="block text-sm text-white/80 font-dm font-medium mb-2">
                          name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="enter title"
                          className="w-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm h-12 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500"
                        />
                      </div>
                      {outsideCourseOrigin && (
                        <div className="space-y-2.5">
                          <Label className="block text-sm text-white/80 font-dm font-medium mb-2">
                            course <span className="text-white/40 text-xs font-normal">(optional)</span>
                          </Label>
                          <Select
                            value={selectedCourseId}
                            onValueChange={setSelectedCourseId}
                          >
                            <SelectTrigger className="w-full h-12 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl font-dm text-white px-4 focus:ring-1 focus:ring-zinc-600 data-[placeholder]:text-gray-500">
                              <SelectValue
                                placeholder="select course"
                                className="placeholder:text-gray-500"
                              />
                            </SelectTrigger>
                            <SelectContent className="border-none rounded-xl mt-2 bg-zinc-900 text-white border-zinc-700 shadow-xl">
                              <SelectItem
                                value=""
                                className="focus:bg-zinc-800 text-gray-500 data-[highlighted]:bg-zinc-800 cursor-pointer rounded-xl"
                              >
                                select course
                              </SelectItem>
                              {courses.map((course) => (
                                <SelectItem
                                  key={course.id}
                                  value={course.id}
                                  className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl"
                                >
                                  {course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="">
                        <Label className="block text-sm text-white/80 font-dm font-medium mb-2">
                          {allDay ? "deadline date " : "deadline date & time "}
                          <span className="text-white/40 text-xs font-normal">
                            (optional)
                          </span>
                        </Label>

                        <div className="rounded-xl p-3 transition-all shadow-inner">
                          <EventDateTimeField
                            id="deadline"
                            selected={deadline}
                            onChange={setDeadline}
                            allDay={allDay}
                            activePicker={activePicker}
                            setActivePicker={setActivePicker}
                          />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="block text-sm text-white/80 font-dm font-medium mb-2">
                          type
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {taskTypeOptions.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50"
                            >
                              <input
                                type="radio"
                                name="task type"
                                value={option}
                                checked={selectedType === option}
                                onChange={() => handleTypeChange(option)}
                                className="w-4 h-4 text-blue-500 bg-zinc-900 rounded-full border-zinc-600 focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-sm text-white font-dm">
                                {taskTypeLabels[option]}
                              </span>
                            </label>
                          ))}
                        </div>
                        {selectedType === "custom" && (
                          <Input
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            placeholder="enter custom type"
                            className="w-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm h-10 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500 mt-2"
                          />
                        )}
                      </div>
                      <div className="space-y-2.5">
                        <Label className="block text-sm text-white/80 font-dm font-medium mb-2">
                          options
                        </Label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={allDay}
                              onCheckedChange={(checked) =>
                                setAllDay(!!checked)
                              }
                              className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <span className="text-white font-dm text-sm">
                              all day
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={recurring}
                              onCheckedChange={(checked) =>
                                setRecurring(!!checked)
                              }
                              className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <span className="text-white font-dm text-sm">
                              recurring
                            </span>
                          </label>
                        </div>
                        <AnimatePresence initial={false}>
                          {recurring && (
                            <motion.div
                              key="recurring-options"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50 mt-3"
                            >
                              <div className="flex items-center gap-3">
                                <Label className="text-white font-dm text-sm font-medium">
                                  repeat:
                                </Label>
                                <Select
                                  value={recurrence}
                                  onValueChange={setRecurrence}
                                >
                                  <SelectTrigger
                                    className="w-full sm:w-40 border-none bg-zinc-800 rounded-xl font-dm text-white hover:bg-zinc-700 focus:ring-1 focus:ring-zinc-600"
                                    aria-label="Select recurrence frequency"
                                  >
                                    <SelectValue placeholder="select frequency" />
                                  </SelectTrigger>
                                  <SelectContent className="border-none rounded-xl mt-2 bg-zinc-900 text-white border-zinc-700 shadow-xl">
                                    <SelectItem
                                      value="none"
                                      className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl"
                                    >
                                      select frequency
                                    </SelectItem>
                                    <SelectItem
                                      value="daily"
                                      className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl"
                                    >
                                      daily
                                    </SelectItem>
                                    <SelectItem
                                      value="weekly"
                                      className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl"
                                    >
                                      weekly
                                    </SelectItem>
                                    <SelectItem
                                      value="monthly"
                                      className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl"
                                    >
                                      monthly
                                    </SelectItem>
                                    <SelectItem
                                      value="custom"
                                      className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl"
                                    >
                                      custom
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <AnimatePresence initial={false}>
                                  {recurrence === "custom" && (
                                    <motion.div
                                      key="custom-input"
                                      initial={{ opacity: 0, width: 0 }}
                                      animate={{ opacity: 1, width: "auto" }}
                                      exit={{ opacity: 0, width: 0 }}
                                      transition={{ duration: 0.25 }}
                                      className="overflow-hidden"
                                    >
                                      <Input
                                        type="number"
                                        min={1}
                                        value={customDays}
                                        onChange={(e) =>
                                          setCustomDays(e.target.value)
                                        }
                                        placeholder="days"
                                        className="w-20 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-dm"
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 hover:text-white rounded-xl font-dm text-sm transition-all duration-200 border border-zinc-700 cursor-pointer"
                      >
                        cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isButtonDisabled}
                        className="px-6 py-2 bg-zinc-300 hover:bg-zinc-400 active:bg-zinc-500 text-zinc-900 hover:font-semibold cursor-pointer disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:text-white/50 rounded-xl font-dm text-sm transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        {isSubmitting
                          ? "saving..."
                          : taskToEdit
                            ? "update task"
                            : "add task"}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}