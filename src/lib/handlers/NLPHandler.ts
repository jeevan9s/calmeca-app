// NLP (Syllabus) IPC Handlers

import { ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { readPDF, extractCourseFromText } from "@/services/integrations-utils/NLPServices";
import { BrowserWindow } from "electron";

let win: BrowserWindow | null = null;

export function registerNLPHandlers(mainWindow:BrowserWindow) {
  win = mainWindow;

  ipcMain.handle("read-pdf", async (_event, filePath: string) => {
    try {
      if (!fs.existsSync(filePath)) throw new Error("File does not exist");
      const text = await readPDF(filePath);
      return { success: true, text };
    } catch (error: any) {
      console.error("Failed to read PDF:", error);
      return { success: false, error: error.message || "Unknown error" };
    }
  });

  ipcMain.handle("extract-course", (_event, text: string) => {
    try {
      const course = extractCourseFromText(text);
      return { success: true, course };
    } catch (error: any) {
      console.error("Failed to extract course:", error);
      return { success: false, error: error.message || "Unknown error" };
    }
  });

ipcMain.handle("extract-course-from-pdf", async (_event, filePath: string) => {
  try {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) throw new Error("File does not exist");

    const text = await readPDF(absolutePath);
    const course = extractCourseFromText(text);
    return { success: true, course };
  } catch (error: any) {
    console.error("Failed to extract course from PDF:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
});
}
