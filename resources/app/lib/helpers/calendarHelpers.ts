import { addGoogleCalendarEvent, deleteGoogleCalendarEvent } from "@/services/google";
import { GCalEvent } from "@/services/db";

export async function addCalendarEvent(
  summary: string,
  start: Date | string,
  end: Date | string,
  type: "deadline" | "exam" | "meeting" | "office-hours",
  allDay: boolean = false,
  recurrence: string = "none"
) {
  const startDate = typeof start === "string" ? new Date(start) : new Date(start);
  const endDate = typeof end === "string" ? new Date(end) : new Date(end);

  if (allDay) {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  }

  const event: GCalEvent = {
    id: "",
    summary,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    // Recurrence is not currently persisted to Google from this helper.
    recurrence,
  };

  return addGoogleCalendarEvent(event);
}

export async function deleteGoogleCalendarEventID(eventId: string) {
  return deleteGoogleCalendarEvent(eventId);
}

export { deleteGoogleCalendarEvent };
