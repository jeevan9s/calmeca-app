// Summary Service File
import { Summary, db } from '../db';
import { v4 as uuid} from 'uuid'

// implementing CRUD,  return functions 
export const createSummary = async (summary:Omit<Summary, 'id' | 'color' | 'createdOn'>) => {
    const course = await db.courses.get(summary.courseId)
    if (!course) throw new Error("Course not found")
    
    const newSummary: Summary = {
        ...summary,
        id: uuid(),
        color: course.color,
        createdOn: new Date()
    }
    await db.summaries.add(newSummary)
    return newSummary
}

export const deleteSummary = async (id:string): Promise<void> => {
    await db.summaries.delete(id)
}

export const  updateSummary = async (id:string, updates: Partial<Omit<Summary, "id" | "createdOn">>): Promise<void> => {
    await db.summaries.update(id, updates)
}

export const getAllSummaries = async (): Promise<Summary[]> => {
    return db.summaries.toArray()
}

export const getSummariesById = async (id:string)=> {
    return db.summaries.get(id)
}

export const getSummariesByCourseId = async (courseId:string): Promise<Summary[]> => {
    return db.summaries.where('courseId').equals(courseId).toArray()
}

export const getSummaryByNote = async (noteId:string): Promise<Summary | undefined> => {
    return db.summaries.where('noteId').equals(noteId).first()
}
