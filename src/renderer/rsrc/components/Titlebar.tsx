import { PiCopy } from 'react-icons/pi'
import { ChevronsRight, ChevronsUp, Minus, X, Square, Menu, Calendar } from 'react-feather'
import '@/renderer/rsrc/styles/tb.css'
import { useState, useEffect } from 'react'

export default function TitleBar() {
  const [isMaximized, setisMaximized] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [calendarHovered, setCalendarHovered] = useState(false)
  const [calendarVisible, setCalendarVisible] = useState(false)

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

  const handleSidebarHover = () => {
    setSidebarHovered(true)
    setSidebarVisible(true)
  }

  const handleSidebarLeave = () => {
    setSidebarHovered(false)
    setSidebarVisible(false)
  }

  const handleCalendarHover = () => {
    setCalendarHovered(true)
    setCalendarVisible(true)
  }

  const handleCalendarLeave = () => {
    setCalendarHovered(false)
    setCalendarVisible(false)
  }

  return (
    <div id="titlebar" className="drag relative w-full h-9 flex items-center">
      <div id="left-bar" className="absolute left-0 flex no-drag mt-2 mb-1 ml-5">
        <div
          id="subleft-bar"
          className="flex items-center gap-5"
          onMouseEnter={handleSidebarHover}
          onMouseLeave={handleSidebarLeave}
        >
          <button id="logo">
            <img src="/taskbar.png" alt="Logo" className="h-4 w-4 p-0" />
          </button>

          <button id="sidebar" className="relative w-6 h-6">
            <Menu
              className={`sidebar-icon ${sidebarHovered ? 'icon-hidden' : 'icon-visible'}`}
              color="white"
              size={14}
              strokeWidth={2}
            />
            <ChevronsRight
              className={`sidebar-icon ${sidebarHovered ? 'icon-visible' : 'icon-hidden'}`}
              color="white"
              size={20}
              strokeWidth={2}
            />
          </button>
          </div>

          <div
            id="calendar-cntr"
            className="flex items-center gap-5 ml-40"
            onMouseEnter={handleCalendarHover}
            onMouseLeave={handleCalendarLeave}
          >
            <button id="calendar" className="relative w-6 h-6">
              <Calendar
                id = "cd-icon"
                className={`calendar-icon ${calendarHovered ? 'icon-hidden' : 'icon-visible'}`}
                color="white"
                size={20}
                strokeWidth={2}
              />
              <ChevronsUp
                id = "arrow-up"
                className={`calendar-icon ${calendarHovered ? 'icon-visible' : 'icon-hidden'}`}
                color="white"
                size={20}
                strokeWidth={2}
              />
            </button>
          </div>
      </div>

      <div id="right-bar" className="absolute right-0 flex no-drag">
        <button id="minimize" onClick={() => window.ipcRenderer.send('minimize')}>
          <Minus color="white" size={16} strokeWidth={2} />
        </button>
        <button
          id="maximize"
          onClick={() => window.ipcRenderer.send(isMaximized ? 'restore' : 'maximize')}
        >
          {isMaximized ? (
            <PiCopy color="white" size={16} strokeWidth={0} />
          ) : (
            <Square color="white" size={13} strokeWidth={2} />
          )}
        </button>
        <button id="close" onClick={() => window.ipcRenderer.send('close')}>
          <X color="white" size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
