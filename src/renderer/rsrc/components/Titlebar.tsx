import { Minus, X, Square, Menu } from 'react-feather'
import { PiCopy } from 'react-icons/pi'
import { ChevronsRight } from 'react-feather'
import '@/renderer/rsrc/styles/tb.css'
import { useState, useEffect } from 'react'

export default function TitleBar() {
  const [isMaximized, setisMaximized] = useState(false)
  const [sidebarHovered, setSidebarHovered ] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)



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





  return (
    <div id="titlebar" className="drag relative w-full h-10 flex items-center">
<div
  id="left-bar"
  className="absolute left-0 flex no-drag mt-2 mb-1 ml-5"
  onMouseEnter={handleSidebarHover}
  onMouseLeave={handleSidebarLeave}
>
  <button id="sidebar">
    {sidebarHovered ? (
      <ChevronsRight color="white" size={20} strokeWidth={2} />
    ) : (
      <Menu id="menu" color="white" size={16} strokeWidth={2} />
    )}
  </button>
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