"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Plus, Minus, Trash2, Upload } from "react-feather";
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
import { createTask, getTasks, updateTask } from "@/services/core services/taskService";
import {
  CourseSemester,
  DEFAULT_COURSE_SEMESTER,
  getSemesterEndDate,
  normalizeCourseSemester,
} from "@/lib/helpers/semester";
import { COURSES_UPDATED_EVENT } from "@/lib/events";
import CourseFormFields from "./CourseFormFields";
import { EventDateTimeField } from "../DateField";
import ColorPickerField from "./ColourPickerField";
import { addCalendarEvent } from "@/lib/helpers/calendarHelpers";
import { PDFService } from "../../../../integrations/extract/parse";
import { ExtractionService } from "../../../../integrations/extract/extract";
import type { ExtractedCourse } from "../../../../integrations/extract/schema";

const parser = new PDFService();
const extractor = new ExtractionService();

const CALENDAR_EVENTS_UPDATED_EVENT = "calmeca:calendar-events-updated";

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

  const [hasLabTime, setHasLabTime] = useState(false);
  const [labStartTime, setLabStartTime] = useState<Date | null>(null);
  const [labEndTime, setLabEndTime] = useState<Date | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState("none");
  const [customDays, setCustomDays] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>("default");
  const [customTaskType, setCustomTaskType] = useState("");
  const [semester, setSemester] = useState<CourseSemester>(DEFAULT_COURSE_SEMESTER);
  const [extractedEvents, setExtractedEvents] = useState<ExtractedCourse["events"]>([]);
  const [pdfMessage, setPdfMessage] = useState("");
  const [pdfStage, setPdfStage] = useState<"idle" | "parsing" | "extracting">(
    "idle",
  );

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
          setSemester(normalizeCourseSemester(latest.semester));

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
      setHasLabTime(false);
      setLabStartTime(null);
      setLabEndTime(null);
      setRecurring(false);
      setRecurrence("none");
      setCustomDays("");
      setSelectedTaskType("default");
      setCustomTaskType("");
      setSemester(DEFAULT_COURSE_SEMESTER);
      setExtractedEvents([]);
      setPdfMessage("");
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
        setSemester(DEFAULT_COURSE_SEMESTER);
        setExtractedEvents([]);
        setPdfMessage("");
        loadedCourseId.current = null;
        isLoadingData.current = false;
        setActivePicker(null);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!existingCourse) return;
    if (!confirm("are you sure you want to delete this course?")) return;
    setIsDeleting(true);
    try {
      await deleteCourse(existingCourse.id);
      onDeleteCourse?.(existingCourse.id);
      window.dispatchEvent(new Event(COURSES_UPDATED_EVENT));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const parseExtractedDateTime = (
    dateStr: string | null,
    timeStr: string | null,
    fallbackTime: string,
  ): Date | null => {
    if (!dateStr) return null;
    const parsed = new Date(`${dateStr}T${timeStr ?? fallbackTime}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeDayToken = (day: string): string => {
    const cleaned = day.trim().toLowerCase();
    const map: Record<string, string> = {
      monday: "Mon",
      mon: "Mon",
      tuesday: "Tue",
      tue: "Tue",
      tues: "Tue",
      wednesday: "Wed",
      wed: "Wed",
      thursday: "Thu",
      thu: "Thu",
      thur: "Thu",
      thurs: "Thu",
      friday: "Fri",
      fri: "Fri",
      saturday: "Sat",
      sat: "Sat",
      sunday: "Sun",
      sun: "Sun",
    };
    return map[cleaned] ?? day.trim();
  };

  const splitAndNormalizeDays = (value: string): string[] => {
    return value
      .split(/,|\/|&|\band\b|-+/i)
      .map((part) => normalizeDayToken(part))
      .filter((part) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(part));
  };

  const toByDayToken = (day: string): string | null => {
    const cleaned = day.trim().toLowerCase();
    const map: Record<string, string> = {
      monday: "MO",
      mon: "MO",
      tuesday: "TU",
      tue: "TU",
      tues: "TU",
      wednesday: "WE",
      wed: "WE",
      thursday: "TH",
      thu: "TH",
      thur: "TH",
      thurs: "TH",
      friday: "FR",
      fri: "FR",
      saturday: "SA",
      sat: "SA",
      sunday: "SU",
      sun: "SU",
    };
    return map[cleaned] ?? null;
  };

  const splitDayOfWeekTokens = (value: string): string[] => {
    return value
      .split(/,|\/|&|\band\b|-+/i)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  };

  const applyExtractionToForm = (extracted: ExtractedCourse) => {
    if (extracted.title?.trim()) setTitle(extracted.title.trim());
    if (extracted.code?.trim()) setCode(extracted.code.trim());
    if (extracted.description?.trim()) setDescription(extracted.description.trim());
    if (typeof extracted.credits === "number") setCredits(extracted.credits);

    if (extracted.courseEmail?.trim()) {
      // Existing form stores the primary contact email in profEmail.
      setProfEmail(extracted.courseEmail.trim());
    }

    if (extracted.semester) {
      setSemester(normalizeCourseSemester(extracted.semester.toLowerCase()));
    }

    setExtractedEvents(extracted.events ?? []);

    const taskEvents = extracted.events.filter(
      (event) =>
        event.type === "assignment" ||
        event.type === "lab" ||
        event.type === "tutorial",
    );

    const recurringTaskEvents = taskEvents.filter(
      (event) => event.recurring || Boolean(event.dayOfWeek?.trim()),
    );

    if (taskEvents.length > 0) {
      setRecurring(true);

      const primaryTask = recurringTaskEvents[0] ?? taskEvents[0];
      if (primaryTask.type === "assignment") {
        setSelectedTaskType("problem set");
      } else if (primaryTask.type === "lab") {
        setSelectedTaskType("lab");
      } else {
        setSelectedTaskType("tutorial");
      }

      const normalizedDayTokens = Array.from(
        new Set(
          (recurringTaskEvents.length > 0 ? recurringTaskEvents : taskEvents)
            .flatMap((event) =>
              event.dayOfWeek?.trim()
                ? splitAndNormalizeDays(event.dayOfWeek)
                : [],
            ),
        ),
      );

      if (normalizedDayTokens.length > 0) {
        const combinedDays = normalizedDayTokens.join(", ");
        const knownRepeatOptions = new Set([
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
          "Mon, Wed",
          "Tue, Thu",
          "Mon, Wed, Fri",
        ]);

        setCustomDays(combinedDays);
        if (knownRepeatOptions.has(combinedDays)) {
          setRecurrence("weekly");
        } else {
          setRecurrence("custom");
        }
      } else if (recurringTaskEvents.length > 0) {
        setRecurrence("weekly");
        setCustomDays("");
      } else {
        setRecurrence("none");
        setCustomDays("");
      }
    }

    const extractedMidterms = extracted.events
      .filter((event) => event.type === "midterm")
      .map((event) => {
        const start = parseExtractedDateTime(event.date, event.startTime, "00:00");
        const end = parseExtractedDateTime(
          event.date,
          event.endTime ?? event.startTime,
          "01:00",
        );
        return start && end ? { start, end } : null;
      })
      .filter((event): event is { start: Date; end: Date } => Boolean(event));

    if (extractedMidterms.length > 0) {
      setMidterms(extractedMidterms.slice(0, 2));
    }

    const extractedFinal = extracted.events.find((event) => event.type === "final");
    if (extractedFinal) {
      const start = parseExtractedDateTime(
        extractedFinal.date,
        extractedFinal.startTime,
        "00:00",
      );
      const end = parseExtractedDateTime(
        extractedFinal.date,
        extractedFinal.endTime ?? extractedFinal.startTime,
        "01:00",
      );

      if (start && end) {
        setFinalExam({ start, end });
      }
    }
  };

  const handlePDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setPdfFile(file);
    setExtractedEvents([]);
    setPdfMessage(`processing: ${file.name}`);
    setPdfStage("parsing");
    setIsPdfLoading(true);

    try {
      const parsed = await parser.parse(file);
      setPdfStage("extracting");
      setPdfMessage(
        `parsed ${parsed.pageCount} page${parsed.pageCount === 1 ? "" : "s"}: ${file.name}`,
      );
      const extracted = await extractor.extract(parsed.text, {
        timeoutMs: 15000,
        maxChars: 24000,
      });
      applyExtractionToForm(extracted);
      setPdfMessage(`extracted and populated form: ${file.name}`);
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : "";
      if (message.includes("timed out")) {
        setPdfMessage(`extraction timed out (15s). try a smaller syllabus section.`);
      } else {
        setPdfMessage(`failed to parse: ${file.name}`);
      }
      console.error("failed to parse selected PDF", parseError);
    } finally {
      setIsPdfLoading(false);
      setPdfStage("idle");
      inputEl.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !code.trim()) return;
    setIsSubmitting(true);

    try {
      const courseData: Partial<Course> = {
        title,
        code,
        professor,
        profEmail,
        type: selectedType!,
        description,
        color,
        semester,
        midterms: midterms
          .filter((mt) => mt.start && mt.end)
          .map((mt) => ({ start: mt.start!, end: mt.end! })),
        finalExamDate: finalExam?.start ?? undefined,
        finalExamEndDate: finalExam?.end ?? undefined,
        icon: courseIcon || null,
        credits: credits ?? 0,
      };

      let course: Course;

      const createExtractedTasksForCourse = async (courseId: string) => {
        const extractedTaskEvents = extractedEvents.filter(
          (event) =>
            event.type === "assignment" ||
            event.type === "lab" ||
            event.type === "tutorial",
        );

        if (extractedTaskEvents.length === 0) return;

        const existingTasks = await getTasks({ courseId });

        await Promise.all(
          extractedTaskEvents.map(async (event) => {
            const type: TaskType =
              event.type === "assignment"
                ? "problem set"
                : event.type === "lab"
                  ? "lab"
                  : "tutorial";

            const hasRecurringHint =
              event.recurring || Boolean(event.dayOfWeek?.trim());

            const deadline = event.date
              ? parseExtractedDateTime(
                  event.date,
                  event.endTime ?? event.startTime,
                  "23:59",
                )
              : null;

            const byDayTokens = event.dayOfWeek
              ? splitDayOfWeekTokens(event.dayOfWeek)
                  .map((token) => toByDayToken(token))
                  .filter((token): token is string => Boolean(token))
              : [];

            const recurrenceRule = hasRecurringHint
              ? `FREQ=WEEKLY${byDayTokens.length > 0 ? `;BYDAY=${byDayTokens.join(",")}` : ""}`
              : "none";

            const normalizedTitle = event.title?.trim() || `${type} task`;
            const mappedSummary = [
              event.location ? `location: ${event.location}` : null,
              typeof event.weight === "number" ? `weight: ${event.weight}%` : null,
            ]
              .filter((part): part is string => Boolean(part))
              .join(" | ");

            const duplicate = existingTasks.find((task) => {
              const sameTitle = task.title.trim().toLowerCase() === normalizedTitle.toLowerCase();
              const sameType = task.type === type;
              const sameRecurring = Boolean(task.recurring) === hasRecurringHint;
              const sameRecurrence = (task.reccurrence || "none") === recurrenceRule;
              const taskTime = task.deadline ? new Date(task.deadline).getTime() : null;
              const eventTime = deadline ? deadline.getTime() : null;
              const sameDeadline = taskTime === eventTime;
              return sameTitle && sameType && sameRecurring && sameRecurrence && sameDeadline;
            });

            if (duplicate) {
              return;
            }

            const createdTask = await createTask({
              courseId,
              title: normalizedTitle,
              summary: mappedSummary || undefined,
              type,
              reccurrence: recurrenceRule,
              recurring: hasRecurringHint,
              deadline: deadline ?? undefined,
            });

            if (deadline) {
              const createdCalendarEvent = await addCalendarEvent(
                event.title,
                deadline,
                deadline,
                "deadline",
                false,
                recurrenceRule,
              );

              if (createdCalendarEvent?.id) {
                await updateTask(createdTask.id, {
                  googleCalendarEventId: createdCalendarEvent.id,
                });
              }
            }
          }),
        );
      };

      if (isEditing && existingCourse) {
        await updateCourse(existingCourse.id, courseData);
        course = { ...existingCourse, ...courseData, updatedOn: new Date() };
        await createExtractedTasksForCourse(existingCourse.id);
        onUpdateCourse?.(course);
      } else {
        const newCourseData: Omit<
          Course,
          "id" | "createdOn" | "updatedOn" | "updatedFrom" | "archived"
        > = {
          title: title || "",
          code: code || "",
          professor: professor || "",
          profEmail,
          description,
          color,
          type: selectedType,
          icon: courseIcon || null,
          semester,
          midterms:
            midterms
              .filter((mt) => mt.start && mt.end)
              .map((mt) => ({ start: mt.start!, end: mt.end! })) || [],
          credits: credits ?? 0,
          finalExamDate: finalExam?.start ?? undefined,
          finalExamEndDate: finalExam?.end ?? undefined,
          resources: [],
          tasks: [],
        };
        course = await addCourse(newCourseData);
        await createExtractedTasksForCourse(course.id);

        onAddCourse?.(course);
      }

      window.dispatchEvent(new Event(COURSES_UPDATED_EVENT));

      const events: {
        summary: string;
        start: Date;
        end: Date;
        allDay?: boolean;
      }[] = [];

      const semesterEndDate = getSemesterEndDate(semester);
      events.push({
        summary: `${title} - course end`,
        start: semesterEndDate,
        end: semesterEndDate,
        allDay: true,
      });

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

      if (events.length > 0) {
        window.dispatchEvent(new Event(CALENDAR_EVENTS_UPDATED_EVENT));
      }

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

  const pdfStageText =
    pdfStage === "parsing"
      ? "reading and parsing pages"
      : pdfStage === "extracting"
        ? "extracting course details"
        : "";

  const pdfProgress =
    pdfStage === "parsing" ? 45 : pdfStage === "extracting" ? 85 : 0;

  const semesterEndLabel = getSemesterEndDate(semester).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <TooltipProvider>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <div className="fixed inset-0 overflow-y-auto no-scrollbar">
            <div className="flex min-h-screen items-start justify-end p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 translate-x-full"
              >
                <Dialog.Panel className="w-full min-h-screen max-w-5xl transform rounded-l-2xl bg-neutral-900 p-8 text-left shadow-2xl transition-all flex flex-col border-l border-y border-zinc-800">
                  <div className="sticky top-0 z-10 bg-neutral-900 flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                    <Dialog.Title className="text-xl text-white font-dm font-semibold">
                      {isEditing ? "edit course" : "add course"}
                    </Dialog.Title>
                    <div className="flex flex-col items-end gap-2">
                      <label
                        htmlFor="syllabus-upload"
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-dm text-white transition-all duration-300 ${
                          isPdfLoading
                            ? "cursor-not-allowed border-zinc-500/70 bg-zinc-700/40"
                            : "cursor-pointer border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700 hover:scale-105 hover:border-zinc-500"
                        }`}
                        aria-busy={isPdfLoading}
                      >
                        {isPdfLoading ? (
                          <span
                            className="h-3.5 w-3.5 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Upload size={14} />
                        )}
                        {isPdfLoading
                          ? "parsing syllabus..."
                          : "upload syllabus (.pdf)"}
                      </label>
                      <input
                        id="syllabus-upload"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        disabled={isPdfLoading}
                        onChange={handlePDF}
                      />
                      <p className="max-w-xs text-right text-xs font-dm text-zinc-400 ">
                        {pdfMessage ||
                          "attach your syllabus to extract its content"}
                      </p>
                      {isPdfLoading && (
                        <div className="w-full max-w-xs rounded-xl border border-zinc-600/70 bg-zinc-800/70 p-2">
                          <div className="mb-1 flex items-center justify-between text-[11px] font-dm text-zinc-300">
                            <span>{pdfStageText}</span>
                            <span>{pdfProgress}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-zinc-300 transition-all duration-500"
                              style={{ width: `${pdfProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 pr-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-2">
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
                          <label className="text-sm text-white ml-5 mb-2 font-dm font-thin mb-1 block">semester</label>

                          <div className="grid grid-cols-2 gap-4 px-4 items-center">

                            <div className="col-span-2 rounded-xl border border-zinc-700 bg-zinc-800/40 p-3">
                              <div className="flex items-center gap-2">

                                <button
                                  type="button"
                                  onClick={() => setSemester("fall")}
                                  className={`rounded-xl px-3 py-1.5 cursor-pointer text-sm font-dm transition-colors ${
                                    semester === "fall"
                                      ? "bg-zinc-200 text-zinc-900"
                                      : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                  }`}
                                >
                                  fall
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSemester("winter")}
                                  className={`rounded-xl px-3 py-1.5 cursor-pointer text-sm font-dm transition-colors ${
                                    semester === "winter"
                                      ? "bg-zinc-200 text-zinc-900"
                                      : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                  }`}
                                >
                                  winter
                                </button>
                                <span className="ml-auto text-xs font-dm text-zinc-400">
                                  ends {semesterEndLabel}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <ColorPickerField
                                color={color}
                                setColor={setColor}
                                label="select course colour"
                              />
                            </div>

                            <div className="flex flex-col ">
                              <label className="text-sm text-white mb-1 font-dm ">
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

                  <div className="sticky bottom-0 z-10 bg-neutral-900 flex items-center justify-between pt-6 border-t border-zinc-800 mt-6">
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
                        !code.trim()
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