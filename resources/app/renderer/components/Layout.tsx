import { useState, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import QuickNav from './QuickNav';
import AuthDialog from './AuthDialog';

type LayoutProps = {
  disableHoverZones?: boolean;
  children: ReactNode;
};

export default function Layout({ disableHoverZones = false, children }: LayoutProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isHoveredMouse, setIsHoveredMouse] = useState(false);
  const [isHoveredButton, setIsHoveredButton] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isHovered = isHoveredButton || isHoveredMouse;

  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      if (disableHoverZones) return;

      const x = e.clientX;
      const y = e.clientY;
      const centerStart = window.innerWidth * 0.35;
      const centerEnd = window.innerWidth * 0.65;

      if (y <= 25 && x >= centerStart && x <= centerEnd) {
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
    if (isAuthDialogOpen) setIsAuthDialogOpen(false)
    setIsQuickNavOpen((prev) => !prev);
  };

    const toggleAuth = () => {
    if(isQuickNavOpen) setIsQuickNavOpen(false)
    setIsAuthDialogOpen((prev) => !prev);
  };

  const sidebarVisible = windowWidth <= 600 ? isHovered : isHovered;
  const isSidebarHovered = isHoveredButton || isHoveredMouse;

  return (
    <div className="relative min-h-screen">
      <Titlebar
        isLocked={isLocked}
        isHovered={isSidebarHovered}
        setIsHovered={setIsHoveredButton}
        setIsLocked={setIsLocked}
        solidBackground={true}
        ontoggleQuickNav={toggleQuickNav}
        ontoggleAuth={toggleAuth}
        disableHoverZones={disableHoverZones}
        isAuthDialogOpen={isAuthDialogOpen}
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
        {isAuthDialogOpen && (
          <AuthDialog isAuthDialogOpen={isAuthDialogOpen} setIsAuthDialogOpen={setIsAuthDialogOpen} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQuickNavOpen && (
          <QuickNav isQuickNavOpen={isQuickNavOpen} setIsQuickNavOpen={setIsQuickNavOpen} />
        )}
      </AnimatePresence>

      <main
        className={`transition-all duration-300 ${
          isLocked || (windowWidth > 600 && isHovered) ? 'lg:ml-64' : 'lg:ml-0'
        } pt-5`}
      >
        {children}
      </main>
    </div>
  );
}