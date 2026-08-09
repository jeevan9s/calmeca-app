"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { motion } from "framer-motion";
import { fetchGoogleCalendarEvents } from "@/services/google";
import { getTasks } from "@/services/core services/taskService";

const CLASS_KEYWORDS = ["lecture", "lab", "tutorial", "class", "seminar", "workshop", "elec", "hist"];
const CALENDAR_EVENTS_UPDATED_EVENT = "calmeca:calendar-events-updated";

export default function DailySummaryCard() {
  const [classesCount, setClassesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [deadlinesCount, setDeadlinesCount] = useState(0);

  const fetchCounts = async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const [calEvents, tasks] = await Promise.all([
        fetchGoogleCalendarEvents(),
        getTasks({ completed: false }),
      ]);

      const todaysEvents = calEvents.filter((ev) => {
        if (!ev.start?.includes("T")) return false;
        const d = new Date(ev.start);
        return d >= startOfToday && d <= endOfToday;
      });

      const classes = todaysEvents.filter((ev) =>
        CLASS_KEYWORDS.some((kw) => ev.summary?.toLowerCase().includes(kw))
      );
      const dueToday = tasks.filter((t) => {
        if (!t.deadline) return false;
        const d = new Date(t.deadline);
        return d >= startOfToday && d <= endOfToday;
      });

      setClassesCount(classes.length);
      setEventsCount(todaysEvents.length - classes.length);
      setDeadlinesCount(dueToday.length);
    } catch (err) {
      console.error("DailySummaryCard fetch failed:", err);
    }
  };

  useEffect(() => {
    const handleCalendarEventsUpdated = () => {
      void fetchCounts();
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60_000);
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
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="bg-[#0f0f10ff] w-full rounded-xl p-2 flex flex-col min-h-[0px]">
        <CardHeader>
          <CardTitle className="text-sm font-raleway mr- text-white lowercase">daily summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center px-1 flex-1">
          <div className="flex flex-col items-center px-1 font-dm">
            <p className="text-2xl font-bold text-white">{classesCount}</p>
            <p className="text-[12px] text-neutral-400 lowercase">classes</p>
          </div>
          <div className="h-6 border-l border-neutral-700 mx-2" />
          <div className="flex flex-col items-center px-1 font-dm">
            <p className="text-2xl font-bold text-white">{eventsCount}</p>
            <p className="text-[12px] text-neutral-400 lowercase">events</p>
          </div>
          <div className="h-6 border-l border-neutral-700 mx-2" />
          <div className="flex flex-col items-center px-1 font-dm">
            <p className="text-2xl font-bold text-white">{deadlinesCount}</p>
            <p className="text-[12px] text-neutral-400 lowercase">deadlines</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
