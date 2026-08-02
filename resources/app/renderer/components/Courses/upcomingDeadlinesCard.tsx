"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
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
import { ExternalLink } from "react-feather";
import { db, CalendarEvent } from "@/services/db";

interface UpcomingCourseEventsCardProps {
  courseTitle: string;
  upcomingDays?: number;
}

const KEYWORDS = ["meeting", "due", "exam", "midterm", "tutorial", "lab"];

function formatEventDate(start: Date) {
  const now = new Date();
  const startDay = start.getDate();
  const startMonth = start.getMonth();
  const startYear = start.getFullYear();

  const isToday =
    startDay === now.getDate() &&
    startMonth === now.getMonth() &&
    startYear === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    startDay === tomorrow.getDate() &&
    startMonth === tomorrow.getMonth() &&
    startYear === tomorrow.getFullYear();

  if (isToday) return start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (isTomorrow) return "Tomorrow";
  return start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function UpcomingCourseEventsCard({
  courseTitle,
  upcomingDays = 7,
}: UpcomingCourseEventsCardProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const allEvents = await window.electronAPI.fetchGoogleCalendarEvents();
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + upcomingDays);
        const filtered = allEvents
          .filter((e: any) => {
            const start = new Date(e.start);
            return (
              start >= now && start <= future &&
              e.summary && e.summary.toLowerCase().includes(courseTitle.toLowerCase()) &&
              KEYWORDS.some((k) => e.summary.toLowerCase().includes(k))
            );
          })
          .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
        setEvents(filtered);
      } catch (err) {
        setEvents([]);
      }
      setLoading(false);
    };
    fetchEvents();
    intervalId = setInterval(fetchEvents, 30000); // refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, [courseTitle, upcomingDays]);

  return (
    <motion.div className="w-full" whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="bg-[#0f0f10ff] flex flex-col rounded-[1em] w-full min-h-[24rem]">
        <CardHeader>
          <CardTitle className="font-nun leading-tight">{courseTitle} - upcoming events</CardTitle>
          <CardDescription className="font-dm text-white/50">
            events for the week
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          <ScrollArea className="h-full pr-2">
            {loading ? (
              <p className="text-neutral-400 text-sm">loading...</p>
            ) : events.length === 0 ? (
              <p className="text-neutral-400 text-sm">no events.</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Dialog key={event.id}>
                    <DialogTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-zinc-700/50 p-3 rounded-2xl hover:bg-zinc-800/60 transition-all cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold">{event.summary}</p>
                          <p className="text-xs text-neutral-400">{formatEventDate(new Date(event.start))}</p>
                        </div>
                        {event.location && <p className="text-xs text-neutral-500">{event.location}</p>}
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
                          {event.location && (
                            <p className="text-sm text-neutral-500">{event.location}</p>
                          )}
                        </DialogDescription>
                      </DialogHeader>

                      {event.description && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-neutral-300">{event.description}</p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
<Button
  className="font-dm font-light flex items-center gap-1 rounded-md hover:underline"
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
      </Card>
    </motion.div>
  );
}
