import { useState, useEffect } from 'react'
import { motion, easeInOut } from 'framer-motion'
import  '@/renderer/styles/quicknav.css'

type QuickNavProps = {
  isQuickNavOpen: boolean;
  setIsQuickNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function QuickNav({ isQuickNavOpen, setIsQuickNavOpen }: QuickNavProps) {
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

  return (
    <motion.div
      id="quick-nav-panel"
      initial={{ opacity: 0, scale: 0.95, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0, width, height }}
      exit={{ opacity: 0, scale: 0.95, y: -12 }}
      transition={{ duration: 0.3, ease: easeInOut }}
      className="fixed top-12 right-4 z-50 rounded-2xl shadow-lg"
      style={{ width, height }}
    >

    </motion.div>
  )
}
