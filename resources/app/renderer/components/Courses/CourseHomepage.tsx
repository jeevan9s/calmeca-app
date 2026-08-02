"use client";

import { useState, useEffect } from "react";
import FloatingActionButton from "../FloatingActionButton";
import { Course, Task } from "@/services/db";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/scroll-area";
import Layout from "../Layout";
import {
  getTasks,
  createTask,
  toggleTaskCompletion,
  deleteTask,
} from "@/services/core services/taskService";
import CourseHeader from "./CourseHeader";
import UpcomingCourseEventsCard from "./upcomingDeadlinesCard";
import ResourceBay from "./ResourceBay";
import TasksCard from "./TasksCard";

interface CourseHomepageProps {
  course: Course;
  onUpdateCourse: (updatedCourse: Course) => void; 
  courseId: string;
}


export default function CourseHomepage({
  course,
  onUpdateCourse,
  courseId,
}: CourseHomepageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [deadline, setDeadline] = useState("");

  const fetchTasks = async () => {
    const courseTasks = await getTasks({ courseId: course.id });
    setTasks(courseTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [course.id]);

  const addTask = async () => {
    if (!newTask.trim() || !deadline) return;

    const created = await createTask({
      courseId: course.id,
      title: newTask,
      type: "homework",
      deadline: new Date(deadline),
    });

    setTasks((prev) => [...prev, created]);
    setNewTask("");
    setDeadline("");
    onUpdateCourse?.({ ...course, updatedOn: new Date() });
  };

  const toggleComplete = async (taskId: string) => {
    await toggleTaskCompletion(taskId);
    fetchTasks();
  };

  const removeTask = async (taskId: string) => {
    await deleteTask(taskId);
    fetchTasks();
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950/70 text-white">
      <Layout>
        <CourseHeader course={course} onUpdateCourse={onUpdateCourse} />

        <ScrollArea className="h-screen p-4">
          <motion.div
            className="flex flex-col xl:flex-row gap-6"
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex flex-col flex-1 gap-5">
              <UpcomingCourseEventsCard courseTitle={course.title} upcomingDays={7} />
              <ResourceBay course={course} />
            </motion.div>

            <motion.div className="flex flex-col flex-1 gap-5">
              <TasksCard courseTitle={course.title} courseId={course.id} />
            </motion.div>
          </motion.div>
        </ScrollArea>
        {/* FAB for course-specific quick add */}
        <div className="pointer-events-none">
          <div className="pointer-events-auto">
            {course.id && <FloatingActionButton courseId={course.id} />}
          </div>
        </div>
      </Layout>
    </div>
  );
}
