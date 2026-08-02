import { Task, db } from '../db';
import { generateId, updateTimestamp, updateCourseFromChild } from '../utilityServicies';
import { addEvent, updateEvent, deleteEvent } from './calendarService';
import { getCourseColor } from '../utilityServicies';

type TaskFilter = {
  courseId?: string;
  completed?: boolean;
  upcomingDays?: number;
  overdue?: boolean;
};

// CREATE
export const createTask = async (task: Omit<Task, 'id' | 'completed' | 'color'>) => {
  const color = task.courseId ? await getCourseColor(task.courseId) : undefined;

  const newTask: Task = {
    ...task,
    id: generateId(),
    completed: false,
    color: color ?? '#000000',
  };

  await db.tasks.add(newTask);

  if (newTask.deadline) {
    await addEvent({
      title: newTask.title,
      start: newTask.deadline,
      end: newTask.deadline,
      source: 'task',
      sourceId: newTask.id,
      summary: newTask.title,
    });
  }

  if (task.courseId) await updateCourseFromChild('task', task.courseId);

  return newTask;
};

export const clearTasks = async (courseId?: string) => {
  let collection = db.tasks.toCollection();
  if (courseId) {
    collection = collection.filter((t) => t.courseId === courseId);
  }
  const allTasks = await collection.toArray();
  for (const task of allTasks) {
    await deleteTask(task.id);
  }
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

  await updateCourseFromChild('task', updatedTask.courseId);

  // Update calendar event if title or deadline changed
  await updateEvent(updatedTask.id, {
    title: updatedTask.title,
    start: updatedTask.deadline,
    end: updatedTask.deadline,
    summary: updatedTask.title,
  });
};

// DELETE
export const deleteTask = async (id: string) => {
  const task = await db.tasks.get(id);
  if (!task) return;

  await db.tasks.delete(id);
  await deleteEvent(task.id);
  if (task.googleCalendarEventId) {
    const { deleteGoogleCalendarEvent } = await import("@/lib/helpers/calendarHelpers");
    await deleteGoogleCalendarEvent(task.googleCalendarEventId);
  }
  await updateCourseFromChild('task', task.courseId);
};

// COMPLETION TOGGLE
export const toggleTaskCompletion = async (id: string) => {
  const task = await getTaskById(id);
  if (!task) throw new Error('Task not found');

  await db.tasks.update(id, { completed: !task.completed });
  return db.tasks.get(id);
};
