"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import QuickActionDialog from "./QuickActionDialog";

export interface FloatingActionButtonProps {
  courseId?: string;
}

export default function FloatingActionButton({ courseId }: FloatingActionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-black shadow-lg cursor-pointer"
      >
        <Plus className="h-6 w-6 text-black" strokeWidth={2.5} />
      </motion.button>

      <QuickActionDialog open={open} onClose={() => setOpen(false)} courseId={courseId} />
    </>
  );
}