// Calendar Service File
import { db, Note } from "../db";
import { generateId } from "../integrations-utils/utilityServicies";
import { getCourseColor, updateTimestamp, updateCourseFromChild } from "../integrations-utils/utilityServicies";

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
        await updateCourseFromChild(newNote.courseId, 'note')
        return newNote
}

export const deleteNote = async (id: string) => {
    const note = await db.notes.get(id)
    if (note) {
        await db.notes.delete(id)
        await updateCourseFromChild(note.courseId, 'note')
    }
}

export const updateNote = async (id:string, updates: Partial<Omit<Note, 'id' | 'createdOn'>>): Promise<void> => {
    await db.notes.update(id, updates)
    await updateTimestamp('notes', id)

    const updatedNote = await db.notes.get(id)
    if (updatedNote?.courseId) {
        await updateCourseFromChild(updatedNote.courseId, 'note')
    }
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