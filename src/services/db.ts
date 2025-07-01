import Dexie, { Table } from 'dexie' 

// TYPES
export interface Course {
    id: string;
    courseId: string;
    name: string;
    color: string;
    type: string; // lecture-based, project-based, tutorial, etc. 
    createdOn: Date;
    endsOn: Date;
    archived: boolean;
}

export interface Assignment {
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
    source: "assignment" | "custom";
    sourceId: string
    tags?: string[];
    color: string;
}

export interface Note {
    id: string
    title: string 
    courseId: string
    content: string; //MDX 
    createdOn: Date;
    updatedOn: Date;
    tags?: string[];
    color: string;
}

// AI TOOL INTERFACEs
export interface FlashcardDeck {
    id: string;
    name: string;
    courseId: string;
    createdOn: Date;
    updatedOn: Date
    description: string;
    tags?: string[];
    completed?: boolean;
    color: string;
    origin: 'note' | 'pdf'
}

export interface Flashcard {
    id: string;
    front: string; // question/term
    back: string; // answer/definition
    deckId?: string;
    createdOn: Date;
    score?: number
}

export interface Summary {
    id: string;
    noteId: string;
    summaryText: string;
    createdOn: Date;
    model?: string;
    color: string;
    courseId: string;
}

export interface Quiz {
    id: string;
    title: string;
    courseId?: string;
    createdOn: Date;
    questions: quizQuestion[]
    completed?: boolean;
    color: string;
    timeSpent?: number
    score?: number;
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

export interface userAnswer{
    id: string;
    quizId: string;
    questionId: string;
    answer: string | number | boolean 
    isCorrect: boolean
    answeredOn: Date;
}

export interface userAnswerInput {
    questionId: string;
    answer: string | number | boolean 
}

export interface evaluatedResult {
    questionId: string
    isCorrect: boolean
    explanation?: string
    correctAnswer: string | number | boolean
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
    userAnswers!: Table<userAnswer, string>
    userAnswerInputs!: Table<userAnswerInput, string>
    evaluatedResults!: Table<evaluatedResult, string>

    constructor() {
        super('CalmecaDB')
        this.version(1).stores({
            courses: 'id, name, type, color, archived',
            assignments: 'id, title, courseId, type, deadline, completed, color',
            calendarEvents: 'id, title, date, source, sourceId, color',
            notes: 'id, courseId, createdOn, updatedOn',
            flashcardDecks: 'id, courseId, completed, updatedOn, origin, score',
            flashcards: 'id, deckId',
            summaries: 'id, noteId, courseId, color, createdOn',
            quizzes: 'id, title, courseId, completed, timeSpent, score',
            quizQuestions: 'id, quizId, type',
            userAnswers: 'id, quizId, questionId, answer, isCorrect, answeredOn',
            userAnswerInputs: 'questionId, answer',
            evaluatedResults: 'questionId, isCorrect, explanation, correctAnswer'
        })
    }
}

export const db = new CalmecaDB();
