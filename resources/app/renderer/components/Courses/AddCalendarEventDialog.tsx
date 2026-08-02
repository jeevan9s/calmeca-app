import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import DateTimePicker from './DatePickerComponent';
import { addCalendarEvent } from '@/lib/helpers/calendarHelpers';

interface AddCalendarEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: () => void;
}

export default function AddCalendarEventDialog({
  isOpen,
  onClose,
  onEventAdded,
}: AddCalendarEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [allDay, setAllDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    setIsSubmitting(true);

    try {
      await addCalendarEvent(
        title.trim(),
        startDate,
        endDate,
        'deadline',
        allDay
      );

      setTitle('');
      setDescription('');
      setStartDate(null);
      setEndDate(null);
      setAllDay(false);
      
      onEventAdded();
      onClose();
    } catch (err) {
      console.error('Error creating calendar event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStartDate(null);
    setEndDate(null);
    setAllDay(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-neutral-900 p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-lg text-white font-nun font-semibold mb-4">
                  add calendar event
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-400 font-dm mb-1 font-thin">
                      event title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="enter event title"
                      className="w-full flex items-center font-thin text-sm gap-2 bg-zinc-800 rounded-xl text-white font-dm h-10 border-none outline-none transition-transform duration-200 ease-in-out focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 active:scale-95 px-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-400 font-dm mb-1 font-thin">
                      description
                    </Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="optional description"
                      className="w-full flex items-center font-thin text-sm gap-2 bg-zinc-800 rounded-xl text-white font-dm h-10 border-none outline-none transition-transform duration-200 ease-in-out focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 active:scale-95 px-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-gray-400 font-dm mb-1 font-thin">
                        start time <span className="text-red-500">*</span>
                      </Label>
                      <DateTimePicker
                        label=""
                        selected={startDate}
                        onChange={setStartDate}
                        allDay={allDay}
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-400 font-dm mb-1 font-thin">
                        end time <span className="text-red-500">*</span>
                      </Label>
                      <DateTimePicker
                        label=""
                        selected={endDate}
                        onChange={setEndDate}
                        allDay={allDay}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={allDay}
                      onChange={(e) => setAllDay(e.target.checked)}
                      className="w-4 h-4 text-white bg-zinc-800 border-gray-600 focus:ring-white focus:ring-2"
                    />
                    <Label htmlFor="allDay" className="text-white/80 font-dm">
                      all day event
                    </Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!title.trim() || !startDate || !endDate || isSubmitting}
                      className="px-4 py-1 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-zinc-800 rounded-[0.50rem] font-dm text-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                    >
                      {isSubmitting ? "creating..." : "create event"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

