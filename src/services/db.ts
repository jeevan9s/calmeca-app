import Dexie, { Table } from 'dexie' 

// TYPES
export interface Course {
    id: string;
    name: string;
    color: string;
    type: string; // lecture-based, project-based, tutorial, etc. 
    createdOn: Date;
    endsOn: Date;
    archived?: boolean;
}

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    type: 'Homework' | 'Lab' | 'Exam' | 'Project' | 'Report';
    deadline: Date;
    completed: boolean;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    source: "assignment" | "custom";
    sourceId?: string;
    tags?: string[];
}

export interface Note {
    id: string
    title: string 
    courseId: string
    content: string; //MDX 
    createdOn: Date;
    updatedOn: Date;
    tags?: string[];
}

// AI TOOL INTERFACEs
export interface FlashcardDeck {
    id: string;
    name: string;
    courseId: string;
    createdOn: Date;
    description: string;
    tags?: string[];
    completed?: boolean;
}

export interface Flashcard {
    id: string;
    front: string; // question/term
    back: string; // answer/definition
    deckId?: string;
    origin: 'note' | 'pdf'
    createdOn: Date;
}

export interface Summary {
    id: string;
    noteId: string;
    summaryText: string;
    createdOn: Date;
    model?: string;
}

export interface Quiz {
    id: string;
    title: string;
    courseId?: string;
    createdOn: Date;
    questions: quizQuestion[]
    completed?: boolean;
}

export interface quizQuestion {
    id: string;
    quizId: string;
    questionText: string;
    options?: string[] // ie multiple choice 
    correctAnswer: string | number;
    type: 'multiple-choice' | 'short-answer' | 'true-false'
    explanation: string
}

// class declartin & dexie 

export class CalmecaDB extends Dexie {
    courses!: Table<Course, string>
    assignments!: Table<Assignment, string>
    calendarEvents!: Table<CalendarEvent, string>
    notes!: Table<Note, string>
    flashcardDecks!: Table<FlashcardDeck, string>
    flashcards!: Table<Flashcard, string>
    summaries!: Table<Summary, string>
    quizzes!: Table<Quiz, string>
    quizQuestions!: Table<quizQuestion, string>

    constructor() {
        super('CalmecaDB')
        this.version(1).stores({
            courses: 'id, name, type, color,  archived',
            assignments: 'id, title, courseId, type, deadline, completed',
            calendarEvents: 'id, title, date, source',
            notes: 'id, courseId, createdOn, updatedOn',
            flashcardDecks: 'id, courseId, completed',
            flashcards: 'id, deckId, origin',
            summaries: 'id, noteId',
            quizzes: 'id, title, courseId, completed',
            quizQuestions: 'id, quizId, type'
        })
    }
}

export const db = new CalmecaDB();
