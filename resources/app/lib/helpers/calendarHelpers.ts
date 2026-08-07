import { addGoogleCalendarEvent, deleteGoogleCalendarEvent } from "@/services/google";

export async function addCalendarEvent(
  summary: string,
  start: Date | string,
  end: Date | string,
  type: "deadline" | "exam" | "meeting" | "office-hours",
  allDay: boolean = false,
  recurrence: string = "none"
) {
  const startStr = typeof start === "string" ? start : start.toISOString();
  const endStr = typeof end === "string" ? end : end.toISOString();
  return addGoogleCalendarEvent(summary, startStr, endStr, allDay, recurrence);
}

export async function deleteGoogleCalendarEventID(eventId: string) {
  return deleteGoogleCalendarEvent(eventId);
}
