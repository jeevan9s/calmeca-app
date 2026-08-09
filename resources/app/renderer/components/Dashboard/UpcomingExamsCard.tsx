"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/card";
import { Task, CalendarEvent } from "@/services/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/dialog";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/scroll-area";
import { getTasks } from "@/services/core services/taskService";
import { getCourseById, getAllCourses } from "@/services/core services/courseService";
import { fetchGoogleCalendarEvents } from "@/services/google";

type ExamItem = {
  id: string;
  title: string;
  deadline: Date;
  courseName?: string;
  type: string;
  description?: string;
  source: 'database' | 'calendar';
  location?: string;
};

const formatEventDate = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } else if (isSameDay(date, tomorrow)) {
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    return `Tomorrow, ${weekday}`;
  } else {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
};

export default function UpcomingExamsCard() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const now = new Date();
        const [allTasks, allCourses] = await Promise.all([
          getTasks(),
          getAllCourses()
        ]);

        const examTasks = allTasks.filter(task => 
          (task.type === 'exam' || task.type === 'quiz') && 
          task.deadline >= now && 
          !task.completed
        );

        const databaseExams = await Promise.all(
          examTasks.map(async (exam): Promise<ExamItem> => {
            try {
              const course = await getCourseById(exam.courseId);
              return {
                id: exam.id,
                title: exam.title,
                deadline: exam.deadline,
                courseName: course?.title || course?.code || 'Unknown Course',
                type: exam.type,
                description: exam.description,
                source: 'database'
              };
            } catch {
              return {
                id: exam.id,
                title: exam.title,
                deadline: exam.deadline,
                courseName: 'Unknown Course',
                type: exam.type,
                description: exam.description,
                source: 'database'
              };
            }
          })
        );

        let calendarExams: ExamItem[] = [];
        try {
          const calendarEvents: CalendarEvent[] = await fetchGoogleCalendarEvents();
          
          if (calendarEvents && calendarEvents.length > 0) {
            const keywordRegex = /(exam|midterm|quiz|test|final)/i;
            const examEvents = calendarEvents.filter(event => 
              keywordRegex.test(event.summary || '') && 
              new Date(event.start) >= now
            );

            calendarExams = examEvents.map((event): ExamItem => {
              const matchedCourse = allCourses.find(course => 
                event.summary?.toLowerCase().includes(course.title?.toLowerCase() || '') ||
                event.summary?.toLowerCase().includes(course.code?.toLowerCase() || '')
              );

              return {
                id: event.id,
                title: event.summary || 'Untitled Exam',
                deadline: new Date(event.start),
                courseName: matchedCourse?.title || matchedCourse?.code || '',
                type: 'exam',
                description: event.description,
                location: event.location,
                source: 'calendar'
              };
            });
          }
        } catch (error) {
          console.error('Failed to fetch Google Calendar events:', error);
        }

        const combinedExams = [...databaseExams, ...calendarExams];
        
        const uniqueExams = combinedExams.filter((exam, index, arr) => {
          return !arr.slice(0, index).some(otherExam => 
            exam.title.toLowerCase() === otherExam.title.toLowerCase() &&
            Math.abs(exam.deadline.getTime() - otherExam.deadline.getTime()) < 60 * 60 * 1000 
          );
        });

        uniqueExams.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

        setExams(uniqueExams);
      } catch (error) {
        console.error('Error loading exams:', error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadExams();
  }, []);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  };

  return (
    <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }} className="rounded-lg flex-1">
      <Card className="h-44 sm:h-48 bg-zinc-400/10 w-full rounded-xl">
        <CardHeader>
          <CardTitle className="font-dm">midterms & exams</CardTitle>
          <CardDescription className="text-white/50 font-dm">upcoming exams</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-2">
            <div className="flex flex-col gap-2">
              {loading ? (
                <p className="text-neutral-400 text-sm font-dm">loading...</p>
              ) : exams.length === 0 ? (
                <p className="text-neutral-400 text-sm font-dm">no upcoming exams</p>
              ) : (
                exams.map((exam) => (
                  <Dialog key={exam.id}>
                    <DialogTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col text-sm text-white/80 font-dm border-b border-zinc-700/50 pb-1 -mt-1 p-1 rounded-lg hover:bg-zinc-800/30 cursor-pointer"
                      >
                        <span className="font-semibold">{exam.title}</span>
                        <span className="text-xs text-neutral-400">
                          {exam.courseName ? `${exam.courseName} • ` : ''}{formatEventDate(exam.deadline)}
                          {isToday(exam.deadline) ? ` - ${exam.deadline.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
                        </span>
                      </motion.div>
                    </DialogTrigger>

                    <DialogContent className="bg-zinc-900 border-none text-white rounded-[1em]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold font-dm">{exam.title}</DialogTitle>
                        <DialogDescription className="text-neutral-400 text-sm font-dm">
                          <div className="space-y-1">
                            <p><span className="font-semibold">Course:</span> {exam.courseName}</p>
                            <p><span className="font-semibold">Type:</span> {exam.type}</p>
                            <p><span className="font-semibold">Date:</span> {exam.deadline.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}</p>
                            <p><span className="font-semibold">Time:</span> {exam.deadline.toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}</p>
                            {exam.location && (
                              <p><span className="font-semibold">Location:</span> {exam.location}</p>
                            )}
                            {exam.description && (
                              <p className="mt-2"><span className="font-semibold">Description:</span> {exam.description}</p>
                            )}
                            <div className="mt-2 pt-2 border-t border-zinc-700">
                              <span className="text-xs text-neutral-500">
                                Source: {exam.source === 'database' ? 'App Tasks' : 'Google Calendar'}
                              </span>
                            </div>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
