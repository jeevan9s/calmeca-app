import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Titlebar from '../../components/Titlebar';

export default function Landing() {
  const navigate = useNavigate();
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    landingRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      navigate('/dashboard');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const handleClick = (e: React.MouseEvent) => {
    navigate('/dashboard');
  };

  return (
    <div
      ref={landingRef}
      className="flex flex-col h-screen items-center justify-center cursor-pointer outline-none"
      onClick={handleClick}
      tabIndex={0}
    >
      <div>
        <Titlebar />
      </div>

      <div className="flex items-center justify-center">
        <div id="central-text-cntr" className="flex flex-col items-center gap-y-2">
          <div id="title-cntr">
            <h1 id="title" className="text-lg font-raleway">
              Calmeca
            </h1>
          </div>
          <div id="subtitle-cntr">
            <h2 id="subtitle">Click anywhere or press a key to launch.</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
