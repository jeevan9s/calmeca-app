import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';

export default function Layout() {
  const [isLocked, setIsLocked] = useState(false);
  const [isHoveredMouse, setIsHoveredMouse] = useState(false)
  const [isHoveredButton, setIsHoveredButton] = useState(false)

  const isHovered = isHoveredButton || isHoveredMouse
  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      if (!isLocked && e.clientX <= 20) setIsHoveredMouse(true);
      else if (!isLocked) setIsHoveredMouse(false);
    };
    window.addEventListener('mousemove', handleHover);
    return () => window.removeEventListener('mousemove', handleHover);
  }, [isLocked]);

  return (
    <>
      <Titlebar
        isLocked={isLocked}
        isHovered={isHovered}
        setIsHovered={setIsHoveredButton}
        setIsLocked={setIsLocked}
        solidBackground={true}
      />
      <Sidebar
        isLocked={isLocked}
        isHovered={isHovered}
        setIsHovered={setIsHoveredMouse}
        setIsLocked={setIsLocked}
      />
    </>
  );
}
