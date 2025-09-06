import Dexie, { Table } from 'dexie' 

// TYPES
export interface Course {
    id: string;
    name: string;
    description?: string;
    color: string;
    type: string; // lecture, tutorial, project
    createdOn: Date;
    endsOn: Date;
    archived: boolean;
    updatedOn: Date;
    updatedFrom?: 'calendar' | 'assignment' | 'other';
}

export interface Task {
    id: string;
    courseId: string;
    title: string;
    type: 'Homework' | 'Lab' | 'Exam' | 'Project' | 'Report';
    deadline: Date;
    completed: boolean;
    color: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    source: string;
    sourceId: string;
    tags?: string[];
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


// class declartin & dexie 

export class CalmecaDB extends Dexie {
    courses!: Table<Course, string>;
    tasks!: Table<Task, string>;
    calendarEvents!: Table<CalendarEvent, string>;
    microsoftFiles!: Table<MicrosoftFile, string>

    constructor() {
        super('CalmecaDB');
        this.version(1).stores({
            courses: 'id, name, type, color, archived, updatedOn, updatedFrom, endsOn',
            tasks: 'id, title, courseId, type, deadline, completed, color',
            calendarEvents: 'id, title, date, source, sourceId, color',
            microsoftFiles: 'id, name, mimeType, size, createdOn, lastModified'
        });
    }
}

export const db = new CalmecaDB();

