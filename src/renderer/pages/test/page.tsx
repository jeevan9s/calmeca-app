'use client'

import { useState, useEffect } from 'react'
import Layout from '@/renderer/components/Layout'
import { exportType, exportResponse } from '@/services/db'

export default function GoogleTest() {
  console.log('Google test page loaded')

  const [user, setUser] = useState<null | { name:string; email:string; picture:string;}>(null)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [importedFile, setImportedFile] = useState<string | null>(null)
  const [exportType, setExportType] = useState<exportType>('pdf')
  const [filename, setFilename] = useState('untitled')


useEffect(() => {
  const loginSuccessHandler = async (_event: any, data: any) => {
    console.log('Login success event received', data)
    setError(null)

    const res = await window.electronAPI.googleLogin()
    if (res.success) setUser(res.user ?? null)
  }

  window.electronAPI.onLoginSuccess(loginSuccessHandler)

  return () => {
    window.electronAPI.removeLoginSuccessListener(loginSuccessHandler)
  }
}, [])

// auth testing 
  const handleLogin = async () => {
    console.log('attempting login')
    const res = await window.electronAPI.googleLogin()
    if (res.success) {
      setUser(res.user ?? null)
      setError(null)
      console.log("logged in !!", res.user)
    } else {
      setError(res.error ?? null)
      console.log("balls", res.error)
      if (res.error === 'No valid login session, please authenticate.') {
        await window.electronAPI.startLoginRedirect()
      }
    }
  }
  const handleLogout = async () => {
    const res = await window.electronAPI.googleLogout()
    if (res.success) {
      setUser(null)
      setError(null)
    } else {
      setError(res.error ?? null)
    }
  }

// text-export feature
const handleExport = async () => {
  if (!text.trim()) return alert("Enter some content to export.")
  if (!filename.trim()) return alert("Enter a filename.")

  const res: exportResponse = await window.electronAPI.gTextExport(text, filename, exportType)
  if (res.success) {
    alert(`File uploaded\n${res.driveUrl}`)
  } else {
    alert(`Failed to export file`)
  }
}
const handleImport = async () => {
  try {
    const pickerRes = await window.electronAPI.openGooglePicker()
    if (pickerRes && pickerRes.fileId) {
      const res = await window.electronAPI.gImportFile(pickerRes.fileId)
      if (res.success) {
        alert(`Imported file: ${res.name}`)
      } else {
        alert(`Import failed: ${res.error}`)
      }
    }
  } catch (err) {
    console.error("Picker or import failed", err)
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

    <div></div>
    <div className="max-w-md mx-5 mt-2 text-left">
      <h3 className="font-raleway text-md font-thin text-white/60">
        prototyping Google integrations: (auth, import, export).
      </h3>
    </div>

    <div className="flex flex-col mx-5 mt-4">
      <label className="block mb-1 text-sm text-white/60 font-raleway">auth testing</label>
      <div className="flex gap-4 items-center mb-4">
        <button
          className="inline-block py-3 px-6 text-sm cursor-pointer font-semibold font-raleway text-white bg-neutral-800 rounded-lg shadow-md hover:bg-neutral-700 transition-all"
          onClick={handleLogin}
        >
          login with Google
        </button>
        <button
          className="inline-block py-3 px-6 text-sm font-semibold font-raleway text-white bg-neutral-800 rounded-lg shadow-md hover:bg-red-900 transition-all"
          onClick={handleLogout}
        >
          logout
        </button>
      </div>

      <div className="max-w-md text-left">
        <label className="block mb-1 text-sm text-white/60 font-raleway">type to export</label>
        <div className='flex gap-3 items-center mb-2'>
          <select value = {exportType} onChange={(e) => setExportType(e.target.value as exportType)} className="p-2 bg-neutral-800 text-white text-sm rounded border border-gray-700 font-raleway">
            <option value="txt">.txt</option>
            <option value="pdf">.pdf</option>
            <option value="md">.md</option>
            <option value="docx">.docx</option>
            <option value="json">.json</option>
          </select>
        </div>

        <textarea id="message" rows={2} value = {text} onChange={(e) => setText(e.target.value)} className="block p-3 w-full text-sm text-white bg-neutral-800 rounded-lg border border-gray-300"></textarea>
        <button
          onClick={handleExport}
          className="inline-block p-2.5 mt-2 text-xs cursor-pointer font-semibold font-raleway text-white bg-neutral-800 rounded-lg shadow-md hover:bg-neutral-700 transition-all focus:outline-none focus:ring-2 focus:ring-neutral-600">
          export
        </button>
      </div>

      <div className='max-w-md text-left mt-3'>
        <label className="block mb-1 text-sm text-white/60 font-raleway">file import</label>
        <button
          onClick={handleImport}
          className="inline-block p-2.5 text-xs cursor-pointer font-semibold font-raleway text-white bg-neutral-800 rounded-lg shadow-md hover:bg-neutral-700 transition-all focus:outline-none focus:ring-2 focus:ring-neutral-600">
          import
        </button>
      </div>
    </div>
  </div>
)
}

