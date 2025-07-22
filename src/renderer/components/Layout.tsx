import { useState, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import QuickNav from './QuickNav';
import Alerts from './Alerts';


type LayoutProps = {
  disableHoverZones?: boolean
  children: ReactNode
}

export default function Layout({disableHoverZones = false, children}: LayoutProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isHoveredMouse, setIsHoveredMouse] = useState(false);
  const [isHoveredButton, setIsHoveredButton] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isHovered = isHoveredButton || isHoveredMouse;


useEffect(() => {
  const handleHover = (e: MouseEvent) => {
    if (disableHoverZones) return;

    const x = e.clientX;
    const y = e.clientY;
    const centerStart = window.innerWidth * 0.35;
    const centerEnd = window.innerWidth * 0.65;

    if ( y <= 25 && x >= centerStart && x <= centerEnd) {
      setIsHoveredMouse(false); 
      return;
    } 

    if (!isLocked && x <= 25) {
      setIsHoveredMouse(true);
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
}, [disableHoverZones, isLocked, isHoveredMouse, windowWidth]);

  const toggleQuickNav = () => {
    if (windowWidth <= 800 && isAlertsOpen) setIsAlertsOpen(false);
    setIsQuickNavOpen((prev) => !prev);
  };

  const toggleAlerts = () => {
    if (windowWidth <= 800 && isQuickNavOpen) setIsQuickNavOpen(false);
    setIsAlertsOpen((prev) => !prev);
  };

  const sidebarVisible = windowWidth <= 600 ? isHovered  : isHovered;
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
  disableHoverZones={disableHoverZones}
  isAlertsOpen={isAlertsOpen}
  isQuickNavOpen={isQuickNavOpen}
  />

      <Sidebar
        isLocked={isLocked}
        isHovered={sidebarVisible}
        setIsHovered={setIsHoveredMouse}
        setIsLocked={setIsLocked}
        disableHoverZones={disableHoverZones}
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
    </>
  );
}
