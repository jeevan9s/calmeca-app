"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Button } from "@/components/button";
import { CalendarEvent } from "@/services/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/dialog";
import { ExternalLink } from "react-feather";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/scroll-area";

interface EventsCardProps {
  events: CalendarEvent[];
  loading: boolean;
}

export default function EventsCard({ events, loading }: EventsCardProps) {
  const uniqueEvents = Array.from(
    new Map(events.map((e) => [e.summary, e])).values()
  );

  return (
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
            ) : uniqueEvents.length === 0 ? (
              <p className="text-neutral-400 text-sm">no events today.</p>
            ) : (
              <div className="space-y-3">
                {uniqueEvents.map((event) => (
                  <Dialog key={event.id}>
                    <DialogTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-zinc-700/50 p-3 rounded-2xl hover:bg-zinc-800/60 transition-all cursor-pointer"
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

        <CardFooter className="flex justify-end gap-2 pb-2 pr-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="font-thin font-dm hover:underline rounded-md"
              onClick={() => window.open("https://calendar.google.com", "_blank")}
            >
              open in calendar <ExternalLink />
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
