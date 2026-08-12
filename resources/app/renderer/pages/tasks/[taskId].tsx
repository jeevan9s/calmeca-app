"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Plus,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MDXEditor, MDXEditorMethods } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "../../styles/mdx-editor.css";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertThematicBreak,
  ListsToggle,
  BlockTypeSelect,
} from "@mdxeditor/editor";

import Layout from "@/renderer/components/Layout";
import { ScrollArea } from "@/components/scroll-area";
import {
  getTaskById,
  updateTask,
} from "../../../services/core services/taskService";
import {
  createSubTask,
  getSubTasksByTask,
  toggleSubTaskCompletion,
  deleteSubTask,
} from "../../../services/core services/subtaskService";
import { getCourseById } from "../../../services/core services/courseService";
import SubtaskComponent from "../../components/SubtaskComponent";
import { Task } from "../../../services/db";
import type { SubTask, Course } from "../../../services/db";
import { CheckSquare, Square } from "react-feather";

const btnClass =
  "flex items-center font-thin justify-center gap-1.5 bg-zinc-800/50 rounded-xl text-white font-dm h-9 text-xs cursor-pointer transition-colors duration-300 hover:bg-zinc-700 focus:ring-1 focus:ring-zinc-500 focus:ring-opacity-50 px-3 w-full";

const inputClass =
  "w-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm h-10 px-4 text-sm focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all placeholder:text-gray-500";

