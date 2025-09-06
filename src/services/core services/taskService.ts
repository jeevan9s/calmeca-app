import { Task, db } from '../db';
import { generateId, updateTimestamp, updateCourseFromChild } from '../integrations-utils/utilityServicies';
import { addEvent, updateEvent, deleteEvent } from './calendarService';
import { getCourseColor } from '../integrations-utils/utilityServicies';

type TaskFilter = {
  courseId?: string;
  completed?: boolean;
  upcomingDays?: number;
  overdue?: boolean;
};

// CREATE
export const createTask = async (task: Omit<Task, 'id' | 'completed' | 'color'>) => {
  const newTask: Task = {
    ...task,
    id: generateId(),
    completed: false,
    color: await getCourseColor(task.courseId),
  };

  await db.tasks.add(newTask);

  await addEvent({
    title: newTask.title,
    date: newTask.deadline,
    source: 'task',
    sourceId: newTask.id,
  });

  await updateCourseFromChild(newTask.courseId, 'task');

  return newTask;
};

// READ
export const getTaskById = async (id: string) => {
  return await db.tasks.get(id);
};

export const getTasks = async (filter?: TaskFilter) => {
  let collection = db.tasks.toCollection();

  if (filter?.courseId) {
    collection = collection.filter((t) => t.courseId === filter.courseId);
  }

  if (filter?.completed !== undefined) {
    collection = collection.filter((t) => t.completed === filter.completed);
  }

  const now = new Date();

  if (filter?.upcomingDays !== undefined) {
    const future = new Date();
    future.setDate(future.getDate() + filter.upcomingDays);
    collection = collection.filter((t) => t.deadline >= now && t.deadline <= future && !t.completed);
  }

  if (filter?.overdue) {
    collection = collection.filter((t) => t.deadline < now && !t.completed);
  }

  return collection.toArray();
};

// UPDATE
export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  await db.tasks.update(id, updates);
  await updateTimestamp('tasks', id);

  const updatedTask = await db.tasks.get(id);
  if (!updatedTask) return;

  await updateCourseFromChild(updatedTask.courseId, 'task');

  // Update calendar event if title or deadline changed
  await updateEvent(updatedTask.id, {
    title: updatedTask.title,
    date: updatedTask.deadline,
  });
};

// DELETE
export const deleteTask = async (id: string) => {
  const task = await db.tasks.get(id);
  if (!task) return;

  await db.tasks.delete(id);
  await deleteEvent(task.id);
  await updateCourseFromChild(task.courseId, 'task');
};

// COMPLETION TOGGLE
export const toggleTaskCompletion = async (id: string) => {
  const task = await getTaskById(id);
  if (!task) throw new Error('Task not found');

  await db.tasks.update(id, { completed: !task.completed });
  return db.tasks.get(id);
};
