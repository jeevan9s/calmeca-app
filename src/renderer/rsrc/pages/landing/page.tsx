import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Titlebar from '../../components/Titlebar';

export default function Landing() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const titlebarRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (titlebarRef.current && titlebarRef.current.contains(e.target as Node)) return;

    setIsExiting(true);
  };

  const onAnimationComplete = () => {
    if (isExiting) {
      navigate('/dashboard');
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="landing-page"
          className="flex flex-col h-screen items-center justify-center cursor-pointer"
          onMouseDown={handleStart}
          onKeyDown={handleStart}
          tabIndex={0} 
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          onAnimationComplete={onAnimationComplete}
        >
          <div ref={titlebarRef}>
            <Titlebar />
          </div>

          <div className="flex items-center justify-center">
            <div id="central-text-cntr" className="flex flex-col items-center gap-y-2">
              <div id="title-cntr">
                <h1 id="title" className="text-lg">
                  Calmeca
                </h1>
              </div>
              <div id="subtitle-cntr">
                <h2 id="subtitle">Click anywhere to launch.</h2>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
