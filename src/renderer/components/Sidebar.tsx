import {  useEffect } from 'react'
import { ChevronsLeft } from 'react-feather'
import { motion } from 'framer-motion'
import '@/renderer/styles/sb.css'

  type sbProps = {
    isLocked: boolean
    isHovered: boolean
    setIsHovered: (hovering: boolean) => void
    setIsLocked: (locked: boolean) => void
  }

export default function Sidebar( {isLocked, isHovered, setIsLocked, setIsHovered} :sbProps ) {
  const isVisible = isLocked || isHovered

  // appear on hover logic
  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      if (!isLocked && e.clientX <= 20) {
        setIsHovered(true)
      }
    }
    window.addEventListener('mousemove', handleHover)

    return () => window.removeEventListener('mousemove', handleHover)
  }, [isLocked, setIsHovered])
  

  return (
<motion.aside
  id="sb-panel"
  onMouseEnter={() => !isLocked && setIsHovered(true)}
  onMouseLeave={() => !isLocked && setIsHovered(false)}
  className={`
    flex fixed z-50 flex-col transition-all duration-200 ease-in-out
    ${isVisible ? 'w-44 sm:w-52 md:w-56' : 'w-0'}
    ${isLocked
      ? 'top-0 left-0 bottom-0 outline outline-1 outline-neutral-800 rounded-none'
      : 'top-12 left-0 bottom-6 shadow-lg rounded-2xl max-h-[600px]'
    }
  `}
  style={{ backgroundColor: 'rgba(20,20,20,1)', overflowY: 'hidden' }}
>
   {isLocked && (
      <button
        onClick={() => setIsLocked(false)}
        id="close-sb"
        className="absolute top-1.5 right-1.5 w-5  flex items-center justify-center
                   transition-transform duration-200 hover:scale-105 z-50 "
        style={{ pointerEvents: 'auto' }}
      >
        <ChevronsLeft
          className="transition-transform duration-200 hover:scale-110"
          color="white"
          size={18}
          strokeWidth={2}
        />
      </button>
    )}
  <header
    id="sb-header"
    className="relative w-full flex items-center justify-between mt-10 px-3"
  >
    <div id="title-cntr" className="flex flex-col">
      <h3 id="sb-subtitl" className="text-neutral-500"></h3>
    </div>

  </header>

</motion.aside>
  )
}
