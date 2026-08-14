// Course Service File
import { db } from "../db";
import { Course } from "../db";
import { generateId, getCourseColor } from "../utilityServicies";

export async function addCourse(
  course: Omit<Course, "id" | "createdOn" | "updatedOn" | "updatedFrom" | "archived">
): Promise<Course> {
  const { id, createdOn, updatedOn, updatedFrom, archived, ...rest } = course as any; 
  const newCourse: Course = {
    ...rest,
    id: generateId(),
    createdOn: new Date(),
    updatedOn: new Date(),
    updatedFrom: undefined,
    archived: false,
    color: course.color || "#ffffffff",
  };

  await db.courses.add(newCourse);
  return newCourse;
}

export const deleteCourse = async (id: string) => {
    return  db.courses.delete(id)
}

export const updateCourse = async (
  id: string,
  updates: Partial<Omit<Course, "id" | "createdOn">>
): Promise<Course | undefined> => {
  if (!updates) return;

  // Merge updates with existing course to avoid overwriting fields unintentionally
  const existingCourse = await db.courses.get(id);
  if (!existingCourse) {
    console.warn(`Course with id ${id} not found`);
    return undefined;
  }

  const mergedCourse: Partial<Omit<Course, "id" | "createdOn">> = {
    ...existingCourse, // keep existing values
    ...updates,        // apply new updates
    updatedOn: new Date(), // update timestamp
  };

  const updatedCount = await db.courses.update(id, mergedCourse);

  if (!updatedCount) {
    console.warn(`Failed to update course with id ${id}`);
    return undefined;
  }

  return await db.courses.get(id);
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

export const getCourseById = async (id: string): Promise<Course | undefined> => {
  return await db.courses.get(id);
};

export const getAllCourses = async (): Promise<Course[]> => {
  return  db.courses.toArray()
}


