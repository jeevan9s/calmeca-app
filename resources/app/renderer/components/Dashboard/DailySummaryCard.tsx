"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { motion } from "framer-motion";

export default function DailySummaryCard() {
  const [classesCount, setClassesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [deadlinesCount, setDeadlinesCount] = useState(0);

  const fetchCounts = async () => {
    try {
      const events: any[] = await (window as any).electronAPI.fetchGoogleCalendarEvents();

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const todaysEvents = events.filter(
        (ev) => ev.start?.includes("T") && new Date(ev.start) >= startOfToday && new Date(ev.start) <= endOfToday
      );

      const apscClasses = todaysEvents.filter((ev) =>
        ev.summary?.toLowerCase().includes("apsc")
      );

      setClassesCount(apscClasses.length);
      setEventsCount(todaysEvents.length - apscClasses.length);
      setDeadlinesCount(0);
    } catch (err) {
      console.error('Google Calendar fetch failed:', err);
      setClassesCount(0);
      setEventsCount(0);
      setDeadlinesCount(0);
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="bg-[#0f0f10ff] w-full rounded-lg p-2 flex flex-col min-h-[0px]">
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
