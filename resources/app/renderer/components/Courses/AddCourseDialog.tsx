"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Paperclip, Plus, Minus, Trash2 } from "react-feather";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@radix-ui/react-tooltip";
import { Course, CourseType, TaskType } from "@/services/db";
import {
  addCourse,
  updateCourse,
  getCourseById,
  deleteCourse,
} from "@/services/core services/courseService";
import CourseFormFields from "./CourseFormFields";
import { EventDateTimeField } from "../DateField";
import ColorPickerField from "./ColourPickerField";
import { addCalendarEvent } from "@/lib/helpers/calendarHelpers";
import { extractCourseFromPDF } from "@/services/google";

interface AddCourseDialogProps {
  isOpen: boolean;
  onAddCourse?: (course: Course) => void;
  onUpdateCourse?: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onClose: () => void;
  existingCourse?: Course | null;
  midterms: { start: Date | null; end: Date | null }[];
  setMidterms: React.Dispatch<
    React.SetStateAction<{ start: Date | null; end: Date | null }[]>
  >;
  finalExam: { start: Date | null; end: Date | null } | null;
  setFinalExam: React.Dispatch<
    React.SetStateAction<{ start: Date | null; end: Date | null } | null>
  >;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
}

export default function AddCourseDialog({
  isOpen,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onClose,
  existingCourse,
  midterms,
  setMidterms,
  finalExam,
  setFinalExam,
  endDate,
  setEndDate,
}: AddCourseDialogProps) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [professor, setProfessor] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [selectedType, setSelectedType] = useState<CourseType>("lecture");
  const [color, setColor] = useState("#8B0000");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [courseIcon, setCourseIcon] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [activePicker, setActivePicker] = useState<string | null>(null);

  // New states required for CourseFormFields recurring and task options
  const [hasLabTime, setHasLabTime] = useState(false);
  const [labStartTime, setLabStartTime] = useState<Date | null>(null);
  const [labEndTime, setLabEndTime] = useState<Date | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState("none");
  const [customDays, setCustomDays] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>("default");
  const [customTaskType, setCustomTaskType] = useState("");

  const isEditing = !!existingCourse;
  const isLoadingData = useRef(false);
  const loadedCourseId = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (existingCourse?.id) {
      if (
        loadedCourseId.current === existingCourse.id &&
        !isLoadingData.current
      ) {
        return;
      }

      isLoadingData.current = true;

      const loadCourseData = async () => {
        try {
          const latest = await getCourseById(existingCourse.id);
          if (!latest) return;

          setTitle(latest.title || "");
          setCode(latest.code || "");
          setProfessor(latest.professor || "");
          setProfEmail(latest.profEmail || "");
          setSelectedType(latest.type ?? "lecture");
          setCourseIcon(typeof latest.icon === "string" ? latest.icon : null);
          setCredits(latest.credits ?? null);
          setDescription(latest.description || "");
          setColor(latest.color || "#8B0000");

          setMidterms(
            latest.midterms && latest.midterms.length > 0
              ? latest.midterms.map((mt) => ({
                  start: mt.start ? new Date(mt.start) : null,
                  end: mt.end ? new Date(mt.end) : null,
                }))
              : [{ start: null, end: null }],
          );
          setFinalExam(
            latest.finalExamDate && latest.finalExamEndDate
              ? {
                  start: new Date(latest.finalExamDate),
                  end: new Date(latest.finalExamEndDate),
                }
              : latest.finalExamDate
                ? {
                    start: new Date(latest.finalExamDate),
                    end: new Date(latest.finalExamDate),
                  }
                : null,
          );
          setEndDate(latest.endsOn ? new Date(latest.endsOn) : null);

          loadedCourseId.current = existingCourse.id;
        } catch (err) {
          console.error("Error fetching latest course", err);
        } finally {
          isLoadingData.current = false;
        }
      };

      loadCourseData();
    } else {
      setTitle("");
      setCode("");
      setProfessor("");
      setProfEmail("");
      setOfficeHours("");
      setSelectedType("lecture");
      setColor("#8B0000");
      setPdfFile(null);
      setDescription("");
      setCourseIcon(null);
      setCredits(null);
      setMidterms([{ start: null, end: null }]);
      setFinalExam(null);
      setEndDate(null);
      setHasLabTime(false);
      setLabStartTime(null);
      setLabEndTime(null);
      setRecurring(false);
      setRecurrence("none");
      setCustomDays("");
      setSelectedTaskType("default");
      setCustomTaskType("");
      loadedCourseId.current = null;
    }
  }, [isOpen, existingCourse?.id]);

  useEffect(() => {
    if (!isOpen) {
      const timeoutId = setTimeout(() => {
        setTitle("");
        setCode("");
        setProfessor("");
        setProfEmail("");
        setOfficeHours("");
        setSelectedType("lecture");
        setColor("#8B0000");
        setPdfFile(null);
        setDescription("");
        setCourseIcon(null);
        setCredits(null);
        setHasLabTime(false);
        setLabStartTime(null);
        setLabEndTime(null);
        setRecurring(false);
        setRecurrence("none");
        setCustomDays("");
        setSelectedTaskType("default");
        setCustomTaskType("");
        loadedCourseId.current = null;
        isLoadingData.current = false;
        setActivePicker(null);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const handlePdfUpload = async (file: File) => {
    setIsPdfLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));
      const result = await extractCourseFromPDF(base64String);
      if (result.success) {
        const data = result.course;
        if (data.title) setTitle(data.title);
        if (data.code) setCode(data.code);
        if (data.professor) setProfessor(data.professor);
        if (data.profEmail) setProfEmail(data.profEmail);
        if (data.credits) setCredits(data.credits);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPdfLoading(false);
      const input =
        document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = "";
    }
  };

  const handleDelete = async () => {
    if (!existingCourse) return;
    if (!confirm("are you sure you want to delete this course?")) return;
    setIsDeleting(true);
    try {
      await deleteCourse(existingCourse.id);
      onDeleteCourse?.(existingCourse.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !code.trim() || !endDate) return;
    setIsSubmitting(true);

    try {
      const courseData: Partial<Course> = {
        title,
        code,
        professor,
        profEmail,
        type: selectedType!,
        endsOn: endDate,
        description,
        color,
        midterms: midterms
          .filter((mt) => mt.start && mt.end)
          .map((mt) => ({ start: mt.start!, end: mt.end! })),
        finalExamDate: finalExam?.start ?? undefined,
        finalExamEndDate: finalExam?.end ?? undefined,
        icon: courseIcon || null,
        credits: credits ?? 0,
      };

      let course: Course;

      if (isEditing && existingCourse) {
        await updateCourse(existingCourse.id, courseData);
        course = { ...existingCourse, ...courseData, updatedOn: new Date() };
        onUpdateCourse?.(course);
      } else {
        const newCourseData = {
          ...courseData,
          title: title || "",
          code: code || "",
          professor: professor || "",
          endsOn: endDate || new Date(),
          homepage: {
            deadlines: [],
            tasks: [],
            resources: [],
            notes: "",
            announcements: [],
          },
          selectedType: selectedType!,
        };
        course = await addCourse(newCourseData);
        onAddCourse?.(course);
      }

      const events: {
        summary: string;
        start: Date;
        end: Date;
        allDay?: boolean;
      }[] = [];

      if (endDate) {
        events.push({
          summary: `${title} - Course End`,
          start: new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
          ),
          end: new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
          ),
          allDay: true,
        });
      }

      midterms.forEach((mt, i) => {
        if (mt.start && mt.end) {
          events.push({
            summary: `${title} - midterm ${i + 1}`,
            start: mt.start,
            end: mt.end,
          });
        }
      });

      if (finalExam?.start && finalExam?.end) {
        events.push({
          summary: `${title} - final exam`,
          start: finalExam.start,
          end: finalExam.end,
        });
      }

      await Promise.all(
        events.map((evt) =>
          addCalendarEvent(
            evt.summary,
            evt.start,
            evt.end,
            evt.summary.toLowerCase().includes("exam") ? "exam" : "deadline",
            evt.allDay ?? false,
          ),
        ),
      );

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMidterm = () => {
    if (midterms.length >= 2) return;
    const lastEnd = midterms[midterms.length - 1]?.end ?? new Date();
    setMidterms([
      ...midterms,
      { start: lastEnd, end: new Date(lastEnd.getTime() + 60 * 60 * 1000) },
    ]);
  };

  const removeMidterm = (index: number) =>
    setMidterms(midterms.filter((_, i) => i !== index));

  return (
    <TooltipProvider>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-end p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 translate-x-full"
              >
                <Dialog.Panel className="w-full h-screen max-w-5xl transform rounded-l-2xl bg-neutral-900 p-8 text-left shadow-2xl transition-all flex flex-col justify-between border-l border-y border-zinc-800">
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                      <Dialog.Title className="text-xl text-white font-dm font-semibold">
                        {isEditing ? "edit course" : "add course"}
                      </Dialog.Title>
                      <div className="flex gap-2 items-center">
                        <p className="font-mp text-lg font-medium text-white">
                          upload syllabi
                        </p>
                        <label className="flex h-8 w-8 items-center justify-center rounded-xl text-white duration-300 hover:bg-zinc-800 hover:scale-105 cursor-pointer transition-colors">
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files &&
                              handlePdfUpload(e.target.files[0])
                            }
                          />
                          {isPdfLoading ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Paperclip size={18} />
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 overflow-y-auto max-h-[calc(100vh-160px)] pr-2">
                      <div className="space-y-6 flex flex-col">
                        <div className="flex-1 space-y-6">
                          <CourseFormFields
                            title={title}
                            setTitle={setTitle}
                            code={code}
                            setCode={setCode}
                            professor={professor}
                            setProfessor={setProfessor}
                            profEmail={profEmail}
                            setProfEmail={setProfEmail}
                            officeHours={officeHours}
                            setOfficeHours={setOfficeHours}
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                            description={description}
                            setDescription={setDescription}
                            hasLabTime={hasLabTime}
                            setHasLabTime={setHasLabTime}
                            labStartTime={labStartTime}
                            setLabStartTime={setLabStartTime}
                            labEndTime={labEndTime}
                            setLabEndTime={setLabEndTime}
                            recurring={recurring}
                            setRecurring={setRecurring}
                            recurrence={recurrence}
                            setRecurrence={setRecurrence}
                            customDays={customDays}
                            setCustomDays={setCustomDays}
                            selectedTaskType={selectedTaskType}
                            setSelectedTaskType={setSelectedTaskType}
                            customTaskType={customTaskType}
                            setCustomTaskType={setCustomTaskType}
                            activePicker={activePicker}
                            setActivePicker={setActivePicker}
                          />
                        </div>
                      </div>

                      <div className="space-y-6 flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="flex flex-col gap-4">
                            {(midterms || []).map((mt, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="flex-1 rounded-xl p-4 transition-all shadow-inner">
                                  <EventDateTimeField
                                    id={`midterm-${i}` as any}
                                    label={`midterm ${i + 1} date & time`}
                                    selected={mt.start}
                                    onChange={(date) => {
                                      const targetEnd = new Date(
                                        date.getTime() + 60 * 60 * 1000,
                                      );
                                      const newMidterms = [...midterms];
                                      newMidterms[i] = {
                                        start: date,
                                        end: targetEnd,
                                      };
                                      setMidterms(newMidterms);
                                    }}
                                    allDay={false}
                                    activePicker={activePicker}
                                    setActivePicker={setActivePicker}
                                  />
                                </div>

                                <div className="flex gap-1 pt-6">
                                  {i === midterms.length - 1 &&
                                    midterms.length < 2 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={addMidterm}
                                            className="h-8 w-8 flex items-center justify-center rounded-[0.5em] text-white text-sm transition-transform duration-200 hover:bg-zinc-700 hover:scale-105 cursor-pointer bg-zinc-800 border border-zinc-700"
                                          >
                                            <Plus size={18} strokeWidth={3} />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="left"
                                          className="bg-zinc-800 text-white font-dm rounded-md text-xs p-1 font-thin"
                                        >
                                          add optional midterm
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  {i > 0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => removeMidterm(i)}
                                          className="h-8 w-8 flex items-center justify-center rounded-[0.5em] text-white text-sm transition-transform duration-200 hover:bg-red-600 hover:scale-105 cursor-pointer bg-zinc-800 border border-zinc-700"
                                        >
                                          <Minus size={18} />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="left"
                                        className="bg-zinc-800 text-white font-dm rounded-md text-xs p-1 font-thin"
                                      >
                                        remove midterm
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-xl p-4 transition-all shadow-inner">
                            <EventDateTimeField
                              id="final-exam"
                              label="final exam date & time"
                              selected={finalExam?.start || null}
                              onChange={(date) => {
                                const targetEnd = new Date(
                                  date.getTime() + 60 * 60 * 1000,
                                );
                                setFinalExam({ start: date, end: targetEnd });
                              }}
                              allDay={false}
                              activePicker={activePicker}
                              setActivePicker={setActivePicker}
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="w-full rounded-xl p-4 transition-all shadow-inner">
                              <EventDateTimeField
                                id="end-date"
                                label={
                                  <>
                                    course end date{" "}
                                    <span className="text-red-500">*</span>
                                  </>
                                }
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                allDay={true}
                                activePicker={activePicker}
                                setActivePicker={setActivePicker}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4 px-4 items-center">
                              <div className="flex flex-col">
                                <ColorPickerField
                                  color={color}
                                  setColor={setColor}
                                  label="select course colour"
                                />
                              </div>

                              <div className="flex flex-col ">
                                <label className="text-sm text-gray-400 mb-1 font-mp ">
                                  credits
                                </label>
                                <input
                                  type="number"
                                  placeholder="2.00"
                                  value={credits ?? ""}
                                  onChange={(e) =>
                                    setCredits(
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                    )
                                  }
                                  className="w-24 p-2.5 h-10 bg-zinc-800/50 border-zinc-700/50 text-white font-dm rounded-xl placeholder:text-gray-500 placeholder:text-sm focus:ring-1 focus:ring-zinc-600 focus:outline-none border border-zinc-700"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800 mt-6">
                    <div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={isDeleting || isSubmitting}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 border-red-500/20 rounded-xl font-dm text-sm font-medium text-zinc-400 cursor-pointer transition-all duration-200 ease-out transform will-change-transform hover:bg-red-500/20 hover:text-red-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={15} />
                          {isDeleting ? "deleting..." : "delete course"}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        isDeleting ||
                        isPdfLoading ||
                        !title.trim() ||
                        !code.trim() ||
                        !endDate
                      }
                      className="px-6 py-2.5 bg-white hover:bg-gray-100 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-900 rounded-xl font-dm text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
                    >
                      {isSubmitting
                        ? isEditing
                          ? "updating course..."
                          : "adding course..."
                        : isEditing
                          ? "update course"
                          : "add course"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </TooltipProvider>
  );
}
