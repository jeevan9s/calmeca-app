"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/dialog";
import { Edit2, ExternalLink } from "react-feather";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/scroll-area";
import { fetchGoogleCalendarEvents } from "../../../../integrations/google/google";
import { GCalEvent } from "@/services/db";
import AddCalendarEventDialog from "@/renderer/components/Courses/AddCalendarEventDialog";

const CALENDAR_EVENTS_UPDATED_EVENT = "calmeca:calendar-events-updated";


export default function EventsCard() {
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<GCalEvent | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await fetchGoogleCalendarEvents();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const todays = all.filter((ev) => {
        if (!ev.start.includes("T")) return false;
        const d = new Date(ev.start);
        return d >= startOfToday && d <= endOfToday;
      });
      const unique = Array.from(new Map(todays.map((e) => [e.summary, e])).values());
      setEvents(unique);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleCalendarEventsUpdated = () => {
      void load();
    };

    load();
    const interval = setInterval(load, 60_000);
    window.addEventListener(
      CALENDAR_EVENTS_UPDATED_EVENT,
      handleCalendarEventsUpdated,
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        CALENDAR_EVENTS_UPDATED_EVENT,
        handleCalendarEventsUpdated,
      );
    };
  }, [load]);

  return (
    <>
      <motion.div className="rounded-xl" whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }}>
        <Card className="bg-[#0f0f10ff] h-80 sm:h-96 flex flex-col rounded-xl">
        <CardHeader>
          <CardTitle className="font-dm">today's events</CardTitle>
          <CardDescription className="font-dm text-white/50">
            events scheduled for today
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-2">
            {loading ? (
              <p className="text-neutral-400 text-sm">loading...</p>
            ) : events.length === 0 ? (
              <p className="text-neutral-400 text-sm">no events today.</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Dialog key={event.id}>
                    <DialogTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-zinc-700/50 p-3 rounded-xl hover:bg-zinc-800/60 transition-all cursor-pointer"
                      >
                        <p className="font-semibold">{event.summary}</p>
                        <p className="text-xs text-neutral-400">
                          {new Date(event.start).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(event.end).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <p>{event.location}</p>
                      </motion.div>
                    </DialogTrigger>

                    <DialogContent className="bg-zinc-900 border-none text-white rounded-[1em]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold">{event.summary}</DialogTitle>
                        <DialogDescription className="text-neutral-400 text-sm">
                          {`${new Date(event.start).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })} ${new Date(event.start).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })} - ${new Date(event.end).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}`}
                          <p className="text-sm text-neutral-500">{event.location}</p>
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4 space-y-2">
                        {event.description ? (
                          <p className="text-sm text-neutral-300">{event.description}</p>
                        ) : (
                          <p className="text-sm text-neutral-500 italic"></p>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            className="font-mp font-light text-white flex items-center gap-1 cursor-pointer rounded-xl border-none bg-zinc-800 hover:bg-zinc-700"
                            onClick={() => {
                              setEventToEdit(event);
                              setIsEditOpen(true);
                            }}
                          >
                            edit event <Edit2 size={14} />
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            className="font-mp font-light text-white flex items-center gap-1 cursor-pointer rounded-xl border-none bg-zinc-800 hover:bg-zinc-700"
                            onClick={() => {
                              const start = new Date(event.start);
                              const end = new Date(event.end);
                              const formatDate = (date: Date) =>
                                date.toISOString().replace(/-|:|\.\d{3}/g, "");
                              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                                event.summary
                              )}&dates=${formatDate(start)}/${formatDate(end)}${
                                event.location ? `&location=${encodeURIComponent(event.location)}` : ""
                              }${event.description ? `&details=${encodeURIComponent(event.description)}` : ""}`;
                              window.open(url, "_blank");
                            }}
                          >
                            open in Google Calendar <ExternalLink size={14} />
                          </Button>
                        </motion.div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 pb-2 pr-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="font-thin font-dm hover:underline rounded-md cursor-pointer"
              onClick={() => window.open("https://calendar.google.com", "_blank")}
            >
              open in calendar <ExternalLink />
            </Button>
          </motion.div>
        </CardFooter>
        </Card>
      </motion.div>

      <AddCalendarEventDialog
        isOpen={isEditOpen}
        eventToEdit={eventToEdit}
        onClose={() => {
          setIsEditOpen(false);
          setEventToEdit(null);
        }}
        onEventAdded={() => {
          void load();
        }}
      />
    </>
  );
}
