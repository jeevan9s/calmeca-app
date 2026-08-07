"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/card";
import { Button } from "@/components/button";
import AddTaskDialog from "./addTaskDialog";
import { Trash2, Edit2, AlertCircle, Plus, Filter, Check } from "lucide-react";
import { getTasks, toggleTaskCompletion, deleteTask } from "@/services/core services/taskService";
import { Task, SubTask } from "@/services/db";
import { differenceInCalendarDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Checkbox } from "@/components/checkbox";
import { getSubTasksByTask } from "@/services/core services/subtaskService";

const MAX_TASKS_LIMIT = 100;

export default function TasksCard({ courseTitle, courseId, code }: { courseTitle: string; courseId: string; code: string; }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "today" | "tomorrow" | "overdue">("all");
  const [taskSubtasks, setTaskSubtasks] = useState<Record<string, SubTask[]>>({});

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await getTasks();
      const courseTasks = fetchedTasks.filter(task => task.courseId === courseId);
      setTasks(courseTasks);
      
      const subtasksMap: Record<string, SubTask[]> = {};
      for (const task of courseTasks) {
        const subtasks = await getSubTasksByTask(task.id);
        subtasksMap[task.id] = subtasks;
      }
      setTaskSubtasks(subtasksMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubtasksChange = (taskId: string, subtasks: SubTask[]) => {
    setTaskSubtasks(prev => ({
      ...prev,
      [taskId]: subtasks
    }));
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [courseId]);

  const handleToggle = async (task: Task) => {
    await toggleTaskCompletion(task.id);
    fetchTasks();
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
    fetchTasks();
  };

  const handleClear = async () => {
    const courseTasks = tasks.filter(task => task.courseId === courseId);
    await Promise.all(courseTasks.map(task => deleteTask(task.id)));
    fetchTasks();
  };

  const getDeadlineLabel = (task: Task) => {
    if (!task.deadline) return "no date";
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diff = differenceInCalendarDays(deadline, now);
    const timeStr = deadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedDate = format(deadline, "EEE, MMM d");

    if (diff === 0) return `today at ${timeStr}`;
    if (diff === 1) return `tomorrow at ${timeStr}`;
    if (diff < 0 && !task.completed) return `overdue - ${formattedDate}`;
    return `${formattedDate} at ${timeStr}`;
  };

  const isOverdue = (task: Task) => {
    if (!task.deadline || task.completed) return false;
    return new Date() > new Date(task.deadline);
  };

  const overdueTasks = tasks.filter(task => isOverdue(task));
  
  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    if (filter === "today") {
      if (!task.deadline) return false;
      return differenceInCalendarDays(new Date(task.deadline), new Date()) === 0;
    }
    if (filter === "tomorrow") {
      if (!task.deadline) return false;
      return differenceInCalendarDays(new Date(task.deadline), new Date()) === 1;
    }
    if (filter === "overdue") {
      return isOverdue(task);
    }
    return true;
  });

  const handleOpenAddDialog = () => {
    if (tasks.length >= MAX_TASKS_LIMIT) {
      alert(`Task limit reached. You cannot have more than ${MAX_TASKS_LIMIT} tasks per course.`);
      return;
    }
    setTaskToEdit(null); 
    setIsDialogOpen(true);
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.01, y: -1 }} transition={{ duration: 0.2 }} className="rounded-xl w-full">
        <Card className="h-[36em] bg-[#0f0f10ff] w-full rounded-[1.25em] flex flex-col border border-zinc-800/60 shadow-sm">
          
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <div className="flex flex-col min-w-0">
              <CardTitle className="font-dm text-base font-semibold leading-tight">tasks</CardTitle>
              <CardDescription className="text-white/40 font-dm text-xs truncate">
                organization for {code}
                {overdueTasks.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                    {overdueTasks.length} overdue
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                className="flex items-center gap-1.5 cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-white font-dm text-sm h-9 px-3 transition-colors"
                onClick={handleOpenAddDialog}
              >
                <Plus size={14} /> add task
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button className="flex items-center cursor-pointer gap-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-white font-dm text-sm h-9 px-3 transition-colors">
                    <Filter size={14} /> filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl w-44 shadow-xl">
                  <div className="flex flex-col gap-1">
                    {(["all", "completed", "pending", "today", "tomorrow", "overdue"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-dm transition-colors ${
                          filter === type 
                            ? "bg-zinc-800 text-white font-medium" 
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {tasks.length > 0 && (
                <Button
                  className="bg-zinc-800/50 cursor-pointer hover:bg-red-950/50 border border-zinc-700/50 hover:border-red-900/50 text-zinc-400 hover:text-red-400 rounded-xl font-dm h-9 px-2.5 transition-colors text-xs"
                  onClick={handleClear}
                  title="clear all tasks"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-2 pt-0 overflow-hidden flex flex-col">
            <ScrollArea className="h-full pr-1">
              {loading ? (
                <div className="space-y-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="border border-zinc-800 bg-zinc-800/30 p-3 rounded-xl animate-pulse space-y-2">
                      <div className="h-3 w-32 bg-zinc-700/60 rounded" />
                      <div className="h-2.5 w-20 bg-zinc-700/40 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-2 py-4 rounded-2xl border border-dashed border-zinc-800/80 h-full">
                  <AlertCircle size={20} className="text-neutral-500" />
                  <p className="text-neutral-400 text-sm font-dm">
                    no tasks added yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => handleToggle(task)}
                      className={`flex items-center gap-2.5 border p-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                        task.completed 
                          ? "bg-zinc-900/40 border-zinc-800/40 opacity-75 hover:opacity-100" 
                          : "bg-zinc-800/30 hover:bg-zinc-800/60 border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      <div 
                        role="checkbox"
                        aria-checked={task.completed}
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(task);
                        }}
                        className={`w-4 h-4 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer ${
                          task.completed 
                            ? "bg-white border border-white text-zinc-900 shadow-sm" 
                            : "bg-zinc-900/50 border border-zinc-700/60 hover:border-zinc-600 text-transparent"
                        }`}
                      >
                        <Check size={10} strokeWidth={3} className={`transition-transform duration-200 ${task.completed ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
                      </div>
                      
                      <div
                        className="flex-1 cursor-pointer flex items-center justify-between min-w-0 gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tasks/${task.id}`);
                        }}
                      >
                        <span className={`font-dm text-sm truncate transition-colors duration-200 ${
                          task.completed 
                            ? "line-through text-white/40" 
                            : isOverdue(task)
                              ? "text-red-300 font-medium"
                              : "text-white/90"
                        }`}>
                          {task.title}
                        </span>
                        <span className={`text-xs font-dm flex-shrink-0 ${
                          isOverdue(task) ? "text-red-400 font-medium" : "text-white/40"
                        }`}>
                          {getDeadlineLabel(task)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-950/50 rounded-xl cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task);
                          }}
                          title="delete task"
                        >
                          <Trash2 size={13} />
                        </Button>

                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700/50 cursor-pointer rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToEdit(task);
                            setIsDialogOpen(true);
                          }}
                          title="edit task"
                        >
                          <Edit2 size={13} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      <AddTaskDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setTaskToEdit(null);
        }}
        onTaskAdded={fetchTasks}
        taskToEdit={taskToEdit ?? undefined}
        courseId={courseId}
      />
    </>
  );
}