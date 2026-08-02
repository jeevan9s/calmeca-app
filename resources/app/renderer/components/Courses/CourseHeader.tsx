"use client";

import { useState, useEffect } from "react";
import { Course } from "@/services/db";
import { Edit2 } from "lucide-react";
import AddCourseDialog from "./AddCourseDialog";
import AddDatesDialog from "./AddExamDialog";
import { format, differenceInDays, differenceInCalendarDays } from "date-fns";
import * as LucideIcons from "lucide-react";

interface CourseHeaderProps {
  course: Course;
  onUpdateCourse: (updatedCourse: Course) => void;
}


export default function CourseHeader({ course, onUpdateCourse }: CourseHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);

  // Shared state for midterms, finalExam, endDate
  const [midterms, setMidterms] = useState<{ start: Date | null; end: Date | null }[]>([]);
  const [finalExam, setFinalExam] = useState<{ start: Date | null; end: Date | null } | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Sync state with course prop
  useEffect(() => {
    setMidterms(
      (course.midterms?.map((mt: { start: string | Date | null; end: string | Date | null }) => ({
        start: mt.start ? new Date(mt.start) : null,
        end: mt.end ? new Date(mt.end) : null,
      })) || [])
    );
    setFinalExam(
      course.finalExamDate
        ? { start: new Date(course.finalExamDate), end: new Date(course.finalExamDate) }
        : null
    );
    setEndDate(course.endsOn ? new Date(course.endsOn) : null);
  }, [course.id]);

  const getCourseProgress = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 8, 3);
    const end = course.endsOn;
    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(now, start);
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  const iconName =
    typeof course.icon === "string"
      ? course.icon.charAt(0).toUpperCase() + course.icon.slice(1)
      : null;
  const IconComponent = iconName && typeof LucideIcons[iconName as keyof typeof LucideIcons] === "function"
    ? (LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>)
    : null;

  const getNextExamInfo = () => {
    const now = new Date();
    const upcomingMidterms = course.midterms?.filter(mt => new Date(mt.start) > now) || [];
    const nextMidterm = upcomingMidterms.length ? upcomingMidterms[0] : null;
    const daysUntilMidterm = nextMidterm ? differenceInCalendarDays(new Date(nextMidterm.start), now) : null;
    const finalExamDate = course.finalExamDate ? new Date(course.finalExamDate) : null;
    const daysUntilFinal = finalExamDate ? differenceInCalendarDays(finalExamDate, now) : null;
    return { daysUntilMidterm, daysUntilFinal };
  };

  const progress = getCourseProgress();
  const { daysUntilMidterm, daysUntilFinal } = getNextExamInfo();

  const handleOpenEdit = () => setIsEditOpen(true);
  const handleCloseEdit = () => setIsEditOpen(false);

  const handleOpenEditDate = () => setIsEditDateOpen(true);
  const handleCloseEditDate = () => setIsEditDateOpen(false);

  return (
    <div
      className="flex justify-between items-start w-full py-6 px-6"
      style={{
        borderLeft: `7px solid ${course.color}`,
        marginTop: '-32px', 
        paddingTop: '48px',  
      }}
    >
      <div className="flex flex-col gap-2 max-w-[60%]">
       <div className="flex items-center gap-3">
  {IconComponent && <IconComponent size={12} className="text-white w-8 h-8 flex-shrink-0 mt-1" />}
  <h1 className="text-4xl font-nun font-bold leading-tight break-words">
    {course.title}
  </h1>
</div>

<div className="mt-3 flex flex-col gap-1">

        <p className="text-sm text-gray-300">{course.code} • Professor {course.professor}</p>
{course.description && (
  <p className="text-sm text-gray-400 flex items-center gap-2">
    {course.description}
    <button
      onClick={handleOpenEdit}
      className="p-1 rounded hover:bg-zinc-700 transition-all "
      title="Edit course"
    >
      <Edit2 size={15} color="white" />
    </button>
  </p>
)}

</div>

      </div>

      <div className="flex flex-col items-end text-gray-400 mr-1">
        <div className="text-gray-200 text-[0.9em] flex flex-col items-end">
          <span className="mb-1">
            <span className="font-semibold">{course.credits?.toFixed(2) || 0}</span> credits
            <span className="mx-3">|</span>
            <span className="font-semibold">{progress.toFixed(0)}%</span> complete
            <span className="mx-3">|</span>
            ends on <span className="font-semibold">{course.endsOn ? format(new Date(course.endsOn), "MMM d, yyyy") : "—"}</span>
          </span>

          <div className="flex gap-3 mt-2">
            {daysUntilMidterm !== null && (
              <span className="px-3 py-1 bg-zinc-700 text-white font-thin text-sm rounded-full font-dm transition-transform duration-200 cursor-pointer hover:scale-105">
                <span className="font-bold">{daysUntilMidterm}</span> day{daysUntilMidterm !== 1 ? "s" : ""} until next midterm
              </span>
            )}
            {daysUntilFinal !== null && (
              <span className="px-3 py-1 bg-zinc-800 text-white text-sm font-thin rounded-full font-dm transition-transform duration-200 cursor-pointer hover:scale-105">
                <span className="font-bold">{daysUntilFinal}</span> day{daysUntilFinal !== 1 ? "s" : ""} until final exam
              </span>
            )}

                <button
      onClick={handleOpenEditDate}
      className="p-1 rounded hover:bg-zinc-700 transition-all "
      title="Edit course important dates"
    >
      <Edit2 size={15} color="white" />
    </button>
          </div>
        </div>
      </div>

      <AddCourseDialog
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        existingCourse={course}
        onUpdateCourse={(updatedCourse) => {
          onUpdateCourse(updatedCourse);
          handleCloseEdit();
        }}
        midterms={midterms}
        setMidterms={setMidterms}
        finalExam={finalExam}
        setFinalExam={setFinalExam}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <AddDatesDialog
        isOpen={isEditDateOpen}
        onClose={handleCloseEditDate}
        existingCourse={course}
        onUpdateCourse={(updatedCourse) => {
          onUpdateCourse(updatedCourse);
          handleCloseEditDate();
        }}
        midterms={midterms}
        setMidterms={setMidterms}
        finalExam={finalExam}
        setFinalExam={setFinalExam}
        endDate={endDate}
        setEndDate={setEndDate}
      />
    </div>
  );
}
