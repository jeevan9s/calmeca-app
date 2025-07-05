import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import QuickNav from './QuickNav';
import Alerts from './Alerts';
import CalendarPopup from './CalendarPopup';

export default function Layout() {
  const [isLocked, setIsLocked] = useState(false);
  const [calendarLocked, setCalendarLocked] = useState(false);
  const [calendarHoveredMouse, setCalendarHoveredMouse] = useState(false);
  const [calendarHoveredButton, setCalendarHoveredButton] = useState(false);
  const [isHoveredMouse, setIsHoveredMouse] = useState(false);
  const [isHoveredButton, setIsHoveredButton] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isHovered = isHoveredButton || isHoveredMouse;
  const isCalendarHovered = calendarHoveredButton || calendarHoveredMouse;
  const isCalendarVisible = calendarLocked || isCalendarHovered;

  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const centerStart = window.innerWidth * 0.35;
      const centerEnd = window.innerWidth * 0.65;

      if (!calendarLocked && y <= 25 && x >= centerStart && x <= centerEnd) {
        setCalendarHoveredMouse(true);
        setIsHoveredMouse(false); 
        return;
      } else {
        setCalendarHoveredMouse(false);
      }

      if (!isLocked && x <= 25) {
        setIsHoveredMouse(true);
        if (windowWidth <= 600 && isCalendarVisible) {
          setCalendarHoveredMouse(false);
          setCalendarLocked(false);
        }
      } else {
        setIsHoveredMouse(false);
      }
    };

    window.addEventListener('mousemove', handleHover);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleHover);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLocked, calendarLocked, calendarHoveredMouse, isHoveredMouse, windowWidth, isCalendarVisible]);

  const toggleQuickNav = () => {
    if (windowWidth <= 800 && isAlertsOpen) setIsAlertsOpen(false);
    setIsQuickNavOpen((prev) => !prev);
  };

  const toggleAlerts = () => {
    if (windowWidth <= 800 && isQuickNavOpen) setIsQuickNavOpen(false);
    setIsAlertsOpen((prev) => !prev);
  };

  const sidebarVisible = windowWidth <= 600 ? isHovered && !isCalendarVisible : isHovered;
  const calendarVisible = (calendarLocked || isCalendarHovered) && !isAlertsOpen && !isQuickNavOpen && (windowWidth > 600 && !isHovered)
  const isSidebarHovered = isHoveredButton || isHoveredMouse;

  return (
    <>
      <Titlebar
        isLocked={isLocked}
        isHovered={isSidebarHovered}
        setIsHovered={setIsHoveredButton}
        setIsLocked={setIsLocked}
        solidBackground={true}
        ontoggleQuickNav={toggleQuickNav}
        ontoggleAlerts={toggleAlerts}
        isCalendarHovered={calendarHoveredButton}
        isCalendarLocked={calendarLocked}
        setIsCalendarHovered={setCalendarHoveredButton}
        setIsCalendarLocked={setCalendarLocked}
      />

      <Sidebar
        isLocked={isLocked}
        isHovered={sidebarVisible}
        setIsHovered={setIsHoveredMouse}
        setIsLocked={setIsLocked}
      />

      <AnimatePresence>
        {isQuickNavOpen && (
          <QuickNav isQuickNavOpen={isQuickNavOpen} setIsQuickNavOpen={setIsQuickNavOpen} />
        )}
      </AnimatePresence>

   <AnimatePresence>
  {isAlertsOpen && (
    <motion.div className='z-50'>
      <Alerts
        isAlertsOpen={isAlertsOpen}
        setIsAlertsOpen={setIsAlertsOpen}
        isLocked={isLocked}  
      />
    </motion.div>
  )}
</AnimatePresence>

      <AnimatePresence>
        {calendarVisible && (
          <CalendarPopup
            calendarLocked={calendarLocked}
            calendarHovered={isCalendarHovered}
            setCalendarLocked={setCalendarLocked}
            setCalendarHovered={(hovering) => {
              setCalendarHoveredMouse(hovering);
              setCalendarHoveredButton(hovering);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
