declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      restore: () => void
      close: () => void

      googleLogin: () => Promise<{ success: boolean; user?: { name: string; email: string; picture: string }; error?: string }>
      googleLogout: () => Promise<{ success: boolean; error?: string }>
      startLoginRedirect: () => Promise<void>

      gCalendarAddEvent: (title: string, date: Date, source?: string, sourceId?: string) => Promise<{ success: boolean; eventId?: string; error?: string }>
      gCalendarGetUpcomingEvents: (daysAhead?: number) => Promise<{ success: boolean; events?: any[]; error?: string }>
      gCalendarGetTodaysEvents: () => Promise<{ success: boolean; events?: any[]; error?: string }>

      onMaximized: (callback: () => void) => void
      offMaximized: (callback: () => void) => void
      onNotMaximized: (callback: () => void) => void
      offNotMaximized: (callback: () => void) => void
      onLoginSuccess: (callback: (event: any, data: any) => void) => void
      removeLoginSuccessListener: (callback: (event: any, data: any) => void) => void
    }
  }
}

export {}
