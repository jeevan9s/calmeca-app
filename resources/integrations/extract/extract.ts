import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { prompt } from "./prompt";
import { ExtractedCourseSchema, ExtractedCourse } from "./schema";
import { Course, Task, TaskType } from "@/services/db";
import { CourseSemester } from "@/lib/helpers/semester";

const key = import.meta.env.VITE_OPENAI_API_KEY || "";
const client = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });

const DEFAULT_MAX_CHARS = 24000;
const DEFAULT_TIMEOUT_MS = 18000;

type ExtractOptions = {
  maxChars?: number;
  timeoutMs?: number;
};

export class ExtractionService {
  async extract(text: string, options: ExtractOptions = {}): Promise<ExtractedCourse> {
    const cleaned = this.cleanInput(text, options.maxChars ?? DEFAULT_MAX_CHARS);
    const prompt = this.buildPrompt(cleaned);
    return await this.runExtraction(prompt, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  }

  private buildPrompt(text: string): string {
    return `${prompt}\n\nDocument:\n${text}`;
  }

  map(data: ExtractedCourse): Course {
    const now = new Date();
    const courseId = crypto.randomUUID();
    const color = "#000000";

    const tasks: Task[] = data.events
      .filter(
        (event) =>
          event.type === "assignment" ||
          event.type === "lab" ||
          event.type === "tutorial",
      )
      .map((event) => {
        const taskType: TaskType =
          event.type === "assignment"
            ? "problem set"
            : event.type === "lab"
              ? "lab"
              : "tutorial";
        return {
          id: crypto.randomUUID(),
          title: event.title,
          type: taskType,
          courseId,
          recurring: event.recurring,
          reccurrence: event.recurring
            ? `FREQ=WEEKLY;BYDAY=${event.dayOfWeek}`
            : "",
          deadline: event.date
            ? new Date(`${event.date}T${event.endTime ?? "23:59"}`)
            : undefined,
          completed: false,
          color,
        };
      });

    const midterms = data.events
      .filter((event) => event.type === "midterm")
      .map((event) => ({
        start: new Date(`${event.date}T${event.startTime ?? "00:00"}`),
        end: new Date(
          `${event.date}T${event.endTime ?? event.startTime ?? "00:00"}`,
        ),
      }));

    return {
      id: courseId,
      title: data.title ?? "Untitled Course",
      code: data.code ?? "",
      courseEmail: data.courseEmail ?? undefined,
      description: data.description ?? undefined,
      credits: data.credits ?? undefined,
      semester: (data.semester ?? "Fall") as CourseSemester,

      midterms,

      createdOn: now,
      updatedOn: now,

      archived: false,
      resources: [],
      tasks,
    };
  }

  // implenented for speed optimization
  private cleanInput(text: string, maxChars: number): string {
    const RELEVANT_HEADERS =
      /^(schedule|calendar|assignments?|tasks?|deadlines?|exams?|midterms?|final|labs?|tutorials?|course info|contact|instructor|credits?)/i;

    let cleaned = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

    const lines = cleaned.split("\n");
    const freq = new Map<string, number>();
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 3 && trimmed.length < 80) {
        freq.set(trimmed, (freq.get(trimmed) ?? 0) + 1);
      }
    }
    const pageCount = (text.match(/\f/g)?.length ?? 0) + 1;
    const repeatedThreshold = Math.max(3, Math.floor(pageCount * 0.5));
    const boilerplate = new Set(
      [...freq.entries()]
        .filter(([, n]) => n >= repeatedThreshold)
        .map(([l]) => l),
    );

    const dedupedLines = lines.filter((line) => !boilerplate.has(line.trim()));

    const sections: string[][] = [];
    let current: string[] = [];
    for (const line of dedupedLines) {
      const trimmed = line.trim();
      const looksLikeHeading =
        trimmed.length > 0 &&
        trimmed.length < 60 &&
        (trimmed === trimmed.toUpperCase() ||
          /^\d+(\.\d+)*[\s.)]/.test(trimmed) ||
          /:$/.test(trimmed));

      if (looksLikeHeading) {
        if (current.length) sections.push(current);
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length) sections.push(current);

    const kept: string[] = [];
    sections.forEach((section, i) => {
      const heading = section[0]?.trim() ?? "";
      const isRelevant = RELEVANT_HEADERS.test(heading);
      const isPreamble = i === 0 && !heading;
      if (isRelevant || isPreamble) {
        kept.push(...section);
      }
    });

    const finalText = kept.join("\n").trim();
    if (!finalText) {
      return text.slice(0, maxChars);
    }
    return finalText.slice(0, maxChars);
  }

  private async runExtraction(
    prompt: string,
    timeoutMs: number,
  ): Promise<ExtractedCourse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await client.responses.create(
        {
          model: "gpt-4o-mini",
          input: prompt,
          max_output_tokens: 1600,
          text: {
            format: zodTextFormat(ExtractedCourseSchema, "extracted_course"),
          },
        },
        {
          signal: controller.signal,
        },
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("extraction timed out");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.output_text) throw new Error("failed to extract course data");
    return JSON.parse(response.output_text) as ExtractedCourse;
  }
}
