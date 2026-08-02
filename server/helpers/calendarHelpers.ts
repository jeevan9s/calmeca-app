
export async function deleteGoogleCalendarEvent(eventId: string) {
  if (window.electronAPI?.deleteGoogleCalendarEvent) {
    return await window.electronAPI.deleteGoogleCalendarEvent(eventId);
  }
  return { success: false, error: 'No electronAPI.deleteGoogleCalendarEvent' };
}
import { generateId } from "@/services/integrations-utils/utilityServicies";
import { db } from "@/services/db";

export async function addCalendarEvent(
  summary: string,
  start: Date | string,
  end: Date | string,
  type: "deadline" | "exam",
  allDay: boolean = false,
  recurrence: string = "none"
) {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;

  console.log('[CalendarHelpers] addCalendarEvent called:', { summary, startDate, endDate, type, allDay, recurrence });
  // Delete duplicates in local DB
  const existing = await db.calendarEvents.where({ summary, start: startDate }).toArray();
  for (const evt of existing) {
    await db.calendarEvents.delete(evt.id);
  }
  const event = {
    id: generateId(),
    summary,
    start: startDate,
    end: endDate,
    type,
    allDay,
    recurrence,
  };
  console.log('[CalendarHelpers] Adding event to DB:', event);
  await db.calendarEvents.add(event);

  if (!window.electronAPI?.addGoogleCalendarEvent) return;

  const startStr = allDay
    ? startDate.toISOString().split("T")[0]
    : startDate.toISOString();
  const endStr = allDay
    ? new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : endDate.toISOString();

  console.log('[CalendarHelpers] Sending to Google Calendar:', { summary, startStr, endStr, allDay, recurrence });
  await window.electronAPI.addGoogleCalendarEvent(
    summary,
    startStr,
    endStr,
    allDay,
    recurrence
  );
}
