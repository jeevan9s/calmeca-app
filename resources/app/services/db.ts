import Dexie, { Table } from 'dexie';
import { ReactNode } from 'react';


export interface Resource {
    id: string;
    title: string;
    link: string;
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
    updatedFrom?: 'calendar' | 'assignment' | 'other';
    officeHours?: OfficeHour[];
    // homepage?: CourseHomepage; // TODO: Define CourseHomepage interface
    links?: { title: string; url: string }[];
    notes?: string;
    announcements?: string[];
}

export type CourseType = 'lecture' | 'studio' | 'lab';

export const courseTypeLabels: Record<CourseType, string> = {
    'lecture': 'Lecture Based',
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

export interface Task {
    id: string;
    courseId: string;
    title: string;
    type: 'default'| 'homework' | 'lab' | 'exam' | 'project task' | 'report' | 'quiz' | 'tutorial exercise' | 'custom' | 'problem set' ;
    deadline: Date;
    completed: boolean;
    color: string;
    description?: string;
    notes?: string;
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

export interface MicrosoftFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    createdOn: Date;
    lastModified: Date;
}



export interface OfficeHour {
    days?: string[];
    startTime?: string;
    endTime?: string;
    location?: string;
    byAppointment: boolean;
}

export class CalmecaDB extends Dexie {
    courses!: Table<Course, string>;
    tasks!: Table<Task, string>;
    calendarEvents!: Table<CalendarEvent, string>;
    microsoftFiles!: Table<MicrosoftFile, string>;
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
