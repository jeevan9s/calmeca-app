// Assignment Service File
import { Assignment, db } from "./db";
import { v4 as uuid} from 'uuid'
import { addEvent } from "./calendarService";

// implementin CRUD, some completion stuff, return functions 

// added calendar linkage
export const createAssignment = async (assignment:Omit<Assignment, 'id' | 'completed' | 'color'>) => {

    const course = await db.courses.get(assignment.courseId)
    if (!course) throw new Error("Course not found");
    const newAssignment: Assignment = {
        ...assignment,
        id: uuid(),
        completed: false,
        color: course.color
    }
    await db.assignments.add(newAssignment)

    // automatcl create respective calendar evnt 
    await addEvent({
        title: newAssignment.title,
        date:  newAssignment.deadline,
        source: 'assignment',
        sourceId: newAssignment.id,
    })

    return newAssignment
}

export const deleteAssignment = async (id: string) => {
    return await db.assignments.delete(id)
}

export const updateAssignment = async (id: string, updates:Partial<Assignment>) => {
    return await db.assignments.update(id, updates)
}

export const getAssignmentById = async (id:string) => {
    return await db.assignments.get(id)
}

export const getAssignmentByCourse = async (courseId:string) => {
    return db.assignments.where('courseId').equals(courseId).toArray()
}

// week in advance
export const getUpcomingAssignments = async (daysAhead = 7) => {
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + daysAhead)   

    return db.assignments.where('deadline').between(now, future, true, true).and(a => !a.completed).toArray()
}

export const getOverdueAssignments = async () => {
    const now = new Date()
    return db.assignments.where('deadline').below(now).and(a => !a.completed).toArray()
}

export const getOverdueAssignmentsByCourse = async (courseId: string) => {
    const now = new Date()
    return db.assignments.where('courseId').equals(courseId).and(a => a.deadline < now && !a.completed).toArray()
}

export const markAsCompleted = async (id: string) => {
    const assignment = await  getAssignmentById(id)
    if (!assignment) throw new Error("Assignment not found")
    await db.assignments.update(id, {completed: !assignment.completed})
    return db.assignments.get(id)
}

export const getCompletedAssignments = async () => {
    const all = await db.assignments.toArray()
    return all.filter(assignment => assignment.completed === true)
}

export const getCompletedAssignmentsByCourse = async (courseId:string) => {
    return db.assignments.where('courseId').equals(courseId).and(a => a.completed).toArray()
}

export const getIncompleteAssignments = async () => {
    const all = await db.assignments.toArray()
    return all.filter(assignments => assignments.completed === false)
}

export const getInCompleteAssignmentsByCourse = async (courseId:string) => {
    return db.assignments.where('courseId').equals(courseId).and(a => !a.completed).toArray()
}