import Dexie, { Table } from 'dexie' 

// TYPES
export interface Course {
    id: string;
    name: string;
    code: string;
    professor: string;
    courseEmail?: string;
    profEmail?: string;
    description?: string;
    color?: string;
    type?: 'lecture-tutorial' | 'project-studio' | 'lab';
    createdOn: Date;
    endsOn: Date;
    archived?: boolean;
    updatedOn: Date;
    updatedFrom?: 'calendar' | 'assignment' | 'other';
    officeHours?: OfficeHour[];
}

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
    type: 'homework' | 'lab' | 'exam' | 'project' | 'report' | 'quiz';
    deadline: Date;
    completed: boolean;
    color: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    date: Date;
    source: string;
    sourceId: string;
    type?: 'deadline' | 'meeting' | 'exam';
    color: string;
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


// class declartin & dexie 

export class CalmecaDB extends Dexie {
    courses!: Table<Course, string>;
    tasks!: Table<Task, string>;
    calendarEvents!: Table<CalendarEvent, string>;
    microsoftFiles!: Table<MicrosoftFile, string>

    constructor() {
        super('CalmecaDB');
        this.version(1).stores({
            courses: 'id, name, type, color, archived, updatedOn, updatedFrom, endsOn, professor, courseEmail, profEmail, code',
            tasks: 'id, title, courseId, type, deadline, completed, color',
            calendarEvents: 'id, title, date, source, sourceId, color',
            microsoftFiles: 'id, name, mimeType, size, createdOn, lastModified'
        });
    }
}

export const db = new CalmecaDB();

