import { useState, useEffect } from "react";
import { ChevronsLeft, Home, BookOpen } from "react-feather";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAllCourses } from "@/services/core services/courseService";
import { Course } from "@/services/db";
import "@/renderer/styles/sb.css";
import {
  getLoggedInUser,
  googleLogin,
  googleLogout,
} from "@/services/google";
import { Folder, LayoutDashboard } from "lucide-react";

type sbProps = {
  isLocked: boolean;
  isHovered: boolean;
  setIsHovered: (hovering: boolean) => void;
  setIsLocked: (locked: boolean) => void;
  disableHoverZones?: boolean;
};

export default function Sidebar({
  isLocked,
  isHovered,
  setIsLocked,
  setIsHovered,
  disableHoverZones,
}: sbProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();
  const isVisible = isLocked || isHovered;

  const [user, setUser] = useState<{
    name: string;
    email: string;
    picture: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getLoggedInUser();
        setUser(currentUser ?? null);
      } catch (err) {
        console.error("Failed to fetch logged-in user:", err);
      }
    };
    fetchUser();
  }, [isVisible]);

  useEffect(() => {
    const fetchSidebarCourses = async () => {
      try {
        const allCourses = await getAllCourses();
        setCourses(allCourses);
      } catch {}
    };
    fetchSidebarCourses();
  }, []);

  useEffect(() => {
    if (disableHoverZones) return;

    const handleHover = (e: MouseEvent) => {
      if (!isLocked && e.clientX <= 20) {
        setIsHovered(true);
      }
    };
    window.addEventListener("mousemove", handleHover);

    return () => window.removeEventListener("mousemove", handleHover);
  }, [isLocked, setIsHovered, disableHoverZones]);

  return (
    <motion.aside
      id="sb-panel"
      onMouseEnter={() => !disableHoverZones && !isLocked && setIsHovered(true)}
      onMouseLeave={() =>
        !disableHoverZones && !isLocked && setIsHovered(false)
      }
      className={`
        flex fixed z-50 flex-col transition-all duration-200 ease-in-out
        ${isVisible ? "w-44 sm:w-52 md:w-56" : "w-0"}
        ${
          isLocked
            ? "top-0 left-0 bottom-0 outline outline-1 outline-neutral-800 rounded-none"
            : "top-12 left-0 bottom-6 shadow-lg rounded-2xl max-h-[600px]"
        }
      `}
      style={{ backgroundColor: "#0f0f10ff", overflowY: "auto" }}
    >
      {isLocked && (
        <button
          onClick={() => setIsLocked(false)}
          id="close-sb"
          className="absolute top-1.5 right-1.5 w-5 flex items-center justify-center
                     transition-transform duration-200 hover:scale-105 z-50"
          style={{ pointerEvents: "auto" }}
        >
          <ChevronsLeft
            className="transition-transform duration-200 hover:scale-110"
            color="white"
            size={18}
            strokeWidth={2}
          />
        </button>
      )}

      <div className="flex flex-col items-left mt-8 px-4 pb-4 border-b border-zinc-800">
        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden mb-2">
          {user?.picture ? (
            <img src={user.picture} alt="profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-sm font-semibold text-neutral-300">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <span className="font-dm font-medium text-sm text-white text-left truncate w-full">
          {user?.name}
        </span>
        <span className="font-dm text-xs text-neutral-400 text-left truncate w-full">
          {user?.email}
        </span>
      </div>

      <div className="flex flex-col px-3 py-4 gap-1 border-b border-zinc-800">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-zinc-800/60 transition-colors text-sm font-dm cursor-pointer"
        >
          <LayoutDashboard size={16} />
          dashboard
        </button>
        <button
          onClick={() => navigate("/courseoverview")}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-zinc-800/60 transition-colors text-sm font-dm cursor-pointer"
        >
          <Folder size={16} />
          course overview
        </button>
      </div>

      <div className="flex flex-col px-3 py-4 gap-1 overflow-y-auto flex-1">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-1">
          courses
        </span>
        {courses.length === 0 ? (
          <span className="text-xs text-neutral-500 px-3 py-1">
            no courses found
          </span>
        ) : (
          courses.map((course) => (
            <button
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-zinc-800/40 transition-colors text-xs font-dm text-left truncate cursor-pointer"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${{ blue: "bg-blue-500", red: "bg-red-500", green: "bg-green-500" }[course.color ?? "bg-gray-500"] || "bg-gray-500"}`}
              />
              <span className="truncate">{course.title}</span>
            </button>
          ))
        )}
      </div>
    </motion.aside>
  );
}
