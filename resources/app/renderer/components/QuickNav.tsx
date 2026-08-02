import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, easeInOut } from 'framer-motion'
import  '@/renderer/styles/quicknav.css'
import { ChevronRight, X, BookOpen, Home, Calendar, Book } from 'react-feather';

type QuickNavProps = {
  isQuickNavOpen: boolean;
  setIsQuickNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function QuickNav({ isQuickNavOpen, setIsQuickNavOpen }: QuickNavProps) {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)

  useEffect(() => {
    function onResize() {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  
  let width = '12rem' // sm, w-48
  let height = '8rem'  // h-32



if (windowWidth >= 1440) {
  width = '25rem'
  height = '13rem'
} else if (windowWidth >= 1320) {
  width = '24rem'
  height = '12.5rem'
} else if (windowWidth >= 1200) {
  width = '23rem'
  height = '12rem'
} else if (windowWidth >= 1080) {
  width = '22rem'
  height = '11.5rem'
} else if (windowWidth >= 1024) {
  width = '21.5rem'
  height = '11rem'
} else if (windowWidth >= 960) {
  width = '20rem'
  height = '10.5rem'
} else if (windowWidth >= 900) {
  width = '19rem'
  height = '10rem'
} else if (windowWidth >= 840) {
  width = '18rem'
  height = '9.5rem'
} else if (windowWidth >= 768) {
  width = '17rem'
  height = '9rem'
} else if (windowWidth >= 700) {
  width = '16rem'
  height = '8.5rem'
} else if (windowWidth >= 640) {
  width = '15rem'
  height = '8.25rem'
} else {
  width = '13rem'
  height = '8rem'
}

if (windowHeight <= 400) {
  height = '7.5rem'
  width = '13rem'
} else if (windowHeight <= 600) {
  height = '8rem'
}

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsQuickNavOpen(false);
  };

  return (
<motion.div
  id="quick-nav-panel"
  initial={{ opacity: 0, scale: 0.95, y: -12 }}
  animate={{ opacity: 1, scale: 1, y: 0, width, height }}
  exit={{ opacity: 0, scale: 0.95, y: -12 }}
  transition={{ duration: 0.3, ease: easeInOut }}
  className="fixed top-12 right-4 z-50 rounded-2xl bg-[#18181BF2] p-4"
  style={{ width, height }}
>
  <div className="flex justify-end w-full mb-3">
    <button
      className="w-6 h-6 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center"
      onClick={() => setIsQuickNavOpen(false)}
    >
      <ChevronRight size={18} className="text-white"/>
    </button>
  </div>
  
  <div className="grid grid-cols-2 gap-2">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleNavigate('/dashboard')}
      className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
    >
      <Home size={20} className="text-white"/>
      <span className="text-xs text-white font-dm">dashboard</span>
    </motion.button>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleNavigate('/dashboard')}
      className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
    >
      <BookOpen size={20} className="text-white"/>
      <span className="text-xs text-white font-dm">tasks</span>
    </motion.button>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleNavigate('/courseoverview')}
      className="flex flex-col ml-25 items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
    >
      <Book size={20} className="text-white"/>
      <span className="text-xs text-white font-dm">courses</span>
    </motion.button>
  
  </div>
</motion.div>

  )
}