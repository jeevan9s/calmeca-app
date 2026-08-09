"use client";

import Layout from "@/renderer/components/Layout";
import { ScrollArea } from "@/components/scroll-area";
import { motion } from "framer-motion";
import EventsCard from "@/renderer/components/Dashboard/EventsCard";
import CoursesCard from "@/renderer/components/Dashboard/CoursesCard";
import ClubsCard from "@/renderer/components/Dashboard/ClubsCard";
import DeadlinesCard from "@/renderer/components/Dashboard/DeadlinesCard";
import UpcomingExamsCard from "@/renderer/components/Dashboard/UpcomingExamsCard";
import FloatingActionButton from "@/renderer/components/FloatingActionButton";
import DailySummaryCard from "@/renderer/components/Dashboard/DailySummaryCard";

export default function Dashboard() {
  const todayDate = new Date();
  const formattedHeaderDate = todayDate
    .toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950/70 text-white w-full overflow-hidden">
      <Layout>
        <ScrollArea className="h-screen p-4">
          <motion.div
            className="flex flex-col xl:flex-row gap-6"
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex flex-col flex-1 gap-5">
              <div className="mb-4">
                <motion.h2
                  className="font-dm text-neutral-400 text-sm ml-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  {formattedHeaderDate}
                </motion.h2>
                <motion.h1
                  className="font-dm font-bold text-2xl sm:text-3xl lg:text-4xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  dashboard
                </motion.h1>
              </div>

              <EventsCard />
              <CoursesCard />
            </motion.div>

            <motion.div className="flex flex-col flex-1 gap-5">
              <div className="flex flex-col sm:flex-row gap-5">
                <UpcomingExamsCard />
                <ClubsCard />
              </div>
              <DailySummaryCard />
              <DeadlinesCard />
            </motion.div>
          </motion.div>
        </ScrollArea>

        <FloatingActionButton />
      </Layout>
    </div>
  );
}
