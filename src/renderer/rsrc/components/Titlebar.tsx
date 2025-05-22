import { Minus, X, Square} from 'react-feather'
import { PiCopy } from "react-icons/pi";
import '@/renderer/rsrc/styles/abs.css'
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
    <div id="titlebar" className="drag flex justify-end gap-5">
      <div className="flex gap-10 no-drag mr-8 mt-2 mb-1">
        <button id="minimize" onClick={() => window.ipcRenderer.send('minimize')}>
          <Minus color="white" size={15} strokeWidth={2} />
        </button>

        <button
  id="maximize"
  onClick={() => window.ipcRenderer.send(isMaximized ? 'restore' : 'maximize')} 
>
  {isMaximized ? (
    <PiCopy color="white" size={15} strokeWidth={0} />
  ) : (
    <Square color="white" size={12} strokeWidth={2} />
  )}
</button>


        <button id="close" onClick={() => window.ipcRenderer.send('close')}>
          <X color="white" size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
