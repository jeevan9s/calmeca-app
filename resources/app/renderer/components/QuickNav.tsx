import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, easeInOut } from 'framer-motion'
import '@/renderer/styles/quicknav.css'
import { ChevronRight, Home, Book, Folder } from 'react-feather'
import { RiHomeLine } from 'react-icons/ri'
import { LayoutGrid } from 'lucide-react'

type QuickNavProps = {
  isQuickNavOpen: boolean
  setIsQuickNavOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function QuickNav({ isQuickNavOpen, setIsQuickNavOpen }: QuickNavProps) {
  const navigate = useNavigate()
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const handleResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getDims = () => {
    const { w, h } = size
    if (w >= 1440) return { width: '23rem', height: '9rem' }
    if (w >= 1320) return { width: '22rem', height: '8.85rem' }
    if (w >= 1200) return { width: '21rem', height: '8.75rem' }
    if (w >= 1080) return { width: '20rem', height: '8.65rem' }
    if (w >= 1024) return { width: '19.5rem', height: '8.5rem' }
    if (w >= 960) return { width: '18rem', height: '8.35rem' }
    if (w >= 900) return { width: '17rem', height: '8.25rem' }
    if (w >= 840) return { width: '16rem', height: '8.15rem' }
    if (w >= 768) return { width: '15rem', height: '8rem' }
    if (w >= 700) return { width: '14rem', height: '8rem' }
    if (w >= 640) return { width: '13rem', height: '8rem' }
    return { width: '13rem', height: h <= 400 ? '7.5rem' : '8rem' }
  }

  const { width, height } = getDims()

  const handleNavigate = (path: string) => {
    navigate(path)
    setIsQuickNavOpen(false)
  }

  return (
    <motion.div
      id="quick-nav-panel"
      initial={{ opacity: 0, scale: 0.95, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0, width, height }}
      exit={{ opacity: 0, scale: 0.95, y: -12 }}
      transition={{ duration: 0.3, ease: easeInOut }}
      className="fixed top-12 right-4 z-50 rounded-2xl bg-[#18181BF2] p-4 border border-neutral-800 shadow-xl"
      style={{ width, height }}
    >
      <div className="flex justify-end w-full mb-3">
        <button
          className="w-6 h-6 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
          onClick={() => setIsQuickNavOpen(false)}
        >
          <ChevronRight size={18} className="text-white" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigate('/dashboard')}
          className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
        >
          <LayoutGrid size={20} className="text-white" />
          <span className="text-xs text-white font-dm">dashboard</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigate('/courseoverview')}
          className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
        >
          <Folder size={20} className="text-white" />
          <span className="text-xs text-white font-dm">courses</span>
        </motion.button>
      </div>
    </motion.div>
  )
}