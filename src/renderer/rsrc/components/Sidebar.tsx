import { useState, useEffect, useRef } from 'react'
import { ChevronsRight } from 'react-feather'
import { motion } from 'framer-motion'
import '@/renderer/rsrc/styles/sb.css'

export default function Sidebar() {
  return (
    <motion.aside id="sb-panel" className="flex flex-col w-50 h-screen outline-solid outline-neutral-800 outline-1" style={{ backgroundColor: 'rgba(26,26,26,1)' }}>
      <header id="sb-header" className=''>
        <div id="header-cntr" className="flex flex-row mt-10">
          <div id="title-cntr" className="flex flex-col">
            <h2 id="sb-title">Calmeca</h2>
            <h3 id="sb-subtitle" className="text-neutral-500">
              Current Page
            </h3>
          </div>
          <div id="btn-cntr" className="flex flex-row">
            <button
              id="sidebar"
              className="relative w-5 h-5 flex items-center justify-center transition-transform duration-200 hover:scale-105"
            >
              <ChevronsRight
                className="sidebar-icon absolute transition-transform duration-200 hover:scale-110"
                color="white"
                size={18}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </header>
    </motion.aside>
  )
}
