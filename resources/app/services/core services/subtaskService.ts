import { db, SubTask } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const createSubTask = async (subtaskData: Omit<SubTask, 'id'>): Promise<SubTask> => {
  const subtask: SubTask = {
    ...subtaskData,
    id: uuidv4(),
  };

  await db.subtasks.add(subtask);
  return subtask;
};

export const updateSubTask = async (id: string, updates: Partial<Omit<SubTask, 'id'>>): Promise<void> => {
  await db.subtasks.update(id, updates);
};

export const deleteSubTask = async (id: string): Promise<void> => {
  await db.subtasks.delete(id);
};

export const getSubTasksByTask = async (taskId: string): Promise<SubTask[]> => {
  return await db.subtasks.where('taskId').equals(taskId).toArray();
};

export const getSubTasksByCourse = async (courseId: string): Promise<SubTask[]> => {
  return await db.subtasks.where('courseId').equals(courseId).toArray();
};

export const toggleSubTaskCompletion = async (id: string): Promise<void> => {
  const subtask = await db.subtasks.get(id);
  if (subtask) {
    await updateSubTask(id, { completed: !subtask.completed });
  }
};