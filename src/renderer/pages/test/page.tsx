'use client'

import { useEffect } from 'react'
import Layout from '@/renderer/components/Layout'

export default function GoogleTest() {
  console.log('Google test page loaded')

  useEffect(() => {
    // ✅ Check Tailwind visually
    const testEl = document.createElement('div')
    testEl.className = 'bg-red-500 text-white p-2 rounded-lg mt-4'
    testEl.innerText = 'TAILWIND CSS TEST'
    document.body.appendChild(testEl)

    // ✅ Log button classList
    const btn = document.querySelector('button')
    if (btn) {
      console.log('Button classList:', btn.classList)
      console.log('Computed background:', getComputedStyle(btn).backgroundColor)
    } else {
      console.log('No <button> found')
    }

    // ✅ Check loaded stylesheets
    const loadedStyles = [...document.styleSheets]
      .map((s) => s.href || '[inline]')
      .filter((h) => h.includes('tailwind') || h.includes('index.css'))
    console.log('Loaded stylesheets:', loadedStyles)
  }, [])

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
        <button className="inline-block py-3 px-6 text-sm cursor-pointer font-semibold font-raleway text-white bg-neutral-800 rounded-lg shadow-md hover:bg-neutral-700 transition-all">
          Login with Google
        </button>

        <button className="inline-block py-3 px-6 text-sm font-semibold font-raleway text-white bg-neutral-800 rounded-lg shadow-md hover:bg-neutral-700 transition-all">
          Logout
        </button>
      </div>
    </div>
  )
}
