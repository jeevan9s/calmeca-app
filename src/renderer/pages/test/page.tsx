'use client'

import { useState } from 'react'
import Layout from '@/renderer/components/Layout'

export default function GoogleTest() {
  console.log('Google test page loaded')

  const [user, setUser] = useState<null | { name:string; email:string; picture:string;}>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-black/30">
      <Layout />
      <div className="max-w-md mx-5 mt-10 text-left">
        <h1  className="text-4xl text-white font-raleway">
  G-Drive Testing
</h1>
      </div>
      <div className="max-w-md mx-5 mt-2 text-left">
        <h3 className="font-raleway text-md font-thin text-white/60">
          Prototyping Google integrations: (auth, import, export).
        </h3>
      </div>

      <div className="flex mx-5 gap-4 mt-4 items-center">
        <button className="inline-block py-3 px-6 text-sm cursor-pointer font-semibold font-raleway text-white bg-neutral-800 rounded-lg shadow-md hover:bg-neutral-700 transition-all"
                onClick={handleLogin}>
          Login with Google
        </button>

        <button className="inline-block py-3 px-6 text-sm font-semibold font-raleway text-white bg-neutral-800 rounded-lg shadow-md hover:bg-neutral-700 transition-all"
                onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}