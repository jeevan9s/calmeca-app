"use client";

import { motion } from "framer-motion";
import { Plus } from "react-feather";
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
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        whileHover={{
          scale: 1.1,
          rotate: 5,
          boxShadow: "0 10px 25px rgba(255, 255, 255, 0.2)",
        }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white/80 text-black shadow-lg hover:bg-white hover:text-black flex items-center justify-center transition-all"
        onClick={() => setOpen(true)}
      >
        <motion.div animate={{ rotate: 0 }} whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
          <Plus className="w-6 h-6 text-black" />
        </motion.div>
      </motion.button>
      <QuickActionDialog open={open} onClose={() => setOpen(false)} courseId={courseId} />
    </>
  );
}