export default function TaskHomepage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [toolbarPage, setToolbarPage] = useState(0);

  useEffect(() => {
    loadTaskData();
  }, [taskId]);

  const loadTaskData = async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      const taskData = await getTaskById(taskId);
      if (taskData) {
        setTask(taskData);
        setNotes(taskData.notes || "");

        const courseData = await getCourseById(taskData.courseId);
        setCourse(courseData || null);

        const subtaskData = await getSubTasksByTask(taskId);
        setSubtasks(subtaskData);
      }
    } catch (error) {
      console.error("Error loading task data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotesChange = async (markdown: string) => {
    setNotes(markdown);
    if (!task) return;

    try {
      setIsSavingNotes(true);
      await updateTask(task.id, { notes: markdown });
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !taskId || !task) return;

    try {
      await createSubTask({
        taskId,
        courseId: task.courseId,
        title: newSubtaskTitle.trim(),
        completed: false,
      });

      setNewSubtaskTitle("");
      setShowAddSubtask(false);
      await loadTaskData();
    } catch (error) {
      console.error("Error creating subtask:", error);
    }
  };

  const handleToggleTask = async () => {
    if (!task) return;

    try {
      await updateTask(task.id, { completed: !task.completed });
      setTask({ ...task, completed: !task.completed });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const toolbarPages = [
    [<UndoRedo key="undo" />, <BoldItalicUnderlineToggles key="format" />],
    [<BlockTypeSelect key="blocks" />, <ListsToggle key="lists" />],
    [<CreateLink key="link" />, <InsertThematicBreak key="break" />],
  ];

  const currentToolbarContent = toolbarPages[toolbarPage] || toolbarPages[0];
  const totalPages = toolbarPages.length;

  const nextToolbarPage = () => {
    setToolbarPage((prev) => (prev + 1) % totalPages);
  };

  const prevToolbarPage = () => {
    setToolbarPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const isOverdue = (deadline: Date) => {
    return new Date() > new Date(deadline);
  };

  const formattedHeaderDate = task?.deadline
    ? new Date(task.deadline)
        .toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .toUpperCase()
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950/70 text-white w-full overflow-hidden">
        <Layout>
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
          </div>
        </Layout>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-zinc-950/70 text-white w-full overflow-hidden">
        <Layout>
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-white font-dm mb-2">
                task not found
              </h1>
              <button
                onClick={() => navigate("/")}
                className="text-zinc-400 hover:text-white flex items-center gap-2 mx-auto font-dm transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                return to dashboard
              </button>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  const overdue = task.deadline
    ? isOverdue(task.deadline) && !task.completed
    : false;

  return (
    <div className="min-h-screen bg-zinc-950/70 text-white w-full overflow-hidden">
      <Layout>
        <ScrollArea className="h-screen p-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
          >
            <div className="mb-6">
              <motion.h2
                className="font-dm text-neutral-400 text-sm ml-1 flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <button
                  onClick={() => navigate(`/courses/${course?.id || ""}`)}
                  className="text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors font-dm cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 cursor-pointer" />
                  back to course
                </button>
              </motion.h2>

              <motion.div
                className="flex items-center gap-3 mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <button
                  onClick={handleToggleTask}
                  className="transition-all duration-300 hover:scale-105 !cursor:pointer z-50"
                >
                  {task.completed ? (
                    <CheckSquare className="h-6 w-6 text-white cursor-pointer" />
                  ) : (
                    <Square className="h-6 w-6 text-zinc-500 hover:text-white cursor-pointer" />
                  )}
                </button>
                <h1
                  className={`font-dm font-bold text-2xl sm:text-3xl lg:text-4xl ${
                    task.completed ? "text-zinc-500 line-through" : "text-white"
                  }`}
                >
                  {task.title}
                </h1>
                {overdue && (
                  <span className="px-2 py-0.5 border border-zinc-700 text-zinc-400 rounded-full text-xs font-dm">
                    overdue
                  </span>
                )}
              </motion.div>

              {course && (
                <motion.div
                  className="flex items-center gap-2 mt-3 ml-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: course.color ?? "#ffffff" }}
                  />{" "}
                  <span className="text-sm font-medium text-zinc-400 font-dm">
                    {course.title}
                  </span>
                </motion.div>
              )}

              <motion.div
                className="flex items-center gap-4 text-sm text-zinc-500 font-dm mt-2 ml-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(task.deadline)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {task.type}
                </div>
              </motion.div>

              {task.summary && (
                <motion.p
                  className="text-zinc-300 font-dm mt-3 text-sm ml-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  {task.summary}
                </motion.p>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-400 font-dm flex items-center gap-2 tracking-wide">
                    <FileText className="h-4 w-4" />
                    notes
                  </h2>
                  {isSavingNotes && (
                    <span className="text-xs text-zinc-500 font-dm">
                      saving...
                    </span>
                  )}
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mdx-editor-dark">
                  <MDXEditor
                    markdown={notes}
                    onChange={handleNotesChange}
                    plugins={[
                      headingsPlugin(),
                      listsPlugin(),
                      quotePlugin(),
                      thematicBreakPlugin(),
                      markdownShortcutPlugin(),
                      toolbarPlugin({
                        toolbarContents: () => (
                          <div className="flex items-center justify-between w-full">
                            <button
                              onClick={prevToolbarPage}
                              className="p-1 hover:bg-zinc-800 rounded transition-colors"
                              type="button"
                            >
                              <ChevronLeft className="h-4 w-4 text-zinc-400" />
                            </button>

                            <div className="flex items-center gap-2">
                              {currentToolbarContent}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-500 font-dm">
                                {toolbarPage + 1}/{totalPages}
                              </span>
                              <button
                                onClick={nextToolbarPage}
                                className="p-1 hover:bg-zinc-800 rounded transition-colors"
                                type="button"
                              >
                                <ChevronRight className="h-4 w-4 text-zinc-400" />
                              </button>
                            </div>
                          </div>
                        ),
                      }),
                    ]}
                    contentEditableClassName="min-h-[300px] p-4 bg-neutral-950 !text-white font-dm font-thin prose prose-sm prose-invert max-w-none focus:outline-none"
                    placeholder="start taking notes for this task..."
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1 items-start justify-between">
                  <h2 className="text-sm font-semibold mb-2 text-zinc-400 font-dm tracking-wide">
                    subtasks ({subtasks.length})
                  </h2>
                  <button
                    onClick={() => setShowAddSubtask(true)}
                    className={`${btnClass} w-auto`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    add subtask
                  </button>
                </div>

                <AnimatePresence>
                  {showAddSubtask && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 overflow-hidden"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="enter subtask title..."
                          className={inputClass}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddSubtask();
                            } else if (e.key === "Escape") {
                              setShowAddSubtask(false);
                              setNewSubtaskTitle("");
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleAddSubtask}
                          className={`${btnClass} w-auto`}
                        >
                          add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddSubtask(false);
                            setNewSubtaskTitle("");
                          }}
                          className={`${btnClass} w-auto bg-zinc-800/50 hover:bg-zinc-800`}
                        >
                          cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {subtasks.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 font-dm">
                      <div className="text-sm mb-1">no subtasks yet</div>
                      <div className="text-xs">
                        break down this task into smaller steps
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {subtasks.map((subtask) => (
                        <motion.div
                          key={subtask.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-zinc-900 rounded-xl border border-zinc-800 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={async () => {
                                await toggleSubTaskCompletion(subtask.id);
                                loadTaskData();
                              }}
                              className="transition-colors"
                            >
                              {subtask.completed ? (
                                <Check className="h-4 w-4 text-white" />
                              ) : (
                                <div className="h-4 w-4 rounded border border-zinc-600 hover:border-white" />
                              )}
                            </button>
                            <span
                              className={`flex-1 font-dm text-sm ${subtask.completed ? "text-zinc-500 line-through" : "text-white"}`}
                            >
                              {subtask.title}
                            </span>
                            <button
                              onClick={async () => {
                                await deleteSubTask(subtask.id);
                                loadTaskData();
                              }}
                              className="text-zinc-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </ScrollArea>
      </Layout>
    </div>
  );
}
