"use client"

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Label } from "@/components/label";
import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { ChevronDownIcon, ClockIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";


const DATE_FORMAT = "dd/MM/yy";

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return { hours, minutes, label: format(new Date(2000, 0, 1, hours, minutes), "h:mm a") };
});

interface EventDateTimeFieldProps {
  id: "start" | "end";
  label: string;
  selected: Date | null;
  onChange: (date: Date) => void;
  allDay: boolean;
  activePicker: string | null;
  setActivePicker: (id: string | null) => void;
}

export function EventDateTimeField({
  id,
  label,
  selected,
  onChange,
  allDay,
  activePicker,
  setActivePicker,
}: EventDateTimeFieldProps) {
  const [draft, setDraft] = useState<Date>(selected || new Date());
  const activeTimeRef = useRef<HTMLButtonElement>(null);

  const dateKey = `${id}-date`;
  const timeKey = `${id}-time`;
  const dateOpen = activePicker === dateKey;
  const timeOpen = activePicker === timeKey;

  useEffect(() => {
    if (selected) setDraft(selected);
  }, [selected]);

  useEffect(() => {
    if (timeOpen) {
      activeTimeRef.current?.scrollIntoView({ block: "center" });
    }
  }, [timeOpen]);

  const handleDateOpenChange = (next: boolean) => {
    if (next) setActivePicker(dateKey);
    else if (activePicker === dateKey) setActivePicker(null);
  };

  const handleTimeOpenChange = (next: boolean) => {
    if (next) setActivePicker(timeKey);
    else if (activePicker === timeKey) setActivePicker(null);
  };

  const mergeDateWithTime = (date: Date, hours: number, minutes: number) => {
    const merged = new Date(date);
    merged.setHours(hours, minutes, 0, 0);
    return merged;
  };

  const handleDateSelect = (date?: Date) => {
    if (!date) return;
    const next = allDay
      ? mergeDateWithTime(date, 0, 0)
      : mergeDateWithTime(date, draft.getHours(), draft.getMinutes());
    setDraft(next);
    onChange(next);
    setActivePicker(null);
  };

  const handleTimeSelect = (hours: number, minutes: number) => {
    const next = mergeDateWithTime(draft, hours, minutes);
    setDraft(next);
    onChange(next);
    setActivePicker(null);
  };

  const hasDate = selected instanceof Date && !isNaN(selected.getTime());

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-sm text-white font-dm font-thin">{label}</Label>

      <div className="flex flex-col gap-2 w-full">
        <Popover open={dateOpen} onOpenChange={handleDateOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="group cursor-pointer flex items-center justify-between gap-2 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm
                         h-12 px-4 w-full transition-colors duration-150 hover:bg-zinc-700 hover:text-white
                          focus:outline-none"
            >
              <span className={hasDate ? "text-gray-500 text-sm" : "text-gray-500 text-sm"}>
                {hasDate ? format(draft, DATE_FORMAT) : "select date"}
              </span>
              <ChevronDownIcon
                size={16}
                className="text-white/50 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-fit p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white shadow-2xl"
          >
            <Calendar
              mode="single"
              required
              selected={draft}
              onSelect={handleDateSelect}
              className="bg-zinc-900 text-white font-dm p-1"
              classNames={{
                months: "flex flex-col",
                month: "space-y-3",
                caption: "flex justify-center items-center relative mb-2 px-8",
                caption_label: "text-sm font-medium text-white",
                nav: "flex items-center",
                nav_button:
                  "cursor-pointer h-7 w-7 flex items-center justify-center rounded-lg text-white/60 hover:bg-zinc-800 hover:text-white transition-colors",
                nav_button_previous: "absolute left-0",
                nav_button_next: "absolute right-0",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell:
                  "text-white/40 w-9 h-8 flex items-center justify-center text-xs font-normal",
                row: "flex w-full",
                cell: "w-9 h-9 flex items-center justify-center p-0 relative",
                day: "cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg text-sm font-normal text-white/80 hover:bg-zinc-800 hover:text-white transition-colors",
                day_selected:
                  "!bg-blue-600 !text-white font-semibold hover:!bg-blue-600",
                day_today: "!bg-transparent text-blue-400 font-semibold",
                day_outside: "text-white/20",
                day_disabled: "text-white/20 cursor-not-allowed",
              }}
            />
          </PopoverContent>
        </Popover>

        <AnimatePresence initial={false}>
          {!allDay && (
            <motion.div
              key="time-selector"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <Popover open={timeOpen} onOpenChange={handleTimeOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-label={`${label} time`}
                    className="group cursor-pointer flex items-center justify-between gap-1.5 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm
                               h-12 px-4 w-full transition-colors duration-150 hover:bg-zinc-700 hover:text-white
                                focus:outline-none"
                  >
                    <ClockIcon size={14} className="text-gray-500 shrink-0" />
                    <span className={`text-sm flex-1 text-left truncate ${hasDate ? "text-white text-sm" : "text-gray-500 text-sm"}`}>
                      {hasDate ? format(draft, "h:mm a") : "--:--"}
                    </span>
                    <ChevronDownIcon
                      size={14}
                      className="text-white/50 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[--radix-popover-trigger-width] p-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white shadow-2xl max-h-64 overflow-y-auto"
                >
                  <div className="flex flex-col gap-0.5">
                    {TIME_OPTIONS.map(({ hours, minutes, label: timeLabel }) => {
                      const active =
                        hasDate && draft.getHours() === hours && draft.getMinutes() === minutes;
                      return (
                        <button
                          key={timeLabel}
                          type="button"
                          ref={active ? activeTimeRef : undefined}
                          onClick={() => handleTimeSelect(hours, minutes)}
                          className={`cursor-pointer w-full text-left px-2.5 py-1.5 rounded-lg text-sm font-dm transition-colors
                            ${
                              active
                                ? "font-semibold"
                                : "text-white/80 hover:bg-zinc-800 hover:text-white"
                            }`}
                        >
                          {timeLabel}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}