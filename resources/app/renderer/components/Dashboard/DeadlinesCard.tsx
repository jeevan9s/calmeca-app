"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "@/services/core services/taskService";
import { getAllCourses } from "@/services/core services/courseService";
import { Task, Course } from "@/services/db";
import { ScrollArea } from "@/components/scroll-area";
import { Button } from "@/components/button";
import { Edit2 } from "react-feather";
import AddTaskDialog from "@/renderer/components/Courses/addTaskDialog";

export default function DeadlinesCard() {
  const navigate = useNavigate();
  const [deadlines, setDeadlines] = useState<Array<{ task: Task; course: Course | undefined }>>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [tasks, courses] = await Promise.all([
        getTasks({ completed: false }),
        getAllCourses(),
      ]);
      
      const now = new Date();
      const futureTasks = tasks.filter(task => task.deadline && new Date(task.deadline) > now);
      
      const soonestByCourse: Array<{ task: Task; course: Course | undefined }> = [];
      const grouped: Record<string, Task[]> = {};
      
      for (const t of futureTasks) {
        if (!grouped[t.courseId]) grouped[t.courseId] = [];
        grouped[t.courseId].push(t);
      }
      
      for (const courseId in grouped) {
        const soonest = grouped[courseId].sort((a, b) => {
          const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return aTime - bTime;
        })[0];
        const course = courses.find(c => c.id === courseId);
        soonestByCourse.push({ task: soonest, course });
      }
      
      soonestByCourse.sort((a, b) => {
        const aTime = a.task.deadline ? new Date(a.task.deadline).getTime() : Infinity;
        const bTime = b.task.deadline ? new Date(b.task.deadline).getTime() : Infinity;
        return aTime - bTime;
      });
      setDeadlines(soonestByCourse);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <motion.div whileHover={{ scale: 1.01, y: -1 }} transition={{ duration: 0.2 }} className="rounded-xl w-full">
        <Card className="h-96 sm:h-[22.5rem] bg-[#0f0f10ff] w-full rounded-lg font-dm">
          <CardHeader>
            <CardTitle>deadlines</CardTitle>
            <CardDescription>upcoming tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="flex flex-col gap-2">
                {loading ? (
                  <p className="text-neutral-400 text-sm">loading...</p>
                ) : deadlines.length === 0 ? (
                  <p className="text-neutral-400 text-sm">no upcoming deadlines</p>
                ) : (
                  deadlines.map(({ task, course }) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-2 border-b border-zinc-700/50 pb-1 p-1 rounded-lg hover:bg-zinc-800/30 transition-colors"
                    >
                      <button
                        type="button"
                        className="flex flex-col text-left flex-1 cursor-pointer"
                        onClick={() => {
                          if (course) {
                            navigate(`/tasks/${task.id}`);
                          }
                        }}
                      >
                        <span className="font-semibold text-white/90 text-sm">{task.title}</span>
                        <span className="text-xs text-neutral-400">
                          {course?.title ? `${course.title} - ` : ""}
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
                              ", " + new Date(task.deadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "no deadline"}
                        </span>
                      </button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg cursor-pointer"
                        onClick={() => {
                          setTaskToEdit(task);
                          setIsEditOpen(true);
                        }}
                        title="edit task"
                      >
                        <Edit2 size={13} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      <AddTaskDialog
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setTaskToEdit(null);
        }}
        onTaskAdded={async () => {
          setIsEditOpen(false);
          setTaskToEdit(null);
          await (async () => {
            setLoading(true);
            const [tasks, courses] = await Promise.all([
              getTasks({ completed: false }),
              getAllCourses(),
            ]);

            const now = new Date();
            const futureTasks = tasks.filter(task => task.deadline && new Date(task.deadline) > now);

            const soonestByCourse: Array<{ task: Task; course: Course | undefined }> = [];
            const grouped: Record<string, Task[]> = {};

            for (const t of futureTasks) {
              if (!grouped[t.courseId]) grouped[t.courseId] = [];
              grouped[t.courseId].push(t);
            }

            for (const courseId in grouped) {
              const soonest = grouped[courseId].sort((a, b) => {
                const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
                const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
                return aTime - bTime;
              })[0];
              const course = courses.find(c => c.id === courseId);
              soonestByCourse.push({ task: soonest, course });
            }

            soonestByCourse.sort((a, b) => {
              const aTime = a.task.deadline ? new Date(a.task.deadline).getTime() : Infinity;
              const bTime = b.task.deadline ? new Date(b.task.deadline).getTime() : Infinity;
              return aTime - bTime;
            });

            setDeadlines(soonestByCourse);
            setLoading(false);
          })();
        }}
        taskToEdit={taskToEdit ?? undefined}
      />
    </>
  );
}
