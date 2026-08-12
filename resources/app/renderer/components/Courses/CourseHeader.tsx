"use client";

import { useState, useEffect } from "react";
import { Course } from "@/services/db";
import { Edit2 } from "lucide-react";
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import AddCourseDialog from "./AddCourseDialog";
import { differenceInCalendarDays, differenceInDays, format } from "date-fns";
import {
  getSemesterEndDate,
  normalizeCourseSemester,
} from "@/lib/helpers/semester";

interface CourseHeaderProps {
  course: Course;
  onUpdateCourse: (updatedCourse: Course) => void;
}
export default function CourseHeader({ course, onUpdateCourse }: CourseHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [midterms, setMidterms] = useState<{ start: Date | null; end: Date | null }[]>([]);
  const [finalExam, setFinalExam] = useState<{ start: Date | null; end: Date | null } | null>(null);

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
  }, [course.id]);

  const iconName =
    typeof course.icon === "string"
      ? course.icon.includes("-")
        ? course.icon.toLowerCase()
        : course.icon.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
      : null;
  const courseIconElement = iconName ? (
    <DynamicIcon
      name={iconName as IconName}
      size={12}
      className="text-white w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 mt-1"
    />
  ) : null;

  const getNextExamInfo = () => {
    const now = new Date();
    const upcomingMidterms = course.midterms?.filter(mt => new Date(mt.start) > now) || [];
    const nextMidterm = upcomingMidterms.length ? upcomingMidterms[0] : null;
    const daysUntilMidterm = nextMidterm ? differenceInCalendarDays(new Date(nextMidterm.start), now) : null;
    const finalExamDate = course.finalExamDate ? new Date(course.finalExamDate) : null;
    const daysUntilFinal = finalExamDate ? differenceInCalendarDays(finalExamDate, now) : null;
    return { daysUntilMidterm, daysUntilFinal };
  };

  const getCourseProgress = (): number | null => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 8, 3);
    const end = getSemesterEndDate(normalizeCourseSemester(course.semester), now);
    const totalDays = differenceInDays(end, start);
    if (!totalDays) return null;
    const elapsedDays = differenceInDays(now, start);
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  const progress = getCourseProgress();
  const semesterEnd = getSemesterEndDate(normalizeCourseSemester(course.semester));
  const { daysUntilMidterm, daysUntilFinal } = getNextExamInfo();

  const handleOpenEdit = () => setIsEditOpen(true);
  const handleCloseEdit = () => setIsEditOpen(false);

  const hasUpcomingExam = daysUntilMidterm !== null || daysUntilFinal !== null;

  return (
    <div
      className="relative flex flex-col md:flex-row md:justify-between md:items-start gap-6 w-full ml-2 py-6 pl-6 pr-4 sm:pl-8 sm:pr-6"
      style={{
        marginTop: '-32px',
        paddingTop: '48px',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 sm:left-0 top-0 bottom-5 w-1 h-32rounded-full"
        style={{
          background: `linear-gradient(180deg, ${course.color} 0%, ${course.color}99 100%)`,
          boxShadow: `0 0 12px 0 ${course.color}66`,
        }}
      />

      <div className="flex flex-col gap-2 ml-3 w-full md:max-w-[60%]">
        <div className="flex items-center gap-3">
          {courseIconElement}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-dm font-bold leading-tight break-words">
            {course.title}
          </h1>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <h3 className="text-gray-300 font-dm sm:text-sm font-thin">
            {course.code} • Professor {course.professor}
          </h3>
          {course.description && (
            <p className="text-sm text-gray-400 flex items-start gap-2">
              <span className="flex-1">{course.description}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end text-gray-400 w-full md:w-auto md:mr-1">
        <div className="text-gray-200 text-[0.85em] sm:text-[0.9em] flex flex-col items-start md:items-end w-full">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-2">
              <span className="font-semibold">
                {progress !== null ? `${progress.toFixed(0)}%` : "—"}
              </span>
              complete
              {progress !== null && (
                <span className="w-16 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                  <span
                    className="block h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: course.color }}
                  />
                </span>
              )}
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span>
              ends on{" "}
              <span className="font-semibold">
                {format(semesterEnd, "MMM d, yyyy")}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {daysUntilMidterm !== null && (
              <span className="px-3 py-1 bg-zinc-700 text-white font-thin text-xs sm:text-sm rounded-full font-dm transition-transform duration-200 cursor-pointer hover:scale-105">
                <span className="font-bold">{daysUntilMidterm > 0}</span> day{daysUntilMidterm !== 1 ? "s" : ""} until next midterm
              </span>
            )}
            {daysUntilFinal !== null && (
              <span className="px-3 py-1 bg-zinc-800 text-white text-xs sm:text-sm font-thin rounded-full font-dm transition-transform duration-200 cursor-pointer hover:scale-105">
                <span className="font-bold">{daysUntilFinal > 0}</span> day{daysUntilFinal !== 1 ? "s" : ""} until final exam
              </span>
            )}
            {!hasUpcomingExam && (
              <span className="px-3 py-1 bg-zinc-800/60 text-gray-500 text-xs sm:text-sm font-thin rounded-xl font-dm border border-zinc-700/60">
                no upcoming exams
              </span>
            )}

            <button
              onClick={handleOpenEdit}
              className="p-1 rounded-lg hover:bg-zinc-700 transition-all cursor-pointer"
              title="edit course important dates"
              aria-label="edit course dates"
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
      />
    </div>
  );
}