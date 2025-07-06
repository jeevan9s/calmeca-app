// Summary Service File
import { Summary, db } from '../db';
<<<<<<< HEAD
import { generateId, updateTimestamp, getCourseColor, updateCourseFromChild} from '../utils & integrations/utilityServicies';
import { generateSummary } from '../utils & integrations/aiServices';
=======
import { generateId, updateTimestamp, getCourseColor, updateCourseFromChild} from '../integrations-utils/utilityServicies';
import { generateSummary } from '../integrations-utils/aiServices';
>>>>>>> fdb54f8cff2dcddd1dbe8dacc74bcbed1d1445e8

// implementing CRUD,  return functions 
export const createSummary = async (summary:Omit<Summary, 'id' | 'color' | 'createdOn'>) => {
    
    const newSummary: Summary = {
        ...summary,
        id: generateId(),
        color: await getCourseColor(summary.courseId),
        createdOn: new Date()
    }
    await db.summaries.add(newSummary)
    await updateCourseFromChild(newSummary.courseId, 'summary')
    return newSummary
}

export const generateAndSaveSummary = async (text:string, summaryMeta: Omit<Summary, 'id' | 'color' | 'createdOn'>): Promise<Summary> => {
    const summaryText = await generateSummary(text)

    const newSummary: Summary = {
        ...summaryMeta,
        id: generateId(), color: await getCourseColor(summaryMeta.courseId), createdOn: new Date(), content: summaryText
    }
    await db.summaries.add(newSummary)
    await updateCourseFromChild(newSummary.courseId, 'summary')
    return newSummary
}

export const deleteSummary = async (id:string): Promise<void> => {
    const summary = await db.summaries.get(id)
    await db.summaries.delete(id)

    if (summary?.courseId) {
        await updateCourseFromChild(summary.courseId, 'summary')
    }
}

export const  updateSummary = async (id:string, updates: Partial<Omit<Summary, "id" | "createdOn">>): Promise<void> => {
    await db.summaries.update(id, updates)
    await updateTimestamp('summaries', id)

    const updated = await db.summaries.get(id)
    if (updated?.courseId) {
        await updateCourseFromChild(updated.courseId, 'summary')
    }
}

export const getAllSummaries = async (): Promise<Summary[]> => {
    return db.summaries.toArray()
}

export const getSummaryById = async (id:string): Promise<Summary | undefined>=> {
    return db.summaries.get(id)
}

export const getSummariesByCourseId = async (courseId:string): Promise<Summary[]> => {
    return db.summaries.where('courseId').equals(courseId).toArray()
}

export const getSummaryByNote = async (noteId:string): Promise<Summary | undefined> => {
    return db.summaries.where('noteId').equals(noteId).first()
}
