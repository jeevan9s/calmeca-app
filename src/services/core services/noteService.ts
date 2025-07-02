// Calendar Service File
import { db, Note } from "../db";
import { generateId } from "../utils & integrations/utilityServicies";
import { getCourseColor } from "../utils & integrations/utilityServicies";

// impl crud, fetching notes by course, most recent 

export const addNote = async (note: Omit<Note, 'id' | 'createdOn' | 'updatedOn' | 'color'>): Promise<Note> => {
    
        const now = new Date()
        const newNote: Note = {
            ...note,
            id: generateId(),
            createdOn: now,
            updatedOn: now, // later on implement
            color: await getCourseColor(note.courseId)
        }
        await db.notes.add(newNote)
        return newNote
}

export const deleteNote = async (id: string) => {
    return db.notes.delete(id)
}

export const updateNote = async (id:string, updates: Partial<Omit<Note, 'id' | 'createdOn'>>): Promise<void> => {
    updates.updatedOn = new Date()
    await db.notes.update(id, updates)
}

export const getAllNotes = async (): Promise<Note[]> => {
    return db.notes.toArray()
}

export const getNotesByCourse = async(courseId: string): Promise<Note[]> => {
    return db.notes.where('courseId').equals(courseId).toArray()
}

export const getNoteById = async(id: string): Promise<Note | undefined> => {
    return db.notes.get(id)
}

export const getNotesByTag = async (tag: string): Promise<Note[]> => {
    const allNotes = await db.notes.toArray();
    return allNotes.filter(note => note.tags?.includes(tag));
};

export const getMostRecentNotes = async (limit = 10): Promise<Note[]> => {
    return db.notes.orderBy('updatedOn').reverse().limit(limit).toArray()
}