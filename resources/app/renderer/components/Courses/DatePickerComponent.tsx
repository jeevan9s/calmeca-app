"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Label } from "@/components/label";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

interface DateTimePickerProps {
  selected: Date | null;
  startTime?: Date;
  endTime?: Date;
  onChange: (date: Date, startTime?: Date, endTime?: Date) => void;
  label: string;
  allDay?: boolean;
}

export default function DateTimePicker({
  selected,
  startTime,
  endTime,
  onChange,
  label,
  allDay = false,
}: DateTimePickerProps) {
  const [start, setStart] = useState<Date>(startTime || selected || new Date());
  const [end, setEnd] = useState<Date>(
    endTime || ((startTime ?? selected)
      ? new Date(((startTime ?? selected)?.getTime() ?? Date.now()) + 60 * 60 * 1000)
      : new Date(Date.now() + 60 * 60 * 1000))
  );

  useEffect(() => {
    if (selected) setStart(selected);
    if (startTime) setStart(startTime);
    if (endTime) setEnd(endTime);
  }, [selected, startTime, endTime]);
  const [open, setOpen] = useState(false);

  const mergeDateWithTime = (date: Date, hours: number, minutes: number) => {
    const merged = new Date(date);
    merged.setHours(hours, minutes, 0, 0);
    return merged;
  };

  const handleDateSelect = (date?: Date) => {
    if (!date) return;
    const newStart = mergeDateWithTime(date, start.getHours(), start.getMinutes());
    const newEnd = mergeDateWithTime(date, end.getHours(), end.getMinutes());
    setStart(newStart);
    setEnd(newEnd);
    onChange(newStart, newStart, newEnd);
    setOpen(false);
  };

  const handleStartChange = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    const newStart = mergeDateWithTime(start, h, m);
    let newEnd = end;
    if (!allDay && end <= newStart) newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
    setStart(newStart);
    setEnd(newEnd);
    onChange(newStart, newStart, newEnd);
  };

  const handleEndChange = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    const newEnd = mergeDateWithTime(end, h, m);
    setEnd(newEnd);
    onChange(start, start, newEnd);
  };

  return (
    <div className="flex gap-5 items-end w-full sm:w-auto">
      <div className="flex flex-col">
        <Label className="text-sm text-gray-400 font-mp mb-1 font-thin">{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-zinc-800 rounded-xl text-white font-dm
                         h-10 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-zinc-700 
                         hover:text-white focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 active:scale-95 px-2"
            >
              {start instanceof Date && !isNaN(start.getTime())
                ? format(start, "EEE, MMM dd")
                : "select date"}
              <ChevronDownIcon size={16} className="transition-transform duration-200 group-hover:rotate-180" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-neutral-900 rounded-xl text-white border-none outline-none transform transition-transform duration-200 ease-in-out scale-95 hover:scale-100">
            <Calendar
              mode="single"
              required
              selected={start}
              onSelect={handleDateSelect}
              className="bg-neutral-900 text-white font-dm text-sm rounded-xl shadow-none outline-none border-none"
            />
          </PopoverContent>
        </Popover>
      </div>

      <AnimatePresence initial={false}>
        {!allDay && (
          <motion.div
            key="time-selector"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col gap-2 overflow-hidden"
          >
            <Label className="text-sm text-gray-400 font-thin font-dm -mb-1 font-mp">select time</Label>
            <div className="flex gap-2 items-center">
              <input
                type="time"
                step="60"
                value={start ? format(start, "HH:mm") : ""}
                onChange={(e) => handleStartChange(e.target.value)}
                className="bg-zinc-800 text-white rounded-[0.65em] font-dm text-sm px-3 py-2 w-20 h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-500 focus:outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
              />
              <span className="text-white">–</span>
              <input
                type="time"
                step="60"
                value={end ? format(end, "HH:mm") : ""}
                onChange={(e) => handleEndChange(e.target.value)}
                className="bg-zinc-800 text-white rounded-[0.65em] font-dm text-sm px-3 py-2 w-20 h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-500 focus:outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
