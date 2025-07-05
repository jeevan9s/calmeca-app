'use client'
import { useEffect } from 'react'
import Layout from '../../components/Layout'
export default function GoogleTest() {
  console.log("Google test page loaded")

return (
  <div className="min-h-screen bg-black/30">
    <Layout />
    <div className="max-w-md mx-5 mt-10 text-left">
      <h1 className="font-raleway text-sm text-white">G-Drive Testing</h1>
    </div>
    <div className="max-w-md mx-5 mt-2 text-left">
        <h3 className="font-raleway text-sm text-white/80">Prototyping Google integrations: (import, export).</h3>
    </div>

<div className="flex gap-4 mt-8 justify-center">
  <button className="py-2.5 px-6 text-sm font-raleway text-white bg-neutral-800 rounded-lg shadow-sm hover:bg-neutral-700 transition-colors cursor-pointer">
    Login with Google
  </button>
  <button className="py-2.5 px-6 text-sm font-raleway text-white bg-neutral-800 rounded-lg shadow-sm hover:bg-neutral-700 transition-colors cursor-pointer">
    Logout
  </button>
</div>

</div> )}