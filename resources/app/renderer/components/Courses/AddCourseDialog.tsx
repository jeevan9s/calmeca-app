"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Paperclip, Plus, Minus } from "react-feather";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@radix-ui/react-tooltip";
import { Course, CourseType } from "@/services/db";
import { addCourse, updateCourse, getCourseById } from "@/services/core services/courseService";
import CourseFormFields from "./CourseFormFields";
import DateTimePicker from "./DatePickerComponent";
import ColorPickerField from "./ColourPickerField";
import { addCalendarEvent } from "@/lib/helpers/calendarHelpers";
import { extractCourseFromPDF } from "@/services/platform";

interface AddCourseDialogProps {
  isOpen: boolean;
  onAddCourse?: (course: Course) => void;
  onUpdateCourse?: (course: Course) => void;
  onClose: () => void;
  existingCourse?: Course | null;
  midterms: { start: Date | null; end: Date | null }[];
  setMidterms: React.Dispatch<React.SetStateAction<{ start: Date | null; end: Date | null }[]>>;
  finalExam: { start: Date | null; end: Date | null } | null;
  setFinalExam: React.Dispatch<React.SetStateAction<{ start: Date | null; end: Date | null } | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
}


export default function AddCourseDialog({
  isOpen,
  onAddCourse,
  onUpdateCourse,
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
  const [selectedType, setSelectedType] = useState<CourseType>("lecture");
  const [color, setColor] = useState("#8B0000");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [courseIcon, setCourseIcon] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  const isEditing = !!existingCourse;
  const isLoadingData = useRef(false);
  const loadedCourseId = useRef<string | null>(null);


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (existingCourse?.id) {
      if (loadedCourseId.current === existingCourse.id && !isLoadingData.current) {
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

          // Always load both start and end for midterms
          setMidterms(
            (latest.midterms && latest.midterms.length > 0)
              ? latest.midterms.map(mt => ({
                  start: mt.start ? new Date(mt.start) : null,
                  end: mt.end ? new Date(mt.end) : null,
                }))
              : [{ start: null, end: null }]
          );
          setFinalExam(
            latest.finalExamDate && latest.finalExamEndDate
              ? { start: new Date(latest.finalExamDate), end: new Date(latest.finalExamEndDate) }
              : latest.finalExamDate
                ? { start: new Date(latest.finalExamDate), end: new Date(latest.finalExamDate) }
                : null
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
      setSelectedType("lecture");
      setColor("#8B0000");
      setPdfFile(null);
      setDescription("");
      setCourseIcon(null);
      setCredits(null);
      setMidterms([{ start: null, end: null }]);
      setFinalExam(null);
      setEndDate(null);
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
        setSelectedType("lecture");
        setColor("#8B0000");
        setPdfFile(null);
        setDescription("");
        setCourseIcon(null);
        setCredits(null);
        loadedCourseId.current = null;
        isLoadingData.current = false;
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
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title || !code || !professor || !endDate || credits === null || isNaN(credits)) return;
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
          homepage: { deadlines: [], tasks: [], resources: [], notes: "", announcements: [] },
          selectedType: selectedType!,
        };
        course = await addCourse(newCourseData);
        onAddCourse?.(course);
      }

      const events: { summary: string; start: Date; end: Date; allDay?: boolean }[] = [];

      if (endDate) {
        events.push({
          summary: `${title} - Course End`,
          start: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
          end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
          allDay: true,
        });
      }

      midterms.forEach((mt, i) => {
        if (mt.start && mt.end) {
          events.push({ summary: `${title} - Midterm ${i + 1}`, start: mt.start, end: mt.end });
        }
      });

      if (finalExam?.start && finalExam?.end) {
        events.push({ summary: `${title} - Final Exam`, start: finalExam.start, end: finalExam.end });
      }

      await Promise.all(
        events.map((evt) =>
          addCalendarEvent(
            evt.summary,
            evt.start,
            evt.end,
            evt.summary.toLowerCase().includes("exam") ? "exam" : "deadline",
            evt.allDay ?? false
          )
        )
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
    setMidterms([...midterms, { start: lastEnd, end: new Date(lastEnd.getTime() + 60 * 60 * 1000) }]);
  };

  const removeMidterm = (index: number) => setMidterms(midterms.filter((_, i) => i !== index));

  return (
    <TooltipProvider>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-end p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 translate-x-full"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-neutral-900  p-6 text-left shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-lg text-white font-nun font-semibold">
                      {isEditing ? "edit an existing course" : "add a new course"}
                    </Dialog.Title>
                    <div className="flex gap-2 items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="flex h-6 w-6 items-center justify-center rounded-md text-white hover:bg-gray-600/30 cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => e.target.files && handlePdfUpload(e.target.files[0])}
                            />
                            {isPdfLoading ? (
                              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Paperclip size={16} />
                            )}
                          </label>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-zinc-800 text-white/90 rounded-md text-xs font-dm p-2 mr-1 font-thin">
                          upload syllabus (beta NLP extraction)
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <CourseFormFields
                      title={title}
                      setTitle={setTitle}
                      code={code}
                      setCode={setCode}
                      professor={professor}
                      setProfessor={setProfessor}
                      profEmail={profEmail}
                      setProfEmail={setProfEmail}
                      selectedType={selectedType}
                      setSelectedType={setSelectedType}
                      description={description}
                      setDescription={setDescription}
                      officeHours={""}
                      setOfficeHours={function (value: string): void { throw new Error("Function not implemented."); }}
                    />

                    <div className="flex flex-col gap-2">
                      {(midterms || []).map((mt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <DateTimePicker
                            label={`midterm ${i + 1} date`}
                            selected={mt.start || null}
                            startTime={mt.start || undefined}
                            endTime={mt.end || undefined}
                            onChange={(_date, newStart, newEnd) => {
                              if (!newStart || !newEnd) return;
                              const newMidterms = [...midterms];
                              newMidterms[i] = { start: newStart, end: newEnd };
                              setMidterms(newMidterms);
                            }}
                            allDay={false}
                          />

                          <div className="flex gap-1">
                            {i === midterms.length - 1 && midterms.length < 2 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={addMidterm}
                                      className="h-6 w-6 mt-3 flex items-center justify-center rounded-[0.5em] ml-3 text-white text-sm transition-transform duration-200 hover:bg-zinc-600 hover:scale-105"
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
                              </TooltipProvider>
                            )}
                            {i > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => removeMidterm(i)}
                                      className="h-6 w-6 mt-3 flex items-center justify-center rounded-[0.5em] ml-3 text-white text-sm transition-transform duration-200 hover:bg-red-600 hover:scale-105"
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
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <DateTimePicker
                      label="final exam date"
                      selected={finalExam?.start || null}
                      startTime={finalExam?.start || undefined}
                      endTime={finalExam?.end || undefined}
                      onChange={(_date, newStart, newEnd) => {
                        if (!newStart || !newEnd) return;
                        setFinalExam({ start: newStart, end: newEnd });
                      }}
                      allDay={false}
                    />

                    <div className="flex flex-col gap-4 mt-4">
                      <div className="flex gap-4 items-end">
                        <DateTimePicker
                          label="course end date"
                          selected={endDate}
                          onChange={setEndDate}
                          allDay
                        />
                        <ColorPickerField
                          color={color}
                          setColor={setColor}
                          label="select course colour"
                        />

                        <div className="flex flex-col flex-1 ml-2">
                          <label className="text-sm text-gray-400 mb-1 font-mp">credits</label>
                          <input
                            type="number"
                            placeholder="2.00"
                            value={credits ?? ""}
                            onChange={(e) => setCredits(Number(e.target.value))}
                            className="w-20 p-2 h-9 bg-zinc-800 text-white font-dm rounded-[0.5em] placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting || isPdfLoading}
                          className="px-4 py-1 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-zinc-800 rounded-[0.50rem] font-dm text-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                        >
                          {isSubmitting
                            ? isEditing
                              ? "updating..."
                              : "adding..."
                            : isEditing
                            ? "update course"
                            : "add course"}
                        </button>
                      </div>
                    </div>
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
