// Course Service File
import { db } from "../db";
import { Course } from "../db";
<<<<<<< HEAD
import { generateId, getCourseColor } from "../utils & integrations/utilityServicies";
=======
import { generateId, getCourseColor } from "../integrations-utils/utilityServicies";
>>>>>>> fdb54f8cff2dcddd1dbe8dacc74bcbed1d1445e8

// implementin CRUD, some archive stuff, return functions 

export const addCourse = async (course: Omit<Course, 'id' | 'createdOn' | 'archived'>) => {
    const newCourse: Course = {
        ...course,
        id: generateId(),
        createdOn: new Date(),
        updatedOn: new Date(),
        updatedFrom: undefined,
        archived: false,
        color: await getCourseColor(course.courseId)
    }
    await db.courses.add(newCourse)
    return newCourse
}

export const deleteCourse = async (id: string) => {
    return  db.courses.delete(id)
}

export const updateCourse = async (
    id: string,
    updates: Partial<Omit<Course, 'id' | 'createdOn'>>
): Promise<void> => {
    if (updates) {
        updates.updatedOn = new Date();  
    }
    await db.courses.update(id, updates);
};


export const archiveCourse = async (id: string) => {
    return  db.courses.update(id, {archived: true})
}

export const unarchiveCourse = async (id:string) => {
    return  db.courses.update(id, {archived: false})
    
}

export const getArchivedCourses = async () => {
  const all = await db.courses.toArray();
  return all.filter(course => course.archived === true);
};


export const getActiveCourses = async () => {
  const all = await db.courses.toArray();
  return all.filter(course => course.archived === false);
};

export const getAllCourses = async (): Promise<Course[]> => {
  return  db.courses.toArray()
}


