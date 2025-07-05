import { motion } from 'framer-motion'
import { useEffect } from 'react'
import '@/renderer/styles/calendar.css'

type calendarProps = {
  calendarLocked: boolean
  calendarHovered: boolean
  setCalendarLocked: (locked: boolean) => void
  setCalendarHovered: (hovering: boolean) => void
}

export default function CalendarPopup({
  calendarLocked,
  calendarHovered,
  setCalendarLocked,
  setCalendarHovered
}: calendarProps) {
  const isVisible = calendarLocked || calendarHovered

  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      if (calendarLocked && e.clientY <= 20) {
        setCalendarHovered(true)
      }
    }
    window.addEventListener('mousemove', handleHover)
    return () => window.removeEventListener('mousemove', handleHover)
  }, [calendarLocked, setCalendarLocked])

  return (
    <motion.aside
      id="calendar-panel"
      onMouseEnter={() => !calendarLocked && setCalendarHovered(true)}
      onMouseLeave={() => !calendarLocked && setCalendarHovered(false)}
      initial={{ opacity: 0, scale: 0.95, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`
        fixed z-50 flex flex-col top-[12px] mt-8 left-1/2 -translate-x-1/2
        rounded-xl
        w-48 h-40
        sm:w-64 sm:h-48
        md:w-80 md:h-64 
        lg:w-96 lg:h-80
      `}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    />
  )
}
