import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, X } from 'react-feather';
import { SubTask } from '@/services/db';
import { createSubTask, updateSubTask, deleteSubTask, toggleSubTaskCompletion } from '@/services/core services/subtaskService';

interface SubtaskComponentProps {
  taskId: string;
  courseId: string;
  subtasks: SubTask[];
  onSubtasksChange: (subtasks: SubTask[]) => void;
}

export default function SubtaskComponent({
  taskId,
  courseId,
  subtasks,
  onSubtasksChange,
}: SubtaskComponentProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      const subtask = await createSubTask({
        title: newSubtaskTitle.trim(),
        taskId,
        courseId,
        completed: false,
      });

      onSubtasksChange([...subtasks, subtask]);
      setNewSubtaskTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const handleToggleComplete = async (subtaskId: string) => {
    try {
      await toggleSubTaskCompletion(subtaskId);
      const updatedSubtasks = subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      onSubtasksChange(updatedSubtasks);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubTask(subtaskId);
      onSubtasksChange(subtasks.filter(st => st.id !== subtaskId));
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleUpdateTitle = async (subtaskId: string, title: string) => {
    if (!title.trim()) return;

    try {
      await updateSubTask(subtaskId, { title: title.trim() });
      const updatedSubtasks = subtasks.map(st =>
        st.id === subtaskId ? { ...st, title: title.trim() } : st
      );
      onSubtasksChange(updatedSubtasks);
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300 font-nun">subtasks</h4>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="p-1 hover:bg-zinc-700 rounded transition-colors font-dm"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </motion.button>
      </div>

      <AnimatePresence>
        {subtasks.map((subtask) => (
          <motion.div
            key={subtask.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 group"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleToggleComplete(subtask.id)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                subtask.completed
                  ? 'bg-green-600 border-green-600'
                  : 'border-gray-400 hover:border-gray-300'
              }`}
            >
              {subtask.completed && <Check className="w-3 h-3 text-white" />}
            </motion.button>

            <input
              type="text"
              value={subtask.title}
              onChange={(e) => handleUpdateTitle(subtask.id, e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-sm transition-colors ${
                subtask.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-300 hover:text-white focus:text-white'
              }`}
              placeholder="Subtask title..."
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDeleteSubtask(subtask.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900 rounded transition-all"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded border-2 border-gray-400" />
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddSubtask();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewSubtaskTitle('');
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-300 placeholder-gray-500"
              placeholder="add a subtask..."
              autoFocus
            />
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddSubtask}
                className="p-1 hover:bg-green-900 rounded transition-colors"
              >
                <Check className="w-3 h-3 text-green-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewSubtaskTitle('');
                }}
                className="p-1 hover:bg-red-900 rounded transition-colors"
              >
                <X className="w-3 h-3 text-red-400" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}