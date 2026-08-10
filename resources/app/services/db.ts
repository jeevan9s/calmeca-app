import Dexie, { Table } from 'dexie';
import { ReactNode } from 'react';


export interface Resource {
    id: string;
    title: string;
    url: string;
    type?: "pdf" | "video" | "link" | "other";
}

export interface Course {
    id: string;
    title: string;
    code: string;
    professor: string;
    courseEmail?: string;
    profEmail?: string;
    description?: string;
    color?: string;
    type?: CourseType;
    icon?: ReactNode;
    midterms?: { start: Date; end: Date }[];
    createdOn: Date;
    endsOn: Date;
    midtermDate?: Date;
    credits?: number;
    finalExamDate?: Date;
    finalExamEndDate?: Date;
    archived?: boolean;
    updatedOn: Date;
    resources: Resource[]; 
    tasks: Task[]; 
}

export type CourseType = 'lecture' | 'studio' | 'lab' | 'online';

export const courseTypeLabels: Record<CourseType, string> = {
    'lecture': 'Lecture Based',
    'online': 'Online',
    'studio': 'Studio Based',
    'lab': 'Lab Based',
};

export interface Contact {
    id: string;
    name: string;
    email: string;
    role: 'professor' | 'TA' | 'student' | 'other';
    courseId?: string;
}

export type TaskType = 
  | "default" 
  | "problem set" 
  | "lab" 
  | "project task" 
  | "report" 
  | "tutorial" 
  | "custom";


export interface Task {
    id: string;
    summary?:string;
    allDay?:boolean;
    recurring?: boolean; 
    reccurence: string; 
    courseId: string;
    title: string;
    type: TaskType;
    deadline?: Date;
    completed: boolean;
    color: string;
    googleCalendarEventId?: string;
}

export interface SubTask {
    id: string;
    title: string;
    taskId: string;
    courseId: string;
    deadline?: Date;
    completed: boolean;
    color?: string;
    description?: string;
}

export interface CalendarEvent {
    id: string;
    googleCalendarEventId?: string;
    title?: string;
    description?: string;
    location?: string;
    start: Date;
    end: Date;
    source?: string;
    sourceId?: string;
    type?: 'deadline' | 'meeting' | 'exam' | 'office-hours';
    summary: string;
    color?: string;
}

export interface OfficeHour {
    days?: string[];
    startTime?: string;
    endTime?: string;
    location?: string;
    byAppointment: boolean;
}

export type GCalEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  recurrence?: string;
};

export type ExamItem = {
  id: string;
  title: string;
  deadline: Date;
  courseName?: string;
  type: string;
  description?: string;
  source: 'database' | 'calendar';
  location?: string;
};

export interface ParsedPDF {
    text: string; 
    pageCount: number;
}

export class CalmecaDB extends Dexie {
    courses!: Table<Course, string>;
    tasks!: Table<Task, string>;
    calendarEvents!: Table<CalendarEvent, string>;
    subtasks!: Table<SubTask, string>;
    // courseItems!: Table<Deadline, string>; // TODO: Define Deadline interface

    constructor() {
        super('CalmecaDB');
        this.version(4).stores({
            courses: 'id, title, type, color, archived, updatedOn, updatedFrom, endsOn, professor, courseEmail, profEmail, code, midtermDate, finalExamDate',
            tasks: 'id, title, courseId, type, deadline, completed, color, notes',
            calendarEvents: 'id, title, start, end, type, source, sourceId, color',
            subtasks: 'id, title, taskId, courseId, deadline, completed, color',
            // courseItems: 'id, courseId, title, type, dueDate, startDate, endDate, recurrence, nextOccurrence, completed'
        });
    }
}

export const db = new CalmecaDB();
