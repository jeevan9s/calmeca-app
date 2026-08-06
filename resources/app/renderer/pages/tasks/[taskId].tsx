import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, FileText, Plus, Check, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MDXEditor, MDXEditorMethods } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import '../../styles/mdx-editor.css';
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
    BlockTypeSelect
} from '@mdxeditor/editor';

import { getTaskById, updateTask } from '../../../services/core services/taskService';
import { createSubTask, getSubTasksByTask, toggleSubTaskCompletion, deleteSubTask } from '../../../services/core services/subtaskService';
import { getCourseById } from '../../../services/core services/courseService';
import SubtaskComponent from '../../components/SubtaskComponent';
import { Task } from '../../../services/db';
import type { SubTask, Course } from '../../../services/db';

export default function TaskHomepage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [subtasks, setSubtasks] = useState<SubTask[]>([]);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [showAddSubtask, setShowAddSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
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
                setNotes(taskData.notes || '');
                
                const courseData = await getCourseById(taskData.courseId);
                setCourse(courseData || null);
                
                const subtaskData = await getSubTasksByTask(taskId);
                setSubtasks(subtaskData);
            }
        } catch (error) {
            console.error('Error loading task data:', error);
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
            console.error('Error saving notes:', error);
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
                completed: false
            });
            
            setNewSubtaskTitle('');
            setShowAddSubtask(false);
            await loadTaskData(); 
        } catch (error) {
            console.error('Error creating subtask:', error);
        }
    };

    const handleToggleTask = async () => {
        if (!task) return;
        
        try {
            await updateTask(task.id, { completed: !task.completed });
            setTask({ ...task, completed: !task.completed });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const toolbarPages = [
        // Page 1: Basic formatting
        [<UndoRedo key="undo" />, <BoldItalicUnderlineToggles key="format" />],
        // Page 2: Structure
        [<BlockTypeSelect key="blocks" />, <ListsToggle key="lists" />],
        // Page 3: Advanced
        [<CreateLink key="link" />, <InsertThematicBreak key="break" />]
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white/5 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-white/5 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">task Not found</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-500 flex items-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        return to dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950/70">
            <div className="max-w-4xl mx-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate(`/courses/${course?.id || ''}`)}
                        className="text-white/60 hover:text-white flex items-center gap-2 mb-4 transition-colors font-dm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        back to course
                    </button>
                    
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={handleToggleTask}
                                    className="transition-colors"
                                >
                                    {task.completed ? (
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <Circle className="h-6 w-6 text-white/60 hover:text-white" />
                                    )}
                                </button>
                                <h1 className={`text-3xl font-bold font-dm ${
                                    task.completed 
                                        ? 'text-white/60 line-through' 
                                        : task.deadline && isOverdue(task.deadline)
                                            ? 'text-red-300'
                                            : 'text-white'
                                }`}>
                                    {task.title}
                                </h1>
                                {task.deadline && isOverdue(task.deadline) && !task.completed && (
                                    <AlertTriangle className="h-6 w-6 text-red-400" />
                                )}
                            </div>
                            
                            {course && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: course.color }}
                                    />
                                    <span className="text-sm font-medium text-white/60 font-dm">
                                        {course.title}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-white/60 font-dm">
                                <div className={`flex items-center gap-1 ${task.deadline && isOverdue(task.deadline) && !task.completed ? 'text-red-400' : ''}`}>
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(task.deadline)}
                                    {task.deadline && isOverdue(task.deadline) && !task.completed && (
                                        <span className="ml-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-dm">
                                            OVERDUE
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {task.type}
                                </div>
                            </div>
                            
                            {task.description && (
                                <p className="text-white font-dm mt-3">
                                    {task.description}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white font-dm flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                notes
                            </h2>
                            {isSavingNotes && (
                                <span className="text-sm text-white/60 font-dm">saving...</span>
                            )}
                        </div>
                        
                        <div 
                            className="bg-neutral-800 dark:bg-gray-800 rounded-xl overflow-hidden mdx-editor-dark"
                            style={{
                                '--mdx-editor-toolbar-bg': '#18181b',
                                '--mdx-editor-toolbar-border': '#27272a',
                                '--mdx-editor-button-bg': '#27272a',
                                '--mdx-editor-button-hover': '#3f3f46'
                            } as React.CSSProperties}
                        >
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
                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                    type="button"
                                                >
                                                    <ChevronLeft className="h-4 w-4 text-white" />
                                                </button>
                                                
                                                <div className="flex items-center gap-2">
                                                    {currentToolbarContent}
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-white/60 font-dm">
                                                        {toolbarPage + 1}/{totalPages}
                                                    </span>
                                                    <button
                                                        onClick={nextToolbarPage}
                                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                                        type="button"
                                                    >
                                                        <ChevronRight className="h-4 w-4 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                ]}
                                contentEditableClassName="min-h-[300px] p-4 text-white prose prose-sm dark:prose-invert max-w-none focus:outline-none"
                                placeholder="start taking notes for this task..."
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white font-dm">
                                subtasks ({subtasks.length})
                            </h2>
                            <motion.button
                                onClick={() => setShowAddSubtask(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-white/60 text-black rounded-xl text-sm font-dm"
                                whileHover={{ 
                                    scale: 1.05, 
                                    boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)",
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Plus className="h-4 w-4" />
                                </motion.div>
                                add subtask
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {showAddSubtask && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    transition={{ 
                                        duration: 0.3, 
                                        ease: "easeInOut",
                                        height: { duration: 0.4 }
                                    }}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-hidden"
                                >
                                    <motion.div 
                                        className="flex gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, duration: 0.3 }}
                                    >
                                        <motion.input
                                            type="text"
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            placeholder="Enter subtask title..."
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 font-dm"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddSubtask();
                                                } else if (e.key === 'Escape') {
                                                    setShowAddSubtask(false);
                                                    setNewSubtaskTitle('');
                                                }
                                            }}
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.15, duration: 0.2 }}
                                            whileFocus={{ 
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                            autoFocus
                                        />
                                        <motion.button
                                            onClick={handleAddSubtask}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-dm"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.2 }}
                                            whileHover={{ 
                                                scale: 1.05, 
                                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                                                transition: { duration: 0.2 }
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            add
                                        </motion.button>
                                        <motion.button
                                            onClick={() => {
                                                setShowAddSubtask(false);
                                                setNewSubtaskTitle('');
                                            }}
                                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors font-dm"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.25, duration: 0.2 }}
                                            whileHover={{ 
                                                scale: 1.05,
                                                backgroundColor: "rgba(255, 255, 255, 0.4)",
                                                transition: { duration: 0.2 }
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Cancel
                                        </motion.button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            {subtasks.length === 0 ? (
                                <div className="text-center py-8 text-white/60 font-dm">
                                    <div className="text-lg mb-2">no subtasks yet</div>
                                    <div className="text-sm">break down this task into smaller steps</div>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {subtasks.map((subtask) => (
                                        <motion.div
                                            key={subtask.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3"
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
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <div className="h-4 w-4 rounded border border-white/60 hover:border-white" />
                                                    )}
                                                </button>
                                                <span className={`flex-1 font-dm ${subtask.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                                                    {subtask.title}
                                                </span>
                                                <button
                                                    onClick={async () => {
                                                        await deleteSubTask(subtask.id);
                                                        loadTaskData();
                                                    }}
                                                    className="text-red-500 hover:text-red-400 transition-colors"
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
            </div>
        </div>
    );
}