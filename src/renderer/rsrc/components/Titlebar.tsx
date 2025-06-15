import { PiCopy } from 'react-icons/pi'
import {
  ChevronsRight,
  ChevronsDown,
  Minus,
  X,
  Square,
  Menu,
  Calendar,
  Bell,
  Hexagon
} from 'react-feather'
import '@/renderer/rsrc/styles/tb.css'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

type TitleBarProps = {
  solidBackground?: boolean
  outline?: boolean
  isHovered: boolean
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
  setIsHovered: (hovering: boolean) => void
}

export default function TitleBar({
  isLocked,
  isHovered,
  setIsHovered,
  setIsLocked,
  solidBackground = false,
  outline = false
}: TitleBarProps) {
  const [isMaximized, setisMaximized] = useState(false)
  const [calendarHovered, setCalendarHovered] = useState(false)

  useEffect(() => {
    const onMax = () => setisMaximized(true)
    const onUnmax = () => setisMaximized(false)
    window.ipcRenderer.on('maximized', onMax)
    window.ipcRenderer.on('not-maximized', onUnmax)
    return () => {
      window.ipcRenderer.off('maximized', onMax)
      window.ipcRenderer.off('not-maximized', onUnmax)
    }
  }, [])

  return (
    <motion.div
      id="titlebar"
      className={`relative z-30 w-full h-8 flex items-center justify-between ${
        outline ? 'outline outline-1 outline-solid outline-neutral-800' : ''
      }`}
      initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
      animate={{
        backgroundColor: solidBackground ? 'rgba(20,20,20,1)' : 'rgba(0,0,0,0)',
        paddingLeft: isLocked ? 224 : 0
      }}
      
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0 -z-10 drag pointer-events-none" />

      <div id="left-bar" className="flex items-center m-3 drag-exclude">
        <div className="flex items-center gap-2 sm:gap-3 drag-exclude">
          <button
            id="logo"
            className="drag-exclude"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsLocked(false)}
          >
            <img
              src="/taskbar.png"
              alt="Logo"
              className="h-4 w-4 transition-transform duration-200 hover:scale-110"
            />
          </button>

          {!isLocked && (
            <button
              id="sidebar"
              className="relative w-5 h-5 flex items-center justify-center transition-transform duration-200 hover:scale-105 drag-exclude"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsLocked(true)}
            >
              <Menu
                className={`sidebar-icon ${isHovered ? 'icon-hidden' : 'icon-visible'}`}
                color="white"
                size={18}
                strokeWidth={0.9}
              />
              <ChevronsRight
                className={`sidebar-icon absolute transition-transform duration-200 hover:scale-110 ${
                  isHovered ? 'icon-visible' : 'icon-hidden'
                }`}
                color="white"
                size={18}
                strokeWidth={2.25}
              />
            </button>
          )}

          <div id="timestamp-cntr" className="hidden sm:flex items-center">
            <p className="text-neutral-500 text-xs sm:text-sm leading-none font-raleway">
              Edited X ago
            </p>
          </div>
        </div>

        <div id="c-b-cntr" className="flex items-center gap-3 ml-6">
          <div
            id="calendar-cntr"
            className="flex items-center drag-exclude"
            onMouseEnter={() => {
              setCalendarHovered(true)
            }}
            onMouseLeave={() => {
              setCalendarHovered(false)
            }}
          >
            <button
              id="calendar"
              className="relative flex items-center justify-center transition-transform duration-300 ease-out origin-center hover:scale-105 drag-exclude"
            >
              <Calendar
                className={`calendar-icon ${calendarHovered ? 'icon-hidden' : 'icon-visible'}`}
                color="white"
                size={17}
                strokeWidth={1}
              />
              <ChevronsDown
                className={`calendar-icon absolute transition-transform duration-300 ease-out hover:scale-105 ${
                  calendarHovered ? 'icon-visible' : 'icon-hidden'
                }`}
                color="white"
                size={18}
                strokeWidth={2}
              />
            </button>
          </div>
          <div id="alert-cntr" className="flex items-center drag-exclude">
            <button id="alert" className="flex items-center justify-center drag-exclude">
              <Bell color="white" size={18} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>

      <div id="right-bar" className="flex items-center drag-exclude">
        <button id="nav-tog" className="w-5 h-5 flex items-center justify-center drag-exclude">
          <Hexagon color="white" size={16} strokeWidth={2} />
        </button>
        <div className="flex items-center border-l border-neutral-700 ml-5">
          <button
            id="minimize"
            onClick={() => window.ipcRenderer.send('minimize')}
            className="w-5 h-5 flex items-center justify-center hover:bg-neutral-800 rounded transition drag-exclude"
          >
            <Minus color="white" size={16} strokeWidth={2} />
          </button>
          <button
            id="maximize"
            onClick={() => window.ipcRenderer.send(isMaximized ? 'restore' : 'maximize')}
            className="w-5 h-5 flex items-center justify-center hover:bg-neutral-800 rounded transition drag-exclude"
          >
            {isMaximized ? (
              <PiCopy color="white" size={16} />
            ) : (
              <Square color="white" size={13} strokeWidth={2} />
            )}
          </button>
          <button
            id="close"
            onClick={() => window.ipcRenderer.send('close')}
            className="w-5 h-5 flex items-center justify-center drag-exclude"
          >
            <X color="white" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
