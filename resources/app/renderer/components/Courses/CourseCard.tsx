"use client";

import { useState, useRef, useEffect, useCallback, type MouseEvent } from "react";
import { Course, courseTypeLabels } from "@/services/db";
import { format, differenceInDays } from "date-fns";
import { Calendar, GraduationCap, Edit2, Trash2, Archive, MoreHorizontal, LucideTrash2 } from "lucide-react";
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";


interface CourseCardProps {
  course?: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onArchive: (courseId: string) => void;
}

export default function CourseCard({ course, onEdit, onDelete, onArchive }: CourseCardProps) {
  if (!course) return null;

  const iconName = typeof course.icon === "string"
    ? course.icon.includes("-")
      ? course.icon.toLowerCase()
      : course.icon.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
    : null;
  const courseIconElement = iconName ? <DynamicIcon name={iconName as IconName} size={16} className="text-white" /> : null;

  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const navigate = useNavigate();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 80, damping: 22, mass: 0.9 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const rotateX = useTransform(springY, [-80, 80], [10, -10]);
  const rotateY = useTransform(springX, [-80, 80], [-10, 10]);
  const scale = useTransform(springY, [-80, 80], [1, 1.03]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    x.set(offsetX);
    y.set(offsetY);
  }, [x, y]);

  const handleEdit = () => { onEdit(course); setShowPopup(false); };
  const handleDelete = () => { setShowDeleteDialog(true); setShowPopup(false); };
  const confirmDelete = () => { onDelete(course.id); setShowDeleteDialog(false); };
  const handleArchive = () => { setShowArchiveDialog(true); setShowPopup(false); };
  const confirmArchive = () => { onArchive(course.id); setShowArchiveDialog(false); };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };
    if (showPopup) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopup]);

  useEffect(() => {
    if (showPopup && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setPopupPosition({ top: rect.top, left: rect.right + 8 });
    }
  }, [showPopup]);

  const getCourseProgress = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 8, 3);
    const end = course.endsOn;
    if (!end) return 0;
    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(now, start);
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          perspective: 600,
          borderLeft: `6px solid ${course.color || "#fff"}`,
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="relative bg-zinc-800 rounded-xl p-4 h-[12.5em] w-64 cursor-pointer transition-colors overflow-visible m-2"
        onClick={() => navigate(`/courses/${course.id}`)}
      >
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {courseIconElement}
          <button
            onClick={(e) => { e.stopPropagation(); setShowPopup(prev => !prev); }}
            className="p-2 hover:bg-zinc-600/40 rounded-xl transition-colors z-50"
          >
            <MoreHorizontal size={16} className="text-white" />
          </button>
        </div>

        <div className="h-full flex flex-col">
          <div className="flex-1">
            <h3 className="font-dm font-semibold text-white text-lg mb-1 line-clamp-2">{course.title || ""}</h3>
            <p className="text-gray-300 text-sm font-semibold font-dm mb-2">{course.code || ""}</p>
            {course.type && (
              <div className="flex items-center gap-1 mb-2">
                <GraduationCap size={12} className="text-gray-500" />
                <span className="text-gray-300 text-xs font-thin font-dm">{courseTypeLabels[course.type]}</span>
              </div>
            )}
            {course.professor && <p className="text-gray-300 text-xs font-thin font-dm mb-2">Professor {course.professor}</p>}
            {course.description && <p className="text-gray-500 text-xs font-dm">{course.description}</p>}
            <div className="space-y-1 mb-2 mt-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-dm">
                <Calendar size={10} />
                {course.endsOn && !isNaN(new Date(course.endsOn).getTime())
                  ? <span>ends {format(new Date(course.endsOn), "MMM dd")}</span>
                  : <span>ends N/A</span>}
              </div>
            </div>
            <div className="mt-1">
              <div className="bg-zinc-700 h-1 rounded-full w-full">
                <div className="bg-white h-1 rounded-full" style={{ width: `${getCourseProgress()}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-dm">{getCourseProgress().toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            ref={popupRef}
            style={{ top: popupPosition.top, left: popupPosition.left, position: "absolute" }}
            className="bg-zinc-700 rounded-xl border border-zinc-600 shadow-lg overflow-visible z-50"
          >
            <button onClick={handleEdit} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-zinc-600 hover:text-white w-full text-left transition-colors">
              <Edit2 size={14} /> edit
            </button>
            <button onClick={handleArchive} className="flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-zinc-600 hover:text-yellow-300 w-full text-left transition-colors">
              <Archive size={14} /> archive
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-600 hover:text-red-300 w-full text-left transition-colors">
              <Trash2 size={14} /> delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
