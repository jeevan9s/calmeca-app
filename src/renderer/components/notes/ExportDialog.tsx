"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState, useEffect } from "react"
import { exportType,exportResponse } from "@/services/db"

interface User {
  id?: string
  name: string
  email: string
  picture?: string
}

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  content?: string
  filename: string
  exportType: exportType
  isExporting: boolean
  onFilenameChange: (val: string) => void
  onTypeChange: (val: exportType) => void
  onConfirm: () => void
}

export default function ExportDialog({ isOpen, onClose, content = "" }: ExportDialogProps) {
  const [filename, setFilename] = useState("document")
  const [exportType, setExportType] = useState<exportType>("txt")
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFilename("document")
      setExportType("txt")
      setError(null)
      setIsExporting(false)
      setIsLoading(false)
      checkAuthStatus()
    }
  }, [isOpen])

const checkAuthStatus = async () => {
  try {
    const res = await window.electronAPI.googleLogin()
    if (res.success) {
      setUser(res.user ?? null)
      setError(null)
    } else {
      
      if (!user) setError('Not logged in')
    }
  } catch {
    if (!user) console.log('')
  }
}

useEffect(() => {
  const loginSuccessHandler = (_event: any, data: any) => {
    setUser(data.user ?? null)
    setError(null)
    setIsLoading(false)
  }

  window.electronAPI.onLoginSuccess(loginSuccessHandler)
  return () => window.electronAPI.removeLoginSuccessListener(loginSuccessHandler)
}, [])

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await window.electronAPI.startLoginRedirect()
    } catch {
      setError("Login failed unexpectedly")
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
        setError(res.error ?? "Logout failed")
      }
    } catch {
      setError("Logout failed unexpectedly")
    } finally {
      setIsLoading(false)
    }
  }

const handleExport = async () => {
  console.log("handleExport called")

  if (!content || !content.trim()) {
    console.log("No content to export")
    setError("Enter some content to export")
    return
  }
  if (!filename.trim()) {
    console.log("No filename provided")
    setError("Enter a filename")
    return
  }

  setIsExporting(true)
  setError(null)

  try {
    console.log("Starting export with params:", { content, filename, exportType })

    const res: exportResponse = await window.electronAPI.gTextExport(content, filename, exportType)

    console.log("Export response received:", res)

    if (res.success) {
      console.log("Export succeeded:", res)
      onClose()
    } else {
      console.error("Export failed with error:", res.error)
      throw new Error(res.error)
    }
  } catch (err) {
    console.error("Export error caught:", err)
    setError(err instanceof Error ? err.message : "Export failed unexpectedly")
  } finally {
    setIsExporting(false)
    console.log("Export process ended, isExporting set to false")
  }
}


  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white font-raleway"
                >
                  {user ? "export file" : "authentication required"}
                </Dialog.Title>

                {error && (
                  <div className="mt-2 text-red-400 text-sm">{error}</div>
                )}

                {user ? (
                  <>
                    <div className="mt-2 text-sm text-white/80">
                      logged in as: {user.email}
                    </div>

                    <div className="mt-4 flex flex-col gap-4">
                      <label className="flex flex-col text-sm font-thin font-mp text-white/80">
                        filename
                        <input
                          type="text"
                          value={filename}
                          onChange={(e) => setFilename(e.target.value)}
                          className="border mt-1 rounded px-2 py-1 text-black font-mp"
                        />
                      </label>

                      <label className="flex flex-col text-sm font-thin font-mp text-white/80">
                        export format
                        <select
                          value={exportType}
                          onChange={(e) =>
                            setExportType(e.target.value as exportType)
                          }
                          className="border mt-1 rounded px-2 py-1 text-black font-dm bg-white"
                        >
                          <option value="txt">.txt</option>
                          <option value="pdf">.pdf</option>
                          <option value="md">.md</option>
                          <option value="docx">.docx</option>
                          <option value="json">.json</option>
                        </select>
                      </label>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
                      >
                        logout
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 rounded text-black bg-gray-200 text-gray-700 hover:bg-gray-400"
                          onClick={onClose}
                        >
                          cancel
                        </button>
                        <button
                          type="button"
                          disabled={
                            isExporting || !content.trim() || !filename.trim()
                          }
                          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                          onClick={handleExport}
                        >
                          {isExporting ? "exporting..." : "export"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-6 flex flex-col gap-4">
                    <p className="text-white/80 text-sm">
                      you need to authenticate to export files.
                    </p>
                    <button
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isLoading ? "signing in..." : "sign in with Google"}
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded text-black bg-gray-200 text-gray-700 hover:bg-gray-400"
                    >
                      cancel
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
