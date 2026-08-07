"use client";

import React from "react";
import { CourseType, TaskType } from "@/services/db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";

interface CourseFormFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  code: string;
  setCode: (val: string) => void;
  professor: string;
  setProfessor: (val: string) => void;
  profEmail: string;
  setProfEmail: (val: string) => void;
  officeHours: string;
  setOfficeHours: (val: string) => void;
  selectedType: CourseType;
  setSelectedType: (val: CourseType) => void;
  description: string;
  setDescription: (val: string) => void;
  hasLabTime: boolean;
  setHasLabTime: (val: boolean) => void;
  labStartTime: Date | null;
  setLabStartTime: (val: Date | null) => void;
  labEndTime: Date | null;
  setLabEndTime: (val: Date | null) => void;
  recurring: boolean;
  setRecurring: (val: boolean) => void;
  recurrence: string;
  setRecurrence: (val: string) => void;
  customDays: string;
  setCustomDays: (val: string) => void;
  selectedTaskType: TaskType;
  setSelectedTaskType: (val: TaskType) => void;
  customTaskType: string;
  setCustomTaskType: (val: string) => void;
  activePicker: string | null;
  setActivePicker: (val: string | null) => void;
}

const courseTypeOptions: CourseType[] = ["lecture", "lab", "studio", "online"];
const courseTypeLabels: Record<CourseType, string> = {
  lecture: "Lecture",
  lab: "Lab",
  studio: "Studio",
  online: "Online",
};

const taskTypeOptions: TaskType[] = ["lab", "problem set", "tutorial", "custom"];
const taskTypeLabels: Record<string, string> = {
  lab: "lab",
  "problem set": "pset",
  tutorial: "tutorial",
  custom: "custom",
};

export default function CourseFormFields({
  title,
  setTitle,
  code,
  setCode,
  professor,
  setProfessor,
  profEmail,
  setProfEmail,
  officeHours,
  setOfficeHours,
  selectedType,
  setSelectedType,
  description,
  setDescription,
  hasLabTime,
  setHasLabTime,
  labStartTime,
  setLabStartTime,
  labEndTime,
  setLabEndTime,
  recurring,
  setRecurring,
  recurrence,
  setRecurrence,
  customDays,
  setCustomDays,
  selectedTaskType,
  setSelectedTaskType,
  customTaskType,
  setCustomTaskType,
  activePicker,
  setActivePicker,
}: CourseFormFieldsProps) {
  const inputStyle =
    "w-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm h-10 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm text-white font-dm font-thin mb-1 block">course title  <span className="text-red-400">*</span></label>
          <input
            type="text"
            placeholder="e.g. data structures & algorithms"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputStyle}
          />
        </div>
        <div>
          <label className="text-sm text-white font-dm font-thin mb-1 block">course code  <span className="text-red-400">*</span></label>
          <input
            type="text"
            placeholder="e.g. MREN178"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-white font-dm font-thin mb-1 block">description</label>
        <textarea
          placeholder="brief overview..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50 rounded-xl text-white font-dm p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-white font-dm font-thin mb-1 block">professor  <span className="text-red-400">*</span></label>
          <input
            type="text"
            placeholder="e.g. Dr.Doe"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            className={inputStyle}
          />
        </div>
        <div>
          <label className="text-sm text-white font-dm font-thin mb-1 block">professor email</label>
          <input
            type="email"
            placeholder="e.g. john.doe@queensu.ca"
            value={profEmail}
            onChange={(e) => setProfEmail(e.target.value)}
            className={inputStyle}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-white font-dm font-thin mb-1 block">office hours</label>
          <input
            type="text"
            placeholder="e.g. mon/wed 2-4 PM"
            value={officeHours}
            onChange={(e) => setOfficeHours(e.target.value)}
            className={inputStyle}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-sm text-white font-dm font-thin block mb-2">
          course type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {courseTypeOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50"
            >
              <input
                type="radio"
                name="course type"
                value={option}
                checked={selectedType === option}
                onChange={() => setSelectedType(option)}
                className="w-3.5 h-3.5 text-blue-500 bg-zinc-900 rounded-full border-zinc-600 focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-xs text-white font-dm">
                {courseTypeLabels[option]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800/50 border-zinc-700/50 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-white font-dm font-thin">
              add recurring tasks
            </span>
          </label>
        </div>

        {recurring && (
          <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50 mt-3 space-y-4">
            <div className="space-y-2.5">
              <label className="text-sm text-white font-dm font-thin block mb-2">
                task type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {taskTypeOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50"
                  >
                    <input
                      type="radio"
                      name="recurring task type"
                      value={option}
                      checked={selectedTaskType === option}
                      onChange={() => setSelectedTaskType(option)}
                      className="w-3.5 h-3.5 text-blue-500 bg-zinc-900 rounded-full border-zinc-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-xs text-white font-dm">
                      {taskTypeLabels[option]}
                    </span>
                  </label>
                ))}
              </div>
              {selectedTaskType === "custom" && (
                <input
                  type="text"
                  value={customTaskType}
                  onChange={(e) => setCustomTaskType(e.target.value)}
                  placeholder="enter custom task type"
                  className={inputStyle + " mt-2"}
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <label className="text-sm text-white font-dm font-thin">
                repeat:
              </label>
              <Select
                value={recurrence}
                onValueChange={setRecurrence}
              >
                <SelectTrigger
                  className="w-full sm:w-40 border-none bg-zinc-800 rounded-xl font-dm text-xs text-white hover:bg-zinc-700 focus:ring-1 focus:ring-zinc-600 h-9 px-3"
                  aria-label="Select recurrence frequency"
                >
                  <SelectValue placeholder="select frequency" />
                </SelectTrigger>
                <SelectContent className="border-none rounded-xl mt-2 bg-zinc-900 text-white border-zinc-700 shadow-xl">
                  <SelectItem
                    value="none"
                    className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl text-xs font-dm"
                  >
                    select frequency
                  </SelectItem>
                  <SelectItem
                    value="weekly"
                    className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl text-xs font-dm"
                  >
                    weekly
                  </SelectItem>
                  <SelectItem
                    value="biweekly"
                    className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl text-xs font-dm"
                  >
                    bi-weekly
                  </SelectItem>
                  <SelectItem
                    value="custom"
                    className="focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white cursor-pointer rounded-xl text-xs font-dm"
                  >
                    custom
                  </SelectItem>
                </SelectContent>
              </Select>

              {recurrence === "custom" && (
                <input
                  type="text"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="e.g. Mon, Wed"
                  className="w-full sm:w-32 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-dm"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}