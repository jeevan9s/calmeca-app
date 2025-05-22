import { Minus, X, Square, Menu } from 'react-feather'
import { PiCopy } from 'react-icons/pi'
import '@/renderer/rsrc/styles/tb.css'
import { useState, useEffect } from 'react'

export default function TitleBar() {
  const [isMaximized, setisMaximized] = useState(false)

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
    <div id="titlebar" className="drag relative w-full h-10 flex items-center">
      <div id="left-bar" className="absolute left-0 flex gap-10 no-drag mt-2 mb-1 ml-2">
        <button id="sidebar">
          <Menu color="white" size={16} strokeWidth={2} className='ml-10' />
        </button>
      </div>

      <div id="right-bar" className="absolute right-0 flex gap-10 no-drag mr-8 mt-2 mb-1">
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
