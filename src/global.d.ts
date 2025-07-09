import type { exportType } from '@/services/db'

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
      gTextExport: (content: string, filename: string, type: exportType) => Promise<{ fileId: string; name: string; driveUrl: string, success: boolean}>
      gImportFile: (fileId: string) => Promise<{ id: string; name: string; mimeType: string; content: string, success: boolean, error?: string}>
      onMaximized: (callback: () => void) => void
      offMaximized: (callback: () => void) => void
      onNotMaximized: (callback: () => void) => void
      offNotMaximized: (callback: () => void) => void
      onLoginSuccess: (callback: (event: any, data: any) => void) => void
      removeLoginSuccessListener: (callback: (event: any, data: any) => void) => void
      openGooglePicker: () => Promise<{ fileId: string; name?: string; mimeType?: string } | null>
      sendFileIdToMain: (fileId: string) => void
      pickerConfig: {
      token: string
      apiKey: string
    }
    generateAIContent: (args: import('@/services/db').AIContentRequest) => Promise<{
        success: boolean;
        result?: any;
        error?: string;
      }>

    }
  }
}

export {}
