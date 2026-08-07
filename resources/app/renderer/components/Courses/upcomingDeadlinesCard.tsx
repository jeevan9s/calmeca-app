"use client";

import { useEffect, useState } from "react";
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
} from "@/components/dialog";
import { ExternalLink, MapPin, CalendarX, AlertCircle, CalendarDays, Clock, ChevronRight } from "lucide-react";
import { CalendarEvent } from "@/services/db";
import { fetchGoogleCalendarEvents } from "@/services/platform";

interface UpcomingCourseEventsCardProps {
  courseTitle: string;
  upcomingDays?: number;
  refreshIntervalMs?: number;
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

  if (isToday)
    return start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (isTomorrow) return "Tomorrow";
  return start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function EventRowSkeleton() {
  return (
    <div className="border border-zinc-800/60 p-4 rounded-2xl flex justify-between items-center animate-pulse">
      <div className="space-y-2.5">
        <div className="h-3.5 w-36 bg-zinc-800 rounded" />
        <div className="h-2.5 w-20 bg-zinc-800/70 rounded" />
      </div>
      <div className="h-3.5 w-3.5 rounded-full bg-zinc-800/70" />
    </div>
  );
}

export default function UpcomingCourseEventsCard({
  courseTitle,
  upcomingDays = 7,
  refreshIntervalMs = 60000,
}: UpcomingCourseEventsCardProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hasLoadedOnce = { current: false };

    const fetchEvents = async () => {
      if (!hasLoadedOnce.current) setLoading(true);
      try {
        const allEvents = await fetchGoogleCalendarEvents();
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + upcomingDays);
        const filtered = allEvents
          .filter((e: any) => {
            const start = new Date(e.start);
            return (
              start >= now &&
              start <= future &&
              e.summary &&
              e.summary.toLowerCase().includes(courseTitle.toLowerCase()) &&
              KEYWORDS.some((k) => e.summary.toLowerCase().includes(k))
            );
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.start).getTime() - new Date(b.start).getTime(),
          );
        if (!cancelled) {
          setEvents(filtered);
          setError(false);
        }
      } catch (err) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
          hasLoadedOnce.current = true;
        }
      }
    };

    fetchEvents();
    const intervalId = setInterval(fetchEvents, refreshIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [courseTitle, upcomingDays, refreshIntervalMs]);

  return (
    <motion.div
      className="w-full"
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-[#0f0f10ff] shadow-sm shadow-black/20 flex flex-col rounded-[1.25em] w-full min-h-[24rem]">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <CardTitle className="font-dm text-base font-semibold leading-tight truncate">
                upcoming events
              </CardTitle>
              <CardDescription className="font-dm text-white/40 text-xs truncate">
                {courseTitle} · next {upcomingDays} day{upcomingDays !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full pr-2">
            {loading ? (
              <div className="space-y-3">
                <EventRowSkeleton />
                <EventRowSkeleton />
                <EventRowSkeleton />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-3 rounded-2xl border border-dashed border-zinc-800">
                <AlertCircle size={20} className="text-neutral-500" />
                <p className="text-neutral-400 text-sm">
                  couldn't load your events
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-10 rounded-2xl border border-dashed border-zinc-800">
                <CalendarX size={20} className="text-neutral-600" />
                <p className="text-neutral-400 text-sm">
                  nothing on the calendar this week.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event, index) => (
                  <Dialog
                    key={event.id}
                    open={openEventId === event.id}
                    onOpenChange={(open) => setOpenEventId(open ? event.id : null)}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setOpenEventId(event.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                      className="w-full text-left g-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 p-4 rounded-2xl hover:bg-zinc-800/50 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors cursor-pointer flex justify-between items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate" title={event.summary}>
                          {event.summary}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                            <Clock size={11} className="flex-shrink-0" />
                            {formatEventDate(new Date(event.start))}
                          </span>
                          {event.location && (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 min-w-0 max-w-[10rem]">
                              <MapPin size={11} className="flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-600 flex-shrink-0" />
                    </motion.button>

                    <DialogContent className="bg-zinc-900 border-none text-white rounded-[1em]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold break-words">
                          {event.summary}
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400 text-sm">
                          {`${new Date(event.start).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })} · ${new Date(event.start).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })} – ${new Date(event.end).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}`}
                        </DialogDescription>
                      </DialogHeader>

                      {(event.location || event.description) && (
                        <div className="space-y-3 pt-1">
                          {event.location && (
                            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                              <MapPin size={14} className="flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {event.description && (
                            <p className="text-sm text-neutral-300 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex justify-end">
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            className="font-dm text-sm font-medium flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-white transition-colors"
                            onClick={() => {
                              const start = new Date(event.start);
                              const end = new Date(event.end);

                              const formatDate = (date: Date) =>
                                date.toISOString().replace(/-|:|\.\d{3}/g, "");

                              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                                event.summary,
                              )}&dates=${formatDate(start)}/${formatDate(end)}${
                                event.location
                                  ? `&location=${encodeURIComponent(event.location)}`
                                  : ""
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
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0f0f10ff] to-transparent" />
        </CardContent>
      </Card>
    </motion.div>
  );
}