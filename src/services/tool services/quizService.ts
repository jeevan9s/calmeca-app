// Quiz Service File
import { db, Quiz, quizQuestion, userAnswerInput, evaluatedResult, userAnswer, reviewedQuiz, reviewedQuestion } from "../db";
import { generateQuiz } from "../integrations-utils/aiServices";
import { evaluateAnswer } from "../integrations-utils/aiServices";
import { generateId, updateCourseFromChild } from "../integrations-utils/utilityServicies";
import { getCourseColor } from "../integrations-utils/utilityServicies";

// impl crud, evaluation (score, marking, feedback), time spent, return functions

// quiz creation + colour inheritance 
export const addQuiz = async (quiz: Omit<Quiz, 'id' | 'color' | 'createdOn'| 'questions'>): Promise<Quiz> => {
    if (!quiz.courseId) throw new Error("Quiz must have a courseId")

    const newQuiz: Quiz = {
        ...quiz,
        id: generateId(),
        createdOn: new Date(),
        questions: [],
        color: await getCourseColor(quiz.courseId),
        completed: false,
    }
    await db.quizzes.add(newQuiz)
    
    if (newQuiz.courseId) {
        await updateCourseFromChild(newQuiz.courseId, 'quiz')
    }
    return newQuiz
}

export const addQuizQuestion = async (question: Omit<quizQuestion, 'id'>): Promise<quizQuestion> => {
    const newQuestion: quizQuestion = {
        ...question,
        id: generateId(),
    }
    await db.quizQuestions.add(newQuestion)
    return newQuestion
}

export const generateAndSaveQuiz = async (text:string, quizMeta: Omit<Quiz, 'id' | 'color' | 'createdOn' | 'questions' | 'completed'>, 
    quizType: "multiple-choice" | "true-false" | "short-answer" | "mixed",
    length?:number): Promise<Quiz> => {
        const quiz = await addQuiz(quizMeta)
        const generatedQuestions = await generateQuiz(text, quizType, length)
    for (const q of generatedQuestions) {
        await addQuizQuestion({
            quizId: quiz.id,
            questionText: q.question,
            type: q.type,
            correctAnswer: q.correctAnswer,
            options:q.options
        })
    }
    if (quiz.courseId) {
        await updateCourseFromChild(quiz.courseId, 'quiz')
    }
    return quiz
}



export const deleteQuiz = async (quizId: string): Promise<void> => {
    const quiz = await db.quizzes.get(quizId)
    await db.quizzes.delete(quizId)
    const questions = await db.quizQuestions.where('quizId').equals(quizId).toArray()
    for (const i of questions) {
        await db.quizQuestions.delete(i.id)
    }
    if (quiz?.courseId) {
        await updateCourseFromChild(quiz.courseId, 'quiz')
    }
}

export const deleteQuizQuestion = async(id: string): Promise<void> => {
    await db.quizQuestions.delete(id)
}

export const updateQuiz = async (id:string, updates: Partial<Omit<Quiz, 'id'>>): Promise<void> => {
    await db.quizzes.update(id, updates)
    const updatedQuiz = await db.quizzes.get(id)
    if (updatedQuiz?.courseId) {
        await updateCourseFromChild(updatedQuiz.courseId, 'quiz')
    }
}

export const updateQuizQuestion = async (id:string, updates: Partial<Omit<quizQuestion, 'id'>>): Promise<void> => {
    await db.quizQuestions.update(id, updates)
}

export const markQuizCompleted = async (quizId: string): Promise<void> => {
    await db.quizzes.update(quizId, {completed: true})
}

export const saveUserAnswers = async (quizId:string, answers: userAnswer[]): Promise<void> => {
    for (const answer of answers) {
        await db.userAnswers.add({...answer, quizId})
    }
}

export const markQuiz = async (quizId:string, evaluatedResults: evaluatedResult[]): Promise<void> => {
    const correctCount = evaluatedResults.filter(q => q.isCorrect).length
    const scorePercent = evaluatedResults.length > 0 ? Math.round((correctCount / evaluatedResults.length) * 100) : 0
    await db.quizzes.update(quizId, {
        score: scorePercent,
        completed: true
    }
    )
}

export const evaluateQuiz = async (quizId:string, answers: userAnswerInput[],): Promise<evaluatedResult[]> => {
    const results: evaluatedResult[] = []

    for (const input of answers) {
        const question = await db.quizQuestions.get(input.questionId)
        if (!question) continue

        const result = await evaluateAnswer({ questionId: question.id, question: question.questionText, type: question.type, options: question.options}, input)
        results.push(result)

        await db.userAnswers.add({
            id: generateId(),
            quizId,
            questionId: question.id,
            answer: input.answer,
            isCorrect: result.isCorrect,
            answeredOn: new Date()
        })
        if (!result.isCorrect && result.explanation) {
            await updateQuizQuestion(question.id, {
                explanation: result.explanation
            })
        }
    }
        await markQuiz(quizId, results)
        return results

}

export const reviewQuiz = async (quizId:string): Promise<reviewedQuiz | null> => {
    const quiz = await db.quizzes.get(quizId)
    if (!quiz) return null

    const questions = await db.quizQuestions.where('quizId').equals(quizId).toArray()
    const answers = await db.userAnswers.where('quizId').equals(quizId).toArray()

    const reviewedQuestions = questions.map((q): reviewedQuestion => {
        const userAnswer = answers.find(a => a.questionId === q.id)
        return {
            questionId: q.id, questionText: q.questionText, type: q.type, options: q.options, correctAnswer: q.correctAnswer, userAnswer: userAnswer?.answer, isCorrect: userAnswer?.isCorrect, explanation: q.explanation
        }
    }) 

    return {
        quizId: quiz.id,
        title: quiz.title, courseId: quiz.courseId ?? "No Course ID" , questions: reviewedQuestions, score: quiz.score, completed: quiz.completed
    }
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