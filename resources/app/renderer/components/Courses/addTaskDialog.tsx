"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Checkbox } from "@/components/checkbox";
import DateTimePicker from "./DatePickerComponent";
import { createTask, updateTask } from "@/services/core services/taskService";
import { addCalendarEvent } from "@/lib/helpers/calendarHelpers";
import { AnimatePresence, motion } from "framer-motion";

type CourseType =
  | "default"
  | "problem set"
  | "homework"
  | "lab"
  | "project task"
  | "report"
  | "quiz"
  | "tutorial exercise"
  | "custom";

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
  courseId: string;
  taskToEdit?: any;
}

const courseTypeOptions: CourseType[] = [
  "problem set",
  "homework",
  "lab",
  "project task",
  "report",
  "quiz",
  "tutorial exercise",
  "custom",
];

const courseTypeLabels: Record<CourseType, string> = {
  default: "",
  "problem set": "problem set",
  homework: "homework",
  lab: "lab",
  "project task": "project task",
  report: "report",
  quiz: "quiz",
  "tutorial exercise": "tutorial exercise",
  custom: "custom",
};

export default function AddTaskDialog({
  isOpen,
  onClose,
  onTaskAdded,
  courseId,
  taskToEdit,
}: AddTaskDialogProps) {

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [allDay, setAllDay] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<string>("none");
  const [selectedType, setSelectedType] = useState<CourseType>("default");
  const [customType, setCustomType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setSelectedType(taskToEdit.type as CourseType || "default");
      setCustomType(
        taskToEdit.type && !courseTypeOptions.includes(taskToEdit.type as CourseType)
          ? taskToEdit.type
          : ""
      );
      loadedTaskId.current = taskToEdit.id;
    } else {
      setTitle("");
      setSummary("");
      setDeadline(null);
      setAllDay(false);
      setRecurring(false);
      setRecurrence("none");
      setSelectedType("default");
      setCustomType("");
      loadedTaskId.current = null;
    }
  }, [isOpen, taskToEdit?.id]);

  useEffect(() => {
    if (!isOpen) {
      const timeoutId = setTimeout(() => {
        setTitle("");
        setSummary("");
        setDeadline(null);
        setAllDay(false);
        setRecurring(false);
        setRecurrence("none");
        setSelectedType("default");
        setCustomType("");
        loadedTaskId.current = null;
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const isButtonDisabled = isSubmitting || !title.trim() || !deadline;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !deadline) return;

    setIsSubmitting(true);

    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          title: title.trim(),
          description: summary.trim(),
          deadline,

          type: selectedType === "custom" ? (customType.trim() as CourseType) || "custom" : selectedType,
        });
        await addCalendarEvent(
          title.trim(),
          deadline,
          deadline,
          "deadline",
          allDay,
          recurrence
        );
      } else {
        await createTask({
          courseId,
          title: title.trim(),
          description: summary.trim(),
          deadline,
          type: selectedType === "custom" ? (customType.trim() as CourseType) || "custom" : selectedType,
        });
        await addCalendarEvent(
          title.trim(),
          deadline,
          deadline,
          "deadline",
          allDay,
          recurrence
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTitle("");
      setSummary("");
      setDeadline(null);
      setAllDay(false);
      setRecurring(false);
      setRecurrence("none");
      setSelectedType("default");
      setCustomType("");
      setIsSubmitting(false);
      onTaskAdded();
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTypeChange = (type: CourseType) => {
    setSelectedType(type);
    if (type === "homework" || type === "quiz" || type === "tutorial exercise") {
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-zinc-900 border border-zinc-800 p-6 text-left shadow-2xl transition-all">
                <Dialog.Title className="text-xl text-white font-nun font-semibold mb-6">
                  {taskToEdit ? "edit task" : "add new task"}
                </Dialog.Title>
                <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm text-white/80 font-dm font-medium">
                        task name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="enter task title"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl text-white font-dm h-12 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-white/40"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-white/80 font-dm font-medium">
                        description
                      </Label>
                      <Input
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="optional description"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl text-white font-dm h-12 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-white/40"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-white/80 font-dm font-medium">
                        deadline <span className="text-red-400">*</span>
                      </Label>
                      <DateTimePicker
                        selected={deadline}
                        onChange={setDeadline}
                        allDay={allDay}
                        label="select date & time"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm text-white/80 font-dm font-medium">
                        task type
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {courseTypeOptions.map((option) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50">
                            <input
                              type="radio"
                              name="courseType"
                              value={option}
                              checked={selectedType === option}
                              onChange={() => handleTypeChange(option)}
                              className="w-4 h-4 text-blue-500 bg-zinc-700 rounded-full border-zinc-600 focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-white font-dm">{courseTypeLabels[option]}</span>
                          </label>
                        ))}
                      </div>
                      {selectedType === "custom" && (
                        <Input
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          placeholder="enter custom type"
                          className="w-full bg-zinc-800 border rounded-xl border-zinc-700 text-white font-dm h-10 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-white/40"
                        />
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm text-white/80 font-dm font-medium">options</Label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={allDay}
                            onCheckedChange={(checked) => setAllDay(!!checked)}
                            className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <span className="text-white font-dm text-sm">all day</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={recurring}
                            onCheckedChange={(checked) => setRecurring(!!checked)}
                            className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <span className="text-white font-dm text-sm">recurring</span>
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
                            className="overflow-hidden bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50"
                          >
                            <div className="flex items-center gap-3">
                              <Label className="text-white font-dm text-sm font-medium">repeat:</Label>
                              <select
                                className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-dm"
                                value={recurrence}
                                onChange={(e) => setRecurrence(e.target.value)}
                              >
                                <option value="none">select frequency</option>
                                <option value="daily">daily</option>
                                <option value="weekly">weekly</option>
                                <option value="monthly">monthly</option>
                                <option value="custom">custom</option>
                              </select>
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
                  <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-dm text-sm transition-all duration-200 border border-zinc-700"
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isButtonDisabled}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:text-white/50 text-white rounded-xl font-dm text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      {isSubmitting ? "saving..." : taskToEdit ? "update task" : "add task"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
