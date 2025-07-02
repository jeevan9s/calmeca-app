import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Titlebar from '../../components/Titlebar'
import '@/renderer/rsrc/styles/landing.css'

export default function Landing() {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const titlebarRef = useRef<HTMLDivElement>(null)

  const handleMouseStart = (e: React.MouseEvent) => {
    if ('target' in e && titlebarRef.current?.contains(e.target as Node)) return
    setIsExiting(true)
  }

  const handleKeyStart = (e: React.KeyboardEvent) => {
    setIsExiting(true)
  }

  useEffect(() => {
    const handleWindowKeyDown = () => {
      setIsExiting(true)
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown)
    }
  }, [])

  return (
    <>
      <div className="bg-black/30" ref={titlebarRef}>
        <Titlebar
          solidBackground={false}
          isHovered={isHovered}
          isLocked={isLocked}
          setIsHovered={setIsHovered}
          setIsLocked={setIsLocked}
          disableButton = {true}
        />
      </div>

      <AnimatePresence
        onExitComplete={() => {
          if (isExiting) navigate('/dashboard')
        }}
      >
        {!isExiting && (
          <div
            onMouseDown={handleMouseStart}
            onKeyDown={handleKeyStart}
            tabIndex={0}
            className="flex flex-col h-screen items-center justify-center cursor-pointer outline-none shadow-lg bg-black/30"
          >
            <motion.div
              className="flex flex-col items-center outline-none"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7, borderRadius: '1rem' }}
              transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-y-2">
                  <h1 className="text-lg font-mp">Calmeca</h1>
                  <h2 className="text-sm font-scp font-light text-neutral-400">
                    Click anywhere or press a key to launch.
                  </h2>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}