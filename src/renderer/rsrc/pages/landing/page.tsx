import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Titlebar from '../../components/Titlebar';

export default function Landing() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const titlebarRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    landingRef.current?.focus();
  }, []);

  const handleStart = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ('target' in e && titlebarRef.current?.contains(e.target as Node)) return;

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
          className="flex flex-col h-screen items-center justify-center cursor-pointer outline-none"
          ref={landingRef}
          onMouseDown={handleStart}
          onKeyDown={handleStart}
          tabIndex={0}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onAnimationComplete={onAnimationComplete}
        >
          <div ref={titlebarRef}>
            <Titlebar />
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-y-2">
              <h1 className="text-lg font-montserrat">Calmeca</h1>
              <h2 className="text-sm font-scp font-light text-neutral-400">
                Click anywhere or press a key to launch.
              </h2>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
