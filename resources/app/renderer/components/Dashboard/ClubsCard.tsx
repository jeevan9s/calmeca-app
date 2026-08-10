"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/card";
import { Button } from "@/components/button";
import { ExternalLink } from "react-feather";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/dialog";
import { fetchGoogleCalendarEvents } from "../../../../integrations/google/google";

const CALENDAR_EVENTS_UPDATED_EVENT = "calmeca:calendar-events-updated";

const formatEventDate = (start: string | Date) => {
  const startDate = start instanceof Date ? start : new Date(start);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(startDate, today)) {
    return startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } else if (isSameDay(startDate, tomorrow)) {
    const weekday = startDate.toLocaleDateString("en-US", { weekday: "short" });
    return `Tomorrow, ${weekday}`;
  } else {
    return startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
};

const CLUB_KEYWORDS = ["meeting", "club", "team", "society", "association", "design", "avionics"];
const CLUB_KEYWORDS_REGEX = new RegExp(CLUB_KEYWORDS.join("|"), "i");

export default function ClubsCard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      const all = await fetchGoogleCalendarEvents();
      const now = new Date();
      const upcoming = all
        .filter((ev) => {
          if (!ev.start) return false;
          if (new Date(ev.end) < now) return false;
          return CLUB_KEYWORDS_REGEX.test(ev.summary ?? "");
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 3);
      setEvents(upcoming);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleCalendarEventsUpdated = () => {
      void loadEvents();
    };

    loadEvents();
    const interval = setInterval(loadEvents, 60_000);
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
  }, [loadEvents]);

  const isToday = (date: string | Date) => {
    const d = date instanceof Date ? date : new Date(date);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  };

  

  return (
    <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }} className="rounded-lg flex-1">
      <Card className="h-44 sm:h-48 bg-zinc-400/10 w-full rounded-xl">
        <CardHeader>
          <CardTitle className="font-dm">design teams & clubs</CardTitle>
          <CardDescription className="text-white/50 font-dm">upcoming meetings</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-2">
            <div className="flex flex-col gap-3">
              {loading ? (
                <p className="text-neutral-400 text-sm">loading...</p>
              ) : events.length > 0 ? (
                events.map((e) => (
                  <Dialog key={e.id}>
                    <DialogTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col text-sm text-white/80 font-dm border-b border-zinc-700/50 pb-1 -mt-1 p-1 rounded-xl hover:bg-zinc-800/30 cursor-pointer"
                      >
                        <span className="font-semibold">{e.summary}</span>
                        <span className="text-xs text-neutral-400">
                          {formatEventDate(e.start)}
                          {isToday(e.start) ? ` - ${new Date(e.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
                        </span>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-none text-white rounded-[1em]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold">{e.summary}</DialogTitle>
                        <DialogDescription className="text-neutral-400 text-sm">
                          {`${new Date(e.start).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })} ${new Date(e.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${new Date(e.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                          <p className="text-sm text-neutral-500">{e.location}</p>

                                                    <Button
                            className="font-dm font-light flex items-center ml-[-0.75em] rounded-md hover:underline transition-transform duration-200 hover:scale-105"
                            onClick={() => {
                              const start = new Date(e.start);
                              
                              const end = new Date(e.end);
                              const formatDate = (date: Date) =>
                                date.toISOString().replace(/-|:|\.\d{3}/g, "");
                              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                                e.summary
                              )}&dates=${formatDate(start)}/${formatDate(end)}${
                                e.location ? `&location=${encodeURIComponent(e.location)}` : ""
                              }${e.description ? `&details=${encodeURIComponent(e.description)}` : ""}`;
                              window.open(url, "_blank");
                            }}
                          >
                            open in Google Calendar <ExternalLink size={14} />
                          </Button>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                ))
              ) : (
                <p className="text-neutral-400 text-sm">no upcoming meetings</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
