'use client'

import { useEffect } from 'react'
import Layout from '../../components/Layout'

export default function Dashboard() {
  console.log("Dashboard page loaded")

  useEffect(() => {
    async function loginAndExportTest() {
      try {
        // Step 1: Authenticate
        const loginResult = await window.ipcRenderer.invoke('google-login')
        if (!loginResult.success) {
          console.error('Login error:', loginResult.error)
          return
        }
        console.log('✅ Logged in:', loginResult.tokens)

        // Step 2: Export a test file to Google Drive
        const exportResult = await window.ipcRenderer.invoke('google-export-text', {
          content: '# Calmeca Export Test\nThis is a test file from the Dashboard.',
          filename: 'CalmecaExportTest',
          exportType: 'md'
        })

        if (exportResult.success) {
          console.log('✅ Export successful:', exportResult)
          alert(`Exported!\n\nName: ${exportResult.name}\nURL: ${exportResult.driveUrl}`)
        } else {
          console.error('❌ Export failed:', exportResult.error)
          alert('Export failed: ' + exportResult.error)
        }

      } catch (err) {
        console.error('Unhandled IPC error:', err)
        alert('Unhandled error: ' + (err instanceof Error ? err.message : String(err)))
      }
    }

    loginAndExportTest()
  }, [])

  return (
    <div id="dashboard-page" className="min-h-screen bg-black/30">
      <Layout />
    </div>
  )
}
