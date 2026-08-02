import { CourseType, courseTypeLabels } from "@/services/db";
import { useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@radix-ui/react-tooltip";

interface CourseFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  professor: string;
  profEmail: string;
  setProfessor: (value: string) => void;
  setProfEmail: (value: string) => void;
  officeHours: string;
  setOfficeHours: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedType: CourseType;
  setSelectedType: (type: CourseType) => void;
}

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
  description,
  setDescription,
  selectedType,
  setSelectedType,
}: CourseFormFieldsProps) {
  const courseTypeOptions: CourseType[] = [
    "lecture",
    "studio",
    "lab",
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-mp text-gray-400">
          course name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Calculus 1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 p-2 bg-zinc-800 text-white font-dm rounded-[0.50rem] placeholder:text-gray-500"
        />
      </div>

      <div>
        <label className="text-sm font-mp text-gray-400 ">
          course code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="APSC 171"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full mt-1 p-2 bg-zinc-800 text-white font-dm rounded-[0.50rem] placeholder:text-gray-500"
        />
      </div>

<div className="flex flex-row space-x-4">
  <div className="flex flex-col flex-1">
    <label className="text-sm text-gray-400 mb-1 font-mp">professor name</label>
    <input
      type="text"
      placeholder="Dr. John Doe"
      value={professor}
      onChange={(e) => setProfessor(e.target.value)}
      className="w-full p-2 bg-zinc-800 text-white font-dm rounded-[0.5em] placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>

  
  <div className="flex flex-col flex-1">
    <label className="text-sm text-gray-400 mb-1 font-mp">professor/course email</label>
    <input
      type="email"
      placeholder="john.d@edu.com"
      value={profEmail}
      onChange={(e) => setProfEmail(e.target.value)}
      className="w-full p-2 bg-zinc-800 text-white font-dm rounded-[0.5em] placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
</div>



      {/* <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="text-sm text-gray-400 cursor-help">
                office hours
              </label>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-zinc-800 text-white rounded-md p-2 text-xs font-dm"
            >
              enter multiple office hours separated by ; e.g. "Mon, 2-4pm; Wed,
              3-5pm"
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <input
          type="text"
          placeholder="Mon, 2-4pm; Wed, 3-5pm"
          value={officeHours}
          onChange={(e) => setOfficeHours(e.target.value)}
          className="w-full mt-1 p-2 bg-zinc-800 text-white font-dm rounded-[0.50rem] placeholder:text-gray-500"
        />
      </div> */}

      <div>
        <label className="text-sm text-gray-400 mb-2 block font-mp">course type</label>
        <div className="flex flex-wrap gap-2">
          {courseTypeOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="courseType"
                value={option}
                checked={selectedType === option}
                onChange={(e) => setSelectedType(e.target.value as CourseType)}
                className="w-4 h-4 text-white bg-zinc-800 border-gray-600 focus:ring-white focus:ring-2"
              />
              <span className="text-sm text-gray-300 font-dm">
                {courseTypeLabels[option]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400 font-mp">description</label>
        <textarea
          placeholder="introduction to foundational topics in calculus"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1 p-2 bg-zinc-800 text-white font-dm rounded-[0.50rem] placeholder:text-gray-500 min-h-[80px]"
        />
      </div>
    </div>
  );
}
