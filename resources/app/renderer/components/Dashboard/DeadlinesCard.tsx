"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "@/services/core services/taskService";
import { getAllCourses } from "@/services/core services/courseService";
import { Task, Course } from "@/services/db";
import { ScrollArea } from "@/components/scroll-area";

export default function DeadlinesCard() {
  const navigate = useNavigate();
  const [deadlines, setDeadlines] = useState<Array<{ task: Task; course: Course | undefined }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [tasks, courses] = await Promise.all([
        getTasks({ completed: false }),
        getAllCourses(),
      ]);
      
      const now = new Date();
      const futureTasks = tasks.filter(task => new Date(task.deadline) > now);
      
      const soonestByCourse: Array<{ task: Task; course: Course | undefined }> = [];
      const grouped: Record<string, Task[]> = {};
      
      for (const t of futureTasks) {
        if (!grouped[t.courseId]) grouped[t.courseId] = [];
        grouped[t.courseId].push(t);
      }
      
      for (const courseId in grouped) {
        const soonest = grouped[courseId].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
        const course = courses.find(c => c.id === courseId);
        soonestByCourse.push({ task: soonest, course });
      }
      
      soonestByCourse.sort((a, b) => new Date(a.task.deadline).getTime() - new Date(b.task.deadline).getTime());
      setDeadlines(soonestByCourse);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.01, y: -1 }} transition={{ duration: 0.2 }} className="rounded-xl w-full">
      <Card className="h-96 sm:h-[22.5rem] bg-[#0f0f10ff] w-full rounded-lg">
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
                    className="flex flex-col border-b border-zinc-700/50 pb-1 p-1 rounded-lg hover:bg-zinc-800/30 cursor-pointer transition-colors"
                    onClick={() => {
                      if (course) {
                        navigate(`/tasks/${task.id}`);
                      }
                    }}
                  >
                    <span className="font-semibold text-white/90 text-sm">{task.title}</span>
                    <span className="text-xs text-neutral-400">
                      {course?.title ? `${course.title} — ` : ""}
                      {new Date(task.deadline).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {", " + new Date(task.deadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
