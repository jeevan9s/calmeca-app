import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import QuickNav from './QuickNav';
import Alerts from './Alerts';

export default function Layout() {
  const [isLocked, setIsLocked] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isHoveredMouse, setIsHoveredMouse] = useState(false);
  const [isHoveredButton, setIsHoveredButton] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isHovered = isHoveredButton || isHoveredMouse;

  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      if (!isLocked && e.clientX <= 20) setIsHoveredMouse(true);
      else if (!isLocked) setIsHoveredMouse(false);
    };
    window.addEventListener('mousemove', handleHover);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleHover);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLocked]);

  const toggleQuickNav = () => {
    if (windowWidth <= 600 && isAlertsOpen) {
      setIsAlertsOpen(false);
    }
    setIsQuickNavOpen(prev => !prev);
  };

  const toggleAlerts = () => {
    if (windowWidth <= 600 && isQuickNavOpen) {
      setIsQuickNavOpen(false);
    }
    setIsAlertsOpen(prev => !prev);
  };

  return (
    <>
      <Titlebar
        isLocked={isLocked}
        isHovered={isHovered}
        setIsHovered={setIsHoveredButton}
        setIsLocked={setIsLocked}
        solidBackground={true}
        ontoggleQuickNav={toggleQuickNav}
        ontoggleAlerts={toggleAlerts}
      />
      <Sidebar
        isLocked={isLocked}
        isHovered={isHovered}
        setIsHovered={setIsHoveredMouse}
        setIsLocked={setIsLocked}
      />
      <AnimatePresence>
        {isQuickNavOpen && (
          <QuickNav
            isQuickNavOpen={isQuickNavOpen}
            setIsQuickNavOpen={setIsQuickNavOpen}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAlertsOpen && (
          <Alerts
            isAlertsOpen={isAlertsOpen}
            setIsAlertsOpen={setIsAlertsOpen}
          />
        )}
      </AnimatePresence>
    </>
  );
}
