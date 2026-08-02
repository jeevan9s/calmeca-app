import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCourseById } from "@/services/core services/courseService";
import CourseHomepage from "./CourseHomepage";
import { Course } from "@/services/db";

export default function CourseHomepageWrapper() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!courseId) return;
    getCourseById(courseId).then((c) => setCourse(c ?? null));
  }, [courseId]);

  if (!course) return <div>Course not found</div>;

  return (
    <CourseHomepage
      course={course}
      courseId={course.id}
      onUpdateCourse={(updatedCourse) => setCourse(updatedCourse)}
    />
  );
}
