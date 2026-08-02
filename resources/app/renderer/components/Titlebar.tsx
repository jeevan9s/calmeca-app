import { PiCopy } from "react-icons/pi";
import {
  ChevronsRight,
  Minus,
  X,
  Square,
  Menu,
  Bell,
  Hexagon,
  User,
} from "react-feather";
import "@/renderer/styles/tb.css";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getLastEditedTime,
  getRelativeTimeStamp,
} from "../../services/utilityServicies";
import { Link } from "react-router-dom";
import { RiHomeLine } from "react-icons/ri";

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
  ontoggleAlerts,
  disableButton,
  disableHoverZones = false,
  solidBackground = false,
  outline = false,
}: TitleBarProps) {
  const [isMaximized, setisMaximized] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [lastEdited, setLastEdited] = useState<Date | null>(null);
  const [relativeTime, setRelativeTime] = useState("");

  useEffect(() => {
    const fetchAndUpdate = async () => {
      const timestamp = await getLastEditedTime();
      setLastEdited(timestamp);
      setRelativeTime(getRelativeTimeStamp(timestamp));
    };

    fetchAndUpdate();

    const interval = setInterval(fetchAndUpdate, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const shouldShowHoverZone =
    windowWidth >= 640 &&
    !isAlertsOpen &&
    !isQuickNavOpen &&
    !isAuthDialogOpen &&
    !disableHoverZones;

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
                strokeWidth={0.9}
              />
              <ChevronsRight
                className={`sidebar-icon absolute transition-transform duration-200 hover:scale-110 ${
                  isHovered ? "icon-visible" : "icon-hidden"
                }`}
                color="white"
                size={18}
                strokeWidth={2.25}
              />
            </button>
          )}

          <Link to="/dashboard">
            <button id="home" className="drag-exclude">
              <RiHomeLine            
                strokeWidth={0.05}
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
            <User color="white" size={16} strokeWidth={2} />
          </button>

          <button
            id="nav-tog"
            className="w-5 h-5 flex items-center justify-center drag-exclude"
            onClick={() => {
              if (ontoggleQuickNav) ontoggleQuickNav();
            }}
          >
            <Hexagon color="white" size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center border-l border-neutral-700 ml-5">
          <button
            id="minimize"
            onClick={async () => Neutralino?.window?.minimize()}
            className="w-5 h-5 flex items-center justify-center hover:bg-neutral-800 rounded transition drag-exclude cursor-pointer"
          >
            <Minus color="white" size={16} strokeWidth={2} />
          </button>
          <button
            id="maximize"
            onClick={() => Neutralino?.window?.maximize()}
            className="w-5 h-5 flex items-center justify-center hover:bg-neutral-800 rounded transition drag-exclude cursor-pointer"
          >
            <Square color="white" size={13} strokeWidth={2} />
          </button>
          <button
            id="close"
            onClick={async () => Neutralino?.app?.exit()}
            className="w-5 h-5 flex items-center justify-center drag-exclude cursor-pointer"
          >
            <X color="white" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
