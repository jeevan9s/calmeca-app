import  { createAssignment,
  getUpcomingAssignments,
  getOverdueAssignments,
  getCompletedAssignments,
  markAsCompleted} from "../services/core services/assignmentService"

import { db } from "../services/db";
import { getAllCourses } from "../services/core services/courseService";

export const seedDummyAssignments = async () => {
  await db.assignments.clear();

  const courses = await getAllCourses();
  const course = courses[0];
  const now = new Date();

  await createAssignment({
    title: "Lab Report 1",
    courseId: course.id,
    deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    type: "Lab",
  });

  await createAssignment({
    title: "Homework 1",
    courseId: course.id,
    deadline: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    type: "Homework",
  });

  const completed = await createAssignment({
    title: "Project Proposal",
    courseId: course.id,
    deadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    type: "Project",
  });

  await markAsCompleted(completed.id);

  console.log("Dummy assignments added.");

  const upcomingAssignments = await getUpcomingAssignments();
  console.log("Upcoming Assignments:", upcomingAssignments);

  const overdueAssignments = await getOverdueAssignments();
  console.log("Overdue Assignments:", overdueAssignments);

  const completedAssignments = await getCompletedAssignments();
  console.log("Completed Assignments:", completedAssignments);
};

