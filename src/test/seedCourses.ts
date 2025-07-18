import { addCourse, getAllCourses, getActiveCourses, getArchivedCourses, archiveCourse } from "../services/core services/courseService";
import { db } from "../services/db";

export const seedDummyCourses = async () => {

  await db.courses.clear();

  await addCourse({
    name: 'Intro to Computer Science',
    courseId: 'CS101',
    color: '#2563eb',
    type: 'Lecture',
    endsOn: new Date('2025-12-01'),
  });


  const course1 = await addCourse({
    name: 'Physics  1',
    courseId: 'ENG2100',
    color: '#f87316',
    type: 'Lecture-Based',
    endsOn: new Date('2025-09-20'),
  });

  await archiveCourse(course1.id);

  console.log('Dummy courses added.');

  const all = await getAllCourses();
  console.log('All Courses:', all);

  const active = await getActiveCourses();
  console.log('Active Courses:', active);

  const archived = await getArchivedCourses();
  console.log('Archived Courses:', archived);
};
