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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/dialog";
import { Trash2, Edit2 } from "lucide-react";
import { getTasks, toggleTaskCompletion, deleteTask, clearTasks } from "@/services/core services/taskService";
import { Task, SubTask } from "@/services/db";
import { differenceInCalendarDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Checkbox } from "@/components/checkbox";
import SubtaskComponent from "../SubtaskComponent";
import { getSubTasksByTask } from "@/services/core services/subtaskService";

export default function TasksCard({ courseTitle, courseId }: { courseTitle: string; courseId: string }) {
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
      setTasks(fetchedTasks);
      
      // Load subtasks for each task
      const subtasksMap: Record<string, SubTask[]> = {};
      for (const task of fetchedTasks) {
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
  }, []);

  const handleToggle = async (task: Task) => {
    await toggleTaskCompletion(task.id);
    fetchTasks();
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
    fetchTasks();
  };

  const handleClear = async () => {
    await clearTasks();
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

  return (
    <>
      <motion.div whileHover={{ scale: 1.01, y: -1 }} transition={{ duration: 0.2 }} className="rounded-xl w-full">
        <Card className="h-[36em] bg-[#0f0f10ff] w-full rounded-xl flex flex-col">
          
          <CardHeader className="flex flex-row items-left justify-between gap-2 flex-nowrap">
            <div className="flex flex-col">
              <CardTitle className="font-dm">tasks</CardTitle>
              <CardDescription className="text-white/50 font-dm">
                task organization
                {overdueTasks.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                    {overdueTasks.length} overdue
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="relative w-full flex items-center h-10">
              <div className="absolute left-0 flex items-center gap-2">
                <Button
                  className="flex items-center gap-2 sm:w-64 bg-zinc-800 rounded-xl text-white font-dm h-10 px-4 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-zinc-700 hover:text-white focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 active:scale-95"
                  onClick={() => { setTaskToEdit(null); setIsDialogOpen(true); }}
                >
                  add task
                </Button>
                <Button
                  className="bg-zinc-800 hover:bg-red-900 transition-transform duration-200 ease-in-out hover:scale-105 rounded-xl text-white font-dm h-10 px-3"
                  onClick={handleClear}
                >
                  clear tasks
                </Button>
              </div>
              <div className="absolute right-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="bg-zinc-800 rounded-xl text-white font-dm h-10 px-4 hover:bg-zinc-700">
                      filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-zinc-900 border-none p-2 rounded-xl w-56">
                    <div className="flex flex-col gap-2">
                      <Button variant={filter === "all" ? "default" : "outline"} className="bg-zinc-800 rounded-xl text-white font-dm w-full" onClick={() => setFilter("all")}>all</Button>
                      <Button variant={filter === "completed" ? "default" : "outline"} className="bg-zinc-800 rounded-xl text-white font-dm w-full" onClick={() => setFilter("completed")}>completed</Button>
                      <Button variant={filter === "pending" ? "default" : "outline"} className="bg-zinc-800 rounded-xl text-white font-dm w-full" onClick={() => setFilter("pending")}>pending</Button>
                      <Button variant={filter === "today" ? "default" : "outline"} className="bg-zinc-800 rounded-xl text-white font-dm w-full" onClick={() => setFilter("today")}>today</Button>
                      <Button variant={filter === "tomorrow" ? "default" : "outline"} className="bg-zinc-800 rounded-xl text-white font-dm w-full" onClick={() => setFilter("tomorrow")}>tomorrow</Button>
                      <Button variant={filter === "overdue" ? "default" : "outline"} className="bg-red-800 rounded-xl text-white font-dm w-full" onClick={() => setFilter("overdue")}>overdue</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            <ScrollArea className="h-full flex flex-col gap-2">
              {loading ? (
                <p className="text-neutral-400 text-sm">loading...</p>
              ) : filteredTasks.length === 0 ? (
                <p className="text-neutral-400 text-sm italic font-dm">no tasks yet</p>
              ) : (
                filteredTasks.map((task) => (
                  <Dialog key={task.id}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggle(task)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex-1 border p-2 rounded-xl hover:bg-zinc-800/50 cursor-pointer flex justify-between items-center ${
                          isOverdue(task) 
                            ? 'border-red-500/50 bg-red-500/5' 
                            : 'border-zinc-700/50'
                        }`}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <span className={`font-dm ${
                          task.completed 
                            ? "line-through text-white/60" 
                            : isOverdue(task)
                              ? "text-red-300"
                              : "text-white"
                        }`}>
                          {task.title}
                        </span>
                        <span className={`text-xs ml-2 font-dm ${
                          isOverdue(task) ? "text-red-400" : "text-white/60"
                        }`}>
                          {getDeadlineLabel(task)}
                        </span>
                      </motion.div>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 rounded-xl px-2 py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          •••
                        </Button>
                      </DialogTrigger>
                    </div>

                    <DialogContent className="bg-zinc-900 border-none text-white rounded-[1em]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-dm leading-tight">{task.title}</DialogTitle>
                        <DialogDescription className="text-neutral-400 text-sm font-dm">
                          {task.deadline ? `due: ${getDeadlineLabel(task)}` : "no deadline set"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 space-y-2">
                        {task.description && (
                          <p className={`${task.completed ? "line-through " : "text-neutral-300"} text-sm`}>
                            {task.description}
                          </p>
                        )}
                        <SubtaskComponent
                          taskId={task.id}
                          courseId={task.courseId}
                          subtasks={taskSubtasks[task.id] || []}
                          onSubtasksChange={(subtasks) => handleSubtasksChange(task.id, subtasks)}
                        />
                      </div>
                      <div className="mt-4 flex justify-between gap-2">
                        <Button 
                          className="flex items-center rounded-xl gap-1 font-dm text-sm bg-blue-700 hover:bg-blue-600 transition-transform duration-200 ease-in-out hover:scale-105" 
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          View Full Task
                        </Button>
                        <div className="flex gap-2">
                          <Button className="flex items-center rounded-xl gap-1 font-dm text-sm bg-zinc-700 hover:bg-zinc-600 transition-transform duration-200 ease-in-out hover:scale-105" onClick={() => { setTaskToEdit(task); setIsDialogOpen(true); }}>
                            <Edit2 size={14} /> edit
                          </Button>
                          <Button className="flex items-center gap-1 rounded-xl font-dm text-sm bg-red-700 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-red-900" onClick={() => handleDelete(task)}>
                            <Trash2 size={14} /> delete
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      <AddTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onTaskAdded={fetchTasks}
        taskToEdit={taskToEdit ?? undefined}
        courseId={taskToEdit?.courseId ?? courseId}
      />
    </>
  );
}
