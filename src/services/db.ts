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



// class declartin & dexie 

export class CalmecaDB extends Dexie {
    courses!: Table<Course, string>;
    tasks!: Table<Task, string>;
    calendarEvents!: Table<CalendarEvent, string>;

    constructor() {
        super('CalmecaDB');
        this.version(1).stores({
            courses: 'id, name, type, color, archived, updatedOn, updatedFrom, endsOn',
            tasks: 'id, title, courseId, type, deadline, completed, color',
            calendarEvents: 'id, title, date, source, sourceId, color'
        });
    }
}

export const db = new CalmecaDB();

