"use client";

import { useEffect, useState, type FormEvent, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { EventDateTimeField } from "../DateField";
import { GCalEvent } from "@/services/db";
import {
  addGoogleCalendarEvent,
  updateGoogleCalendarEvent,
} from "@/services/google";

const CALENDAR_EVENTS_UPDATED_EVENT = "calmeca:calendar-events-updated";

interface AddCalendarEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: () => void;
  eventToEdit?: GCalEvent | null;
}

export default function AddCalendarEventDialog({
  isOpen,
  onClose,
  onEventAdded,
  eventToEdit,
}: AddCalendarEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [allDay, setAllDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activePicker, setActivePicker] = useState<string | null>(null);

  const isEditing = Boolean(eventToEdit?.id);

  useEffect(() => {
    if (!allDay) return;
    if (startDate && (!endDate || endDate < startDate)) {
      setEndDate(startDate);
    }
  }, [allDay, startDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(null);
    setEndDate(null);
    setAllDay(false);
    setActivePicker(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (eventToEdit) {
      const start = eventToEdit.start ? new Date(eventToEdit.start) : new Date();
      const end = eventToEdit.end ? new Date(eventToEdit.end) : start;
      setTitle(eventToEdit.summary || "");
      setDescription(eventToEdit.description || "");
      setStartDate(start);
      setEndDate(end);
      setAllDay(!eventToEdit.start.includes("T"));
      setActivePicker(null);
      return;
    }

    resetForm();
  }, [isOpen, eventToEdit]);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !startDate || !endDate || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (allDay) {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }

      const payload: Partial<GCalEvent> = {
        summary: title.trim(),
        start: start.toISOString(),
        end: end.toISOString(),
        description: description.trim() || undefined,
      };

      const saved = eventToEdit?.id
        ? await updateGoogleCalendarEvent(eventToEdit.id, payload)
        : await addGoogleCalendarEvent({
            id: "",
            summary: payload.summary || "",
            start: payload.start || "",
            end: payload.end || "",
            description: payload.description,
          });

      if (!saved) {
        throw new Error(
          eventToEdit?.id
            ? "Google Calendar event update failed"
            : "Google Calendar event creation failed",
        );
      }

      window.dispatchEvent(new Event(CALENDAR_EVENTS_UPDATED_EVENT));

      resetForm();
      onEventAdded();
      onClose();
    } catch (err) {
      console.error(
        eventToEdit?.id
          ? "Error updating calendar event:"
          : "Error creating calendar event:",
        err,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const isButtonDisabled =
    !title.trim() || !startDate || !endDate || isSubmitting;
return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-end p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-left shadow-2xl transition-all my-auto flex flex-col justify-between">
                <div>
                  <Dialog.Title className="text-xl text-white font-dm font-semibold mb-6">
                    {isEditing ? "edit calendar event" : "add calendar event"}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2.5">
                      <Label className="block text-sm text-white/80 font-dm font-medium mb-2">
                        event title <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="enter event title"
                        className="w-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm h-12 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <Label className="block text-sm text-white/80 font-dm font-medium mb-2">
                        description
                      </Label>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="optional description"
                        className="w-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm h-12 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2.5">
                        <EventDateTimeField
                          id="start"
                          label={allDay ? "start date" : "start date & time"}
                          selected={startDate}
                          onChange={(date) => {
                            setStartDate(date);
                            if (date && endDate && date > endDate) {
                              setEndDate(date);
                            }
                          }}
                          allDay={allDay}
                          activePicker={activePicker}
                          setActivePicker={setActivePicker}
                        />
                      </div>

                      <div className="space-y-2.5">
                        <EventDateTimeField
                          id="end"
                          label={allDay ? "end date" : "end date & time"}
                          selected={endDate}
                          onChange={setEndDate}
                          allDay={allDay}
                          activePicker={activePicker}
                          setActivePicker={setActivePicker}
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label className="block text-sm text-white/80 font-dm font-medium mb-2">
                        options
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="allDay"
                          checked={allDay}
                          onChange={(e) => setAllDay(e.target.checked)}
                          className="w-4 h-4 text-white bg-zinc-800 border-gray-600 rounded focus:ring-2 cursor-pointer"
                        />
                        <Label
                          htmlFor="allDay"
                          className="text-white/80 font-dm cursor-pointer text-sm"
                        >
                          all day event
                        </Label>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 hover:text-white rounded-xl font-dm text-sm transition-all duration-200 border border-zinc-700 cursor-pointer"
                  >
                    cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => handleSubmit(e)}
                    disabled={isButtonDisabled}
                    className="px-6 py-2 bg-zinc-300 hover:bg-zinc-400 active:bg-zinc-500 text-zinc-900 hover:font-semibold cursor-pointer disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:text-white/50 rounded-xl font-dm text-sm transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    {isSubmitting
                      ? isEditing
                        ? "saving..."
                        : "creating..."
                      : isEditing
                        ? "save changes"
                        : "create event"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}