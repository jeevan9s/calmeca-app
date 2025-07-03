// Calendar Service File
import { db } from "../db";
import { CalendarEvent } from "../db";
import { generateId, updateTimestamp } from "../utils & integrations/utilityServicies";

// impl crud, fetching events by date, source 

export const addEvent = async (
  event: Omit<CalendarEvent, 'id' | 'color'> & Partial<Pick<CalendarEvent, 'color' | 'source' | 'sourceId'>>
) => {
  let color = event.color;

  if (!color && event.source === 'assignment' && event.sourceId) {
    const assignment = await db.assignments.get(event.sourceId);
    if (assignment) {
      color = assignment.color;
    }
  }

  const newEvent: CalendarEvent = {
    id: generateId(),
    ...event,
    color: color ?? '#000000',
  };

  await db.calendarEvents.add(newEvent);
  return newEvent;
};

export const deleteEvent = async (id: string) => {
    const deleted = await db.calendarEvents.get(id)
    await db.calendarEvents.delete(id)

    if (deleted?.source === 'assignment' && deleted.sourceId) {
      await updateTimestamp('assignments', deleted.sourceId)
    }
}

export const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    await db.calendarEvents.update(id, updates)
    await updateTimestamp('assignments', id)

    const updatedEvent = await db.calendarEvents.get(id)
    if (updatedEvent?.source === 'assignment' && updatedEvent.sourceId) {
      await updateTimestamp('assignments', updatedEvent.sourceId)
    }
}

export const getAllEvents = async (): Promise<CalendarEvent[]> => {
    return db.calendarEvents.toArray()
}

export const getEventsBySource = async (source: "assignment" | "custom"): Promise<CalendarEvent[]> => {
    return db.calendarEvents.where('source').equals(source).sortBy('date')

}

export const getEventsBySourceId = async (sourceId: string): Promise<CalendarEvent[]> => {
  return db.calendarEvents.where('sourceId').equals(sourceId).sortBy('date');
}


export const getEventsByDate = async (date: Date): Promise<CalendarEvent[]> => {
    const start = new Date(date)
    start.setHours(0,0,0,0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return db.calendarEvents.where('date').between(start, end, true, true).sortBy('date')
}
