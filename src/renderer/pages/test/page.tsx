'use client'

import { useState, useEffect } from 'react'
import Layout from '@/renderer/components/Layout'
import { exportType, exportResponse } from '@/services/db'

export default function GoogleTest() {
  console.log('Google test page loaded')

  const [user, setUser] = useState<null | { name: string; email: string; picture: string }>(null)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [importedFile, setImportedFile] = useState<{ name: string; content: string } | null>(null)
  const [exportType, setExportType] = useState<exportType>('pdf')
  const [filename, setFilename] = useState('untitled')
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    const loginSuccessHandler = async (_event: any, data: any) => {
      console.log('Login success event received', data)
      setError(null)

      try {
        const res = await window.electronAPI.googleLogin()
        if (res.success) {
          setUser(res.user ?? null)
        }
      } catch (err) {
        console.error('Error handling login success:', err)
        setError('Failed to complete login')
      }
    }

    window.electronAPI.onLoginSuccess(loginSuccessHandler)

    return () => {
      window.electronAPI.removeLoginSuccessListener(loginSuccessHandler)
    }
  }, [])

  // auth stuff
const handleLogin = async () => {
  console.log('Attempting login')
  setIsLoading(true)
  setError(null)

  try {
    const res = await window.electronAPI.googleLogin()

    if (res.success && res.user) {
      setUser(res.user)
      console.log("Logged in successfully!", res.user)
    } else {
      
      if (res.error === 'No valid login session, please authenticate.') {
        console.log('Starting redirect login...')
        await window.electronAPI.startLoginRedirect()
        return 
      }

      console.error("Login failed:", res.error)
      setError(res.error ?? 'Login failed')
    }
  } catch (err) {
    console.error('Login error:', err)
    setError('Login failed unexpectedly')
  } finally {
    setIsLoading(false)
  }
}


  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await window.electronAPI.googleLogout()
      if (res.success) {
        setUser(null)
      } else {
        setError(res.error ?? 'Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
      setError('Logout failed unexpectedly')
    } finally {
      setIsLoading(false)
    }
  }

  // import/export
  const handleExport = async () => {
    if (!text.trim()) {
      alert("Enter some content to export.")
      return
    }
    if (!filename.trim()) {
      alert("Enter a filename.")
      return
    }

    setIsExporting(true)
    setError(null)
    
    try {
      const res: exportResponse = await window.electronAPI.gTextExport(text, filename, exportType)
      if (res.success) {
        alert(`File uploaded successfully!\n${res.driveUrl}`)
      } else {
        alert(`Failed to export file: ${res.error || 'Unknown error'}`)
        setError(res.error || 'Export failed')
      }
    } catch (err) {
      console.error('Export error:', err)
      alert('Export failed unexpectedly')
      setError('Export failed unexpectedly')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)
    
    try {
      const fileId = await window.electronAPI.openGooglePicker()
      console.log('Picker result:', fileId)
      
      if (fileId) {
        const res = await window.electronAPI.gImportFile(fileId)
        console.log('Import response:', res)
        
        if (res.success && res.name && res.content) {
          setImportedFile({ name: res.name, content: res.content })
          alert(`Imported file: ${res.name}`)
        } else {
          alert(`Import failed: ${res.error || 'Unknown error'}`)
          setError(res.error || 'Import failed')
        }
      }
    } catch (err) {
      console.error("Picker or import failed", err)
      alert('Import failed unexpectedly')
      setError('Import failed unexpectedly')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black/30">
      <Layout />
      <div className="max-w-md mx-5 mt-10 text-left">
        <h1 className="text-4xl text-white font-raleway">
          G-Drive Testing
        </h1>
      </div>

      <div className="max-w-md mx-5 mt-2 text-left">
        <h3 className="font-raleway text-md font-thin text-white/60">
          prototyping Google integrations: (auth, import, export).
        </h3>
      </div>

      
      {error && (
        <div className="max-w-md mx-5 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      
      {user && (
        <div className="max-w-md mx-5 mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm">
          <p className="font-semibold">logged in as: {user.name}</p>
          <p className="text-xs text-green-300">{user.email}</p>
        </div>
      )}

      <div className="flex flex-col mx-5 mt-4">
        
        <label className="block mb-1 text-sm text-white/60 font-raleway">Auth Testing</label>
        <div className="flex gap-4 items-center mb-4">
          <button
            className={`inline-block py-3 px-6 text-sm cursor-pointer font-semibold font-raleway text-white rounded-lg shadow-md transition-all ${
              isLoading 
                ? 'bg-neutral-600 cursor-not-allowed' 
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'loading...' : 'login with Google'}
          </button>
          <button
            className={`inline-block py-3 px-6 text-sm font-semibold font-raleway text-white rounded-lg shadow-md transition-all ${
              isLoading 
                ? 'bg-neutral-600 cursor-not-allowed' 
                : 'bg-neutral-800 hover:bg-red-900'
            }`}
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? 'loading...' : 'logout'}
          </button>
        </div>

        
        <div className="max-w-md text-left">
          <label className="block mb-1 text-sm text-white/60 font-raleway">File Export</label>
          
          
          <div className="flex gap-3 items-center mb-2">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="enter filename"
              className="p-2 bg-neutral-800 text-white text-sm rounded border border-gray-700 font-raleway flex-1"
            />
            <select 
              value={exportType} 
              onChange={(e) => setExportType(e.target.value as exportType)} 
              className="p-2 bg-neutral-800 text-white text-sm rounded border border-gray-700 font-raleway"
            >
              <option value="txt">.txt</option>
              <option value="pdf">.pdf</option>
              <option value="md">.md</option>
              <option value="docx">.docx</option>
              <option value="json">.json</option>
            </select>
          </div>

          <textarea 
            id="message" 
            rows={4} 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="enter content to export..."
            className="block p-3 w-full text-sm text-white bg-neutral-800 rounded-lg border border-gray-300 resize-vertical"
          />
          <button
            onClick={handleExport}
            disabled={isExporting || !user}
            className={`inline-block p-2.5 mt-2 text-xs cursor-pointer font-semibold font-raleway text-white rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-neutral-600 ${
              isExporting || !user
                ? 'bg-neutral-600 cursor-not-allowed'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {isExporting ? 'exporting...' : 'export'}
          </button>
          {!user && (
            <p className="text-xs text-red-400 mt-1">please login to export files</p>
          )}
        </div>

        
        <div className="max-w-md text-left mt-6">
          <label className="block mb-1 text-sm text-white/60 font-raleway">File Import</label>
          <button
            onClick={handleImport}
            disabled={isImporting || !user}
            className={`inline-block p-2.5 text-xs cursor-pointer font-semibold font-raleway text-white rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-neutral-600 ${
              isImporting || !user
                ? 'bg-neutral-600 cursor-not-allowed'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {isImporting ? 'Importing...' : 'import from Google drive'}
          </button>
          {!user && (
            <p className="text-xs text-red-400 mt-1">please login to import files</p>
          )}
        </div>

        
        {importedFile && (
          <div className="max-w-md mt-6 p-4 bg-neutral-900 border border-neutral-700 rounded-lg text-white">
            <h2 className="font-semibold font-raleway text-md mb-2 flex items-center gap-2">
               Imported: {importedFile.name}
              <button
                onClick={() => setImportedFile(null)}
                className="ml-auto text-red-400 hover:text-red-300 text-xs"
              >
                ✕ Clear
              </button>
            </h2>
            <div className="max-h-64 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-white/80 break-words">
                {importedFile.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}