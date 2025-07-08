export {}

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      restore: () => void
      close: () => void

      onMaximized: (callback: () => void) => void
      offMaximized: (callback: () => void) => void  

      onNotMaximized: (callback: () => void) => void
      offNotMaximized: (callback: () => void) => void  

      googleLogin: () => Promise<{
        success: boolean
        tokens?: any
        user?: {
          name: string
          email: string
          picture: string
        }
        error?: string
      }>
      googleLogout: () => Promise<{
        success: boolean
        error?: string
      }>

      onMainProcessMessage: (callback: (message: string) => void) => void

      startLoginRedirect: () => Promise<void>
      onLoginSuccess: (callback: (event: any, data: any) => void) => void
      removeLoginSuccessListener: (callback: (event: any, data: any) => void) => void
    }
  }
}
