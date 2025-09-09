// NLP (Syllabus) Entity Extraction 

import PdfParse from "pdf-parse";
import path from "path";
import fs from "fs";
import nlp from "compromise";
import { Course } from "../db";

// regex 
const courseCodeRegex = /([A-Z]{2,4}\s?\d{3,4})/;
const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:,\s*\d{4})?\b/gi;

export const readPDF = async (filePath: string): Promise<string> => {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, "..", filePath);

  if (!fs.existsSync(absolutePath)) throw new Error(`File does not exist: ${absolutePath}`);

  const buffer = await fs.promises.readFile(absolutePath);
  const data = await PdfParse(buffer);
  return data.text;
};

// --------------- entity extraction ---------------

export const extractCourseFromText = (text: string): Course & { deadlines: { name: string; date: string; weight?: string }[] } => {
  const doc = nlp(text);
  const lines = text.split("\n");

  // course code, name 
  const courseCodeMatch = text.match(courseCodeRegex);
  const code = courseCodeMatch ? courseCodeMatch[0] : "";
  const nameLine = lines.find(line => line.includes(code));
  const name = nameLine?.replace(code, "").replace(/–|-/, "").trim() || "";

  // profs
  const profSection = lines.filter(l =>
    l.toLowerCase().includes("instructor") ||
    l.match(/[A-Z][a-z]+ [A-Z][a-z]+/)
  );
  const professor = profSection.join(", ");

  // contact
  const emails = text.match(emailRegex) || [];
  const courseEmail = emails.find(e => e.toLowerCase().includes("course") || e.includes("apsc"));
  const profEmail = emails.find(e => e !== courseEmail);

  // desc.
  let description = "";
  const descIndex = text.toLowerCase().indexOf("course description");
  if (descIndex !== -1) {
    description = text.slice(descIndex, descIndex + 600).split("\n").slice(1, 6).join(" ").trim();
  }

  // deadlines
  const deadlines: { name: string; date: string; weight?: string }[] = [];
  const assessmentSection = lines.slice(0, 600).join("\n");
  const assessmentLines = assessmentSection.split("\n");

  assessmentLines.forEach(line => {
    if (/(test|exam|assignment|quiz)/i.test(line)) {
      const dateMatch = line.match(dateRegex);
      const weightMatch = line.match(/\d{1,2}(\.\d+)?%/);
      deadlines.push({
        name: line.replace(dateRegex, "").trim(),
        date: dateMatch ? dateMatch[0] : "Exam Period",
        weight: weightMatch?.[0]
      });
    }
  });

  const now = new Date();

  return {
    id: code || now.getTime().toString(),
    name,
    code,
    professor,
    courseEmail,
    profEmail,
    description,
    createdOn: now,
    endsOn: new Date("2025-12-12"),
    archived: false,
    updatedOn: now,
    deadlines
  };
};
