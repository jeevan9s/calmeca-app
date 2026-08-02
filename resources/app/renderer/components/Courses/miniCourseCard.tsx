"use client";

import { Course } from "@/services/db";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { useNavigate } from "react-router-dom";


interface MiniCourseCardProps {
  name: string;
  code: string;
  color: string;
  course: Course;
}

export default function MiniCourseCard({ name, code, color, course }: MiniCourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 18, mass: 0.9 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [-80, 80], [20, -20]);
  const rotateY = useTransform(springX, [-80, 80], [-20, 20]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    x.set(offsetX);
    y.set(offsetY);
  }

    const navigate = useNavigate();
  

  const iconName =
    typeof course.icon === "string"
      ? course.icon.charAt(0).toUpperCase() + course.icon.slice(1)
      : null;
  const IconComponent = iconName ? LucideIcons[iconName as keyof typeof LucideIcons] : null;

  return (
    <motion.div
      className="relative w-36 h-40 rounded-2xl p-3 flex flex-col items-start justify-between border border-zinc-700/40 shadow-[0_3px_15px_rgba(0,0,0,0.4)] cursor-pointer select-none"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 600,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/courses/${course.id}`)}
    >

<div className="flex flex-row gap-2 absolute top-2 left-2">
  <div
    className="w-4 h-4 rounded-full bg-transparent"
    style={{
      backgroundColor: color,
      boxShadow: hovered ? `0 0 12px ${color}80` : `0 0 4px ${color}40`,
    }}
  />
  {IconComponent && (
    <IconComponent size={16} className="text-white" />
  )}
</div>


      <div className="flex flex-col mt-auto" style={{ transform: "translateZ(40px)" }}>
        <p className="text-[10px] tracking-wide font-light text-neutral-400 uppercase font-dm truncate">
          {name}
        </p>
        <p className="text-xl text-white mt-1 font-nun tracking-tight truncate">
          {code}
        </p>
      </div>
    </motion.div>
  );
}
