// Google Service File 
import { google } from "googleapis";
import { getAuthClient } from "./googleAuth";

export async function getCalendarEvents(timeMin?: string, timeMax?: string) {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items || [];
}

export async function getUpcomingEvents(daysAhead = 5) {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + daysAhead);

  return getCalendarEvents(now.toISOString(), future.toISOString());
}

export async function getTodaysEvents() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  return getCalendarEvents(todayStart.toISOString(), todayEnd.toISOString());
}

export async function addCalendarEvent(event: {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
}) {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start.toISOString() },
      end: { dateTime: event.end.toISOString() },
    },
  });

  return res.data;
}
