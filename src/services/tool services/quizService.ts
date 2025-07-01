// Quiz Service File
import { db, Course, Quiz, quizQuestion, userAnswerInput, evaluatedResult, userAnswer } from "../db";
import { v4 as uuid} from 'uuid'

// impl crud, evaluation (score, marking, feedback), time spent, return functions

// quiz creation + colour inheritance 
export const addQuiz = async (quiz: Omit<Quiz, 'id' | 'color' | 'createdOn'| 'questions'>): Promise<Quiz> => {
    const course: Course | undefined = quiz.courseId ? await db.courses.get(quiz.courseId): undefined

    const newQuiz: Quiz = {
        ...quiz,
        id: uuid(),
        createdOn: new Date(),
        questions: [],
        color: course?.color ?? '#000000',
        completed: false,
    }
    await db.quizzes.add(newQuiz)
    return newQuiz
}

export const addQuizQuestion = async (question: Omit<quizQuestion, 'id'>): Promise<quizQuestion> => {
    const newQuestion: quizQuestion = {
        ...question,
        id: uuid(),
    }
    await db.quizQuestions.add(newQuestion)
    return newQuestion
}

export const deleteQuiz = async (quizId: string): Promise<void> => {
    await db.quizzes.delete(quizId)
    const questions = await db.quizQuestions.where('quizId').equals(quizId).toArray()
    for (const i of questions) {
        await db.quizQuestions.delete(i.id)
    }
}

export const deleteQuizQuestion = async(id: string): Promise<void> => {
    await db.quizQuestions.delete(id)
}

export const updateQuiz = async (id:string, updates: Partial<Omit<Quiz, 'id'>>): Promise<void> => {
    await db.quizzes.update(id, updates)
}

export const updateQuizQuestion = async (id:string, updates: Partial<Omit<quizQuestion, 'id'>>): Promise<void> => {
    await db.quizQuestions.update(id, updates)
}

export const markQuizCompleted = async (quizId: string): Promise<void> => {
    await db.quizzes.update(quizId, {completed: true})
}

// evaluation
export const evaluateAnswers = async (quizId:string, answers: userAnswerInput[]): Promise<evaluatedResult[]> => {
    const results: evaluatedResult[] = []
    let correctCount = 0
    
    for (const {questionId, answer} of answers) {
        const question: quizQuestion | undefined = await db.quizQuestions.get(questionId)
        if (!question) continue 

        let isCorrect = false
        if (question.type === "short-answer") {
            const correct = String(question.correctAnswer).trim().toLowerCase()
            const given = String(answer).trim().toLowerCase()
            isCorrect = correct === given
        }
        const userResponse: userAnswer = {
        id: uuid(),
        quizId,
        questionId,
        answer,
        isCorrect,
        answeredOn: new Date()
    }
    await db.userAnswers.add(userResponse)
    if (isCorrect) correctCount++

    results.push({
        questionId,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: isCorrect ? undefined : question.explanation
    })
    }
    const scorePercent = results.length > 0
    ? Math.round((correctCount / results.length) * 100): 0

    await db.quizzes.update(quizId, {
        score: scorePercent,
        completed: true
    })
    return results
}

// time spent 
const quizTimers: Record<string, number> = {}

export const startQuizTimer = (quizId: string): void => {
    quizTimers[quizId] = Date.now()
}

export const endQuizTimer = async (quizId: string): Promise<void> => {
    const start = quizTimers[quizId]
    if (!start) return 

    const end = Date.now()
    const timeSpent = Math.floor((end-start)/ 1000)

    await db.quizzes.update(quizId, {timeSpent})
    delete quizTimers[quizId]
}


export const getAllQuizzes = async(): Promise<Quiz[]> => {
    return db.quizzes.toArray()
}

export const getAllQuizQuestions = async(): Promise<quizQuestion[]> => {
    return db.quizQuestions.toArray()
}

export const getQuizzesByCourse = async(courseId: string): Promise<Quiz[]> => {
    return db.quizzes.where('courseId').equals(courseId).toArray()
}

export const getCompletedQuizzes = async() => {
    const all = await db.quizzes.toArray()
    return all.filter(quiz => quiz.completed === true)
}

export const getCompletedQuizzesByCourse = async (courseId:string) => {
    return db.quizzes.where('courseId').equals(courseId).and(q => q.completed === true).toArray()
}