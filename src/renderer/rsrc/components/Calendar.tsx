import {motion} from 'framer-motion'
import { useEffect } from 'react'
import  '@/renderer/rsrc/styles/calendar.css'

type calendarProps = {
    calendarLocked: boolean
    calendarHovered: boolean
    setCalendarLocked: (locked : boolean) => void
    setCalendarHovered: (hovering : boolean) => void
}

export default function Calendar( {calendarLocked, calendarHovered, setCalendarLocked, setCalendarHovered} :calendarProps ) {
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
        <motion.div
        id ="calendar-panel"
        className='flex fixed z-50 w-90 h-90'>

        </motion.div>

    )

}