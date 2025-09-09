import { IpcRendererEvent } from "electron";

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void;
      maximize: () => void;
      restore: () => void;
      close: () => void;
      googleLogin: () => Promise<any>;
      googleLogout: () => Promise<any>;
      fetchGoogleCalendarEvents: () => Promise<any>;
      addGoogleCalendarEvent: (summary: string, start: string) => Promise<any>;
      startMicrosoftLogin: () => Promise<any>;
      microsoftLogout: () => Promise<any>;
      startLoginRedirect: () => Promise<any>;
      onMaximized: (callback: () => void) => void;
      offMaximized: (callback: () => void) => void;
      onNotMaximized: (callback: () => void) => void;
      offNotMaximized: (callback: () => void) => void;
      onLoginSuccess: (callback: (event: IpcRendererEvent, data: any) => void) => void;
      removeLoginSuccessListener: (callback: (event: IpcRendererEvent, data: any) => void) => void;
      onMicrosoftLoginSuccess: (callback: (event: IpcRendererEvent, data: any) => void) => void;
      removeMicrosoftLoginSuccessListener: (callback: (event: IpcRendererEvent, data: any) => void) => void;
      readPDF: (filePath: string) => Promise<{ success: boolean; text?: string; error?: string }>;
      extractCourse: (text: string) => Promise<{ success: boolean; course?: any; error?: string }>;
      extractCourseFromPDF: (filePath: string) => Promise<{ success: boolean; course?: any; error?: string }>;
    };
  }
}