// Utility Service File
// general utils to use across other service files / architecture 
import { v4 as uuid} from 'uuid'
import { db } from '../db'
import { Table } from 'dexie'

type DBTable = keyof typeof db

export const generateId = (): string => {
    return uuid()
}

export const formatDate = (date: Date, locale = 'en-CA' , options?: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat(locale, options ?? {
        year: 'numeric',
        month: 'short',
        day:  'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

export const normalize = (input : string): string => {
    return input.trim().toLowerCase()
}

export const getCourseColor = async (courseId:string): Promise<string> => {
    const course = await db.courses.get(courseId)
    if (!course) throw new Error("Course not found")
    return course.color
}

export const updateTimestamp = async (table:keyof typeof db, id: string): Promise<void> => {
    const tableRef = db[table] as Table<any, string>
    await tableRef.update(id, {updatedOn: new Date()})
}

export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// group ANY items by course
export const groupbyCourse = <T extends {courseId: string}>(items: T[]): Record<string, T[]> => {
    return items.reduce((acc, item) => {
        const {courseId} = item
        if (!acc[courseId]) {
            acc[courseId] = []
        }
        acc[courseId].push(item)
        return acc 
    }, {} as Record<string, T[]>)
}

export const sortByUpdated =  <T extends {updatedOn: Date}>(items: T[]): T[] => {
    return items.sort((a,b) => b.updatedOn.getTime() - a.updatedOn.getTime())
}

export const getLastEditedTime = async(): Promise<Date | null> => {
    const allUpdatedDates: Date[] = []
    const tablesToCheck: DBTable[] = ['notes', 'quizzes', 'flashcardDecks', 'calendarEvents', 'courses', 'assignments']

    for (const table of tablesToCheck) {
        const tableRef = db[table] as Table<any, string>
        const entries = await tableRef.toArray()
        for (const item of entries) {
            if (item.updatedOn) {
                allUpdatedDates.push(new Date(item.updatedOn))
            }
        }
    }
    if (allUpdatedDates.length === 0) return null 
    return allUpdatedDates.reduce((latest, curr) => curr > latest ? curr: latest
)}

export const getRelativeTimeStamp = (timestamp: Date | null): string => {
    if (!timestamp) return "No edits yet"

    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)

    if (diffSeconds < 60) return "just now"
    
    const diffMinutes = Math.floor(diffSeconds / 60) 
    if (diffMinutes < 60) return `last edited ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`

    const diffHours = Math.floor(diffMinutes / 60) 
    if (diffHours < 24 ) return `last edited ${diffHours} hour${diffHours!== 1 ? "s" : ""} ago`

    const diffDays = Math.floor(diffHours / 24) 
    return `last edited ${diffDays} day${diffDays !== 1 ? "s" : " "} ago`
}
