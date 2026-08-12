export type CourseSemester = "fall" | "winter";

export const DEFAULT_COURSE_SEMESTER: CourseSemester = "fall";

export function normalizeCourseSemester(
  value?: string | null,
): CourseSemester {
  return value === "winter" ? "winter" : DEFAULT_COURSE_SEMESTER;
}

export function getSemesterEndDate(
  semester: CourseSemester,
  referenceDate: Date = new Date(),
): Date {
  const year = referenceDate.getFullYear();

  if (semester === "fall") {
    const end = new Date(year, 11, 8);
    if (referenceDate > end) {
      return new Date(year + 1, 11, 8);
    }
    return end;
  }

  const end = new Date(year, 3, 5);
  if (referenceDate > end) {
    return new Date(year + 1, 3, 5);
  }
  return end;
}
