"use client";

import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Paperclip, Plus, Minus } from "react-feather";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@radix-ui/react-tooltip";
import { Course } from "@/services/db";
import { updateCourse } from "@/services/core services/courseService";
import DateTimePicker from "./DatePickerComponent";
import { addCalendarEvent } from "@/lib/helpers/calendarHelpers";

interface AddDatesDialogProps {
  isOpen: boolean;
  onUpdateCourse?: (course: Course) => void;
  onClose: () => void;
  existingCourse: Course;
  midterms: { start: Date | null; end: Date | null }[];
  setMidterms: React.Dispatch<React.SetStateAction<{ start: Date | null; end: Date | null }[]>>;
  finalExam: { start: Date | null; end: Date | null } | null;
  setFinalExam: React.Dispatch<React.SetStateAction<{ start: Date | null; end: Date | null } | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
}


export default function AddDatesDialog({
  isOpen,
  onUpdateCourse,
  onClose,
  existingCourse,
  midterms,
  setMidterms,
  finalExam,
  setFinalExam,
  endDate,
  setEndDate,
}: AddDatesDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // No local state for midterms/finalExam/endDate; use props only

  const handlePdfUpload = async (file: File) => {
    setIsPdfLoading(true);
    try {
      if (window.electronAPI) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode(...uint8Array));
        const result = await window.electronAPI.extractCourseFromPDF(base64String);
        if (result.success) {
          const data = result.course;
          // Handle extracted data if needed
        }
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
    if (!midterms.length || !finalExam?.start) return;

    setIsSubmitting(true);
    try {
      const courseData: Partial<Course> = {
        endsOn: endDate ?? undefined,
        midterms: midterms.filter(mt => mt.start && mt.end).map((mt) => ({ start: mt.start!, end: mt.end! })),
        finalExamDate: finalExam.start ?? undefined,
      };

      await updateCourse(existingCourse.id, courseData);

      const updatedCourse = { ...existingCourse, ...courseData, updatedOn: new Date() };
      onUpdateCourse?.(updatedCourse);

      const events: { summary: string; start: Date; end: Date; allDay?: boolean }[] = [];

      if (endDate) {
        events.push({
          summary: `${existingCourse.title} - Course End`,
          start: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
          end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1),
          allDay: true,
        });
      }

      midterms.forEach((mt, i) => {
        if (mt.start && mt.end) {
          events.push({
            summary: `${existingCourse.title} - Midterm ${i + 1}`,
            start: mt.start,
            end: mt.end,
          });
        }
      });

      if (finalExam?.start && finalExam?.end) {
        events.push({
          summary: `${existingCourse.title} - Final Exam`,
          start: finalExam.start,
          end: finalExam.end,
        });
      }

      if (window.electronAPI) {
        await Promise.all(
          events.map((evt) =>
            addCalendarEvent(evt.summary, evt.start, evt.end, "exam", evt.allDay ?? false)
          )
        );
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
    const now = new Date();
    setMidterms([...midterms, { start: now, end: new Date(now.getTime() + 2 * 60 * 60 * 1000) }]);
  };

  const removeMidterm = (index: number) => setMidterms(midterms.filter((_, i) => i !== index));

  return (
    <TooltipProvider>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-neutral-900 p-6 text-left shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-lg text-white font-nun font-semibold">
                      {`${existingCourse.title} - Important Dates`}
                    </Dialog.Title>
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

                  <div className="mt-4 space-y-4">
                    <div className="flex flex-col gap-2">
                      {midterms.map((mt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <DateTimePicker
                            label={`Midterm ${i + 1}`}
                            selected={mt.start ?? null}
                            startTime={mt.start ?? undefined}
                            endTime={mt.end ?? undefined}
                            onChange={(_d, newStart, newEnd) => {
                              const newMidterms = [...midterms];
                              newMidterms[i] = { start: newStart ?? null, end: newEnd ?? null };
                              setMidterms(newMidterms);
                            }}
                            allDay={false}
                          />
                          <div className="flex gap-1">
                            {i === midterms.length - 1 && midterms.length < 2 && (
                              <button
                                type="button"
                                onClick={addMidterm}
                                className="h-6 w-6 mt-3 flex items-center justify-center rounded-[0.5em] ml-3 text-white text-sm transition-transform duration-200 hover:bg-zinc-600 hover:scale-105"
                              >
                                <Plus size={18} />
                              </button>
                            )}
                            {i > 0 && (
                              <button
                                type="button"
                                onClick={() => removeMidterm(i)}
                                className="h-6 w-6 mt-3 flex items-center justify-center rounded-[0.5em] ml-3 text-white text-sm transition-transform duration-200 hover:bg-red-600 hover:scale-105"
                              >
                                <Minus size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <DateTimePicker
                      label="Final Exam"
                      selected={finalExam?.start ?? null}
                      startTime={finalExam?.start ?? undefined}
                      endTime={finalExam?.end ?? undefined}
                      onChange={(_d, newStart, newEnd) => {
                        if (!newStart || !newEnd) return;
                        setFinalExam({ start: newStart, end: newEnd });
                      }}
                      allDay={false}
                    />

                    <DateTimePicker
                      label="Course End Date"
                      selected={endDate ?? null}
                      onChange={setEndDate}
                      allDay
                    />

                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isPdfLoading}
                        className="px-4 py-1 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-zinc-800 rounded-[0.50rem] font-dm text-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        {isSubmitting ? "saving..." : "save dates"}
                      </button>
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
