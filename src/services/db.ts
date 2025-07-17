import Dexie, { Table } from 'dexie' 

// TYPES
export interface Course {
    id: string;
    courseId: string;
    description?: string
    name: string;
    color: string;
    type: string; // lecture-based, project-based, tutorial, etc. 
    createdOn: Date;
    endsOn: Date;
    archived: boolean;
    updatedOn: Date;
    updatedFrom?: 'calendar' | 'assignment' | 'note' | 'summary' | 'flashcard' | 'other';
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
    course?: []
    courseId: string
    content: string; //MDX 
    createdOn: Date;
    updatedOn: Date;
    tags?: string[];
    color?: string;
    description?: string
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
    content: string;
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
    explanation?: string
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

export interface reviewedQuestion {
    questionId: string
    questionText:string
    type: "multiple-choice" | "true-false" | "short-answer"
    options?: string[]
    correctAnswer: string | number | boolean
    userAnswer?: string | number | boolean
    isCorrect?: boolean
    explanation?: string
}

export interface reviewedQuiz {
    quizId: string
    title: string
    courseId: string
    questions: reviewedQuestion[]
    score?: number
    completed?: boolean
}

export interface UpdateInfo {
    updatedOn: Date
    updatedFrom: 'calendar' | 'assignment' | 'note' | 'summary' | 'flashcard' | 'quiz' | 'other' 
}

export interface importedFile {
    id: string
    name: string
    size?: number
    driveUrl?: string
    createdOn: Date
    usedFor: 'summary' | 'quiz' | 'flashcards' | 'other'
    mimeType: string
    content: string
}

export type generationType = 'summary' | 'flashcards' | 'quiz'
export type exportType = 'md' | 'pdf' | 'txt' | 'docx' | 'json';

export type exportResponse = {
  success: boolean
  fileId?: string
  name?: string
  driveUrl?: string
  error?: string
}

export type importResponse = {
  success: boolean
  id?: string
  name?: string
  mimeType?: string
  content?: string
  error?: string
}

export interface generationOptions {
    quizType?: 'multiple-choice' | 'short-answer' | 'true-false' | 'mixed'
    length?: number
}

export interface AIContentRequest {
  type: 'summary' | 'flashcards' | 'quiz';
  content: string;
  options?: {
    quizType?: 'multiple-choice' | 'true-false' | 'short-answer' | 'mixed';
    length?: number;
  };
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
    reviewedQuestions !: Table<reviewedQuestion, string>
    reviewedQuizzes !: Table<reviewedQuiz, string>
    importedFiles !: Table<importedFile, string>


    constructor() {
        super('CalmecaDB')
        this.version(1).stores({
            courses: 'id, name, type, color, archived, updatedOn, updatedFrom, endsOn',
            assignments: 'id, title, courseId, type, deadline, completed, color',
            calendarEvents: 'id, title, date, source, sourceId, color',
            notes: 'id, courseId, createdOn, updatedOn, description',
            flashcardDecks: 'id, courseId, completed, updatedOn, origin, score',
            flashcards: 'id, deckId',
            summaries: 'id, noteId, courseId, content, color, createdOn',
            quizzes: 'id, title, courseId, completed, timeSpent, score',
            quizQuestions: 'id, quizId, type',
            userAnswers: 'id, quizId, questionId, answer, isCorrect, answeredOn',
            userAnswerInputs: 'questionId, answer',
            evaluatedResults: 'questionId, isCorrect, explanation, correctAnswer',
            reviewedQuestions: 'questionId, questionText, type, isCorrect, explanation, userAnswer, correctAnswer, options',
            reviewedQuizzes: 'quizId, title, courseId, questions, score, completed',
            importedFiles: 'id, name, createdOn, size, driveUrl, usedFor, mimeType, content'
        })
    }
} 

export const db = new CalmecaDB();
