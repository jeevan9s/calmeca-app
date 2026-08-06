import {
  ChevronsRight,
  Minus,
  X,
  Square,
  Copy,
  Menu,
  Hexagon,
  User,
} from "react-feather";
import "@/renderer/styles/tb.css";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

type TitleBarProps = {
  solidBackground?: boolean;
  outline?: boolean;
  isHovered: boolean;
  isLocked: boolean;
  ontoggleQuickNav?: () => void;
  ontoggleAuth?: () => void;
  ontoggleAlerts?: () => void;
  setIsLocked: (locked: boolean) => void;
  setIsHovered: (hovering: boolean) => void;
  isAlertsOpen: boolean;
  isQuickNavOpen: boolean;
  isAuthDialogOpen: boolean;
  disableButton?: boolean;
  disableHoverZones?: boolean;
};

export default function TitleBar({
  isLocked,
  isHovered,
  isAlertsOpen,
  isQuickNavOpen,
  isAuthDialogOpen,
  setIsHovered,
  setIsLocked,
  ontoggleQuickNav,
  ontoggleAuth,
  disableButton,
  disableHoverZones = false,
  solidBackground = false,
  outline = false,
}: TitleBarProps) {
  const [isMaximized, setisMaximized] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [relativeTime] = useState("");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  let paddingLeft = 0;
  if (isLocked) {
    if (windowWidth < 640) paddingLeft = 170;
    else if (windowWidth < 850) paddingLeft = 210;
    else if (windowWidth < 1024) paddingLeft = 220;
    else paddingLeft = 224;
  }

  return (
    <motion.div
      id="titlebar"
      className={`relative z-10 w-full h-8 flex items-center justify-between ${
        outline ? "outline outline-1 outline-solid outline-neutral-800" : ""
      }`}
      initial={{ backgroundColor: "rgba(0,0,0,0)", paddingLeft: 0 }}
      animate={{
        backgroundColor: isLocked ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0)",
        paddingLeft,
      }}
      transition={{ type: "tween", duration: 0.3 }}
    >
      {solidBackground && (
        <motion.div
          className="absolute inset-0 pointer-events-none -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ backgroundColor: "#0f0f10ff" }}
        />
      )}
      <div className="absolute inset-0 drag" />

      <div id="left-bar" className="flex items-center m-3 drag-exclude min-w-0">
        <div className="flex items-center gap-2 drag-exclude min-w-0">
          <Link to="/dashboard">
            <button
              id="logo"
              className="drag-exclude"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsLocked(false)}
            >
              <img
                src="../../public/taskbar.png"
                alt="Logo"
                className="h-4 w-4 transition-transform duration-200 hover:scale-110"
              />
            </button>
          </Link>

          {!isLocked && (
            <button
              id="sidebar"
              className={`relative w-5 h-5 flex items-center justify-center drag-exclude transition-transform duration-200 ${
                disableButton
                  ? "cursor-not-allowed opacity-60"
                  : "hover:scale-105"
              }`}
              onMouseEnter={() => !disableButton && setIsHovered(true)}
              onMouseLeave={() => !disableButton && setIsHovered(false)}
              onClick={() => {
                if (!disableButton) setIsLocked(true);
              }}
              disabled={disableButton}
            >
              <Menu
                className={`sidebar-icon ${
                  isHovered ? "icon-hidden" : "icon-visible"
                }`}
                color="white"
                size={18}
                strokeWidth={1}
              />
              <ChevronsRight
                className={`sidebar-icon absolute transition-transform duration-200 hover:scale-110 ${
                  isHovered ? "icon-visible" : "icon-hidden"
                }`}
                color="white"
                size={18}
                strokeWidth={1}
              />
            </button>
          )}

          <Link to="/dashboard">
            <button id="home" className="drag-exclude mt-[6px] cursor-pointer">
              <LayoutDashboard 
                strokeWidth={0.8}
                size={19}
                color="white" />
            </button>
          </Link>

          {(!isLocked || windowWidth >= 640) && (
            <p className="text-neutral-500 text-xs sm:text-xs leading-none font-md">
              {relativeTime}
            </p>
          )}
        </div>
      </div>

      <div id="right-bar" className="flex items-center drag-exclude">
        <div className="flex gap-x-3">
          <button
            id="auth-tog"
            className="w-5 h-5 flex items-center justify-center drag-exclude"
            onClick={() => {
              if (ontoggleAuth) ontoggleAuth();
            }}
          >
            <User color="white" size={16} strokeWidth={1} />
          </button>

          <button
            id="nav-tog"
            className="w-5 h-5 flex items-center justify-center drag-exclude"
            onClick={() => {
              if (ontoggleQuickNav) ontoggleQuickNav();
            }}
          >
            <Hexagon color="white" size={16} strokeWidth={1} />
          </button>
        </div>
        <div className="flex items-center border-l border-neutral-700 ml-5">
          <button
            id="minimize"
            onClick={async () => {
              try {
                await Neutralino.window.minimize();
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 rounded transition drag-exclude cursor-pointer"
          >
            <Minus color="white" size={16} strokeWidth={1} />
          </button>
          <button
            id="maximize"
            onClick={async () => {
              try {
                const maximized = await Neutralino.window.isMaximized();
                if (maximized) {
                  await Neutralino.window.unmaximize();
                  setisMaximized(false);
                } else {
                  await Neutralino.window.maximize();
                  setisMaximized(true);
                }
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 rounded transition drag-exclude cursor-pointer"
          >
            {isMaximized ? (
              <Copy color="white" size={12} strokeWidth={1} className="rotate-180 scale-x-[-1]" />
            ) : (
              <Square color="white" size={13} strokeWidth={1} />
            )}
          </button>
          <button
            id="close"
            onClick={async () => {
              try {
                await Neutralino.app.exit();
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded transition drag-exclude cursor-pointer"
          >
            <X color="white" size={16} strokeWidth={1} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}