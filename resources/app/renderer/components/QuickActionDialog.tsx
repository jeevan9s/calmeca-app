
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/dialog";
import { Calendar, BookOpen, Plus, Clock } from "react-feather";
import { motion, AnimatePresence } from "framer-motion";
import AddTaskDialog from "./Courses/addTaskDialog";
import AddExamDialog from "./Courses/AddExamDialog";
import AddCourseDialog from "./Courses/AddCourseDialog";
import AddCalendarEventDialog from "./Courses/AddCalendarEventDialog";

export interface QuickAddDialogProps {
  courseId?: string;
  open?: boolean;
  onClose?: () => void;
}

export default function QuickActionDialog({ courseId, open, onClose }: QuickAddDialogProps) {
  const navigate = useNavigate();
  const [showTask, setShowTask] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [showCalendarEvent, setShowCalendarEvent] = useState(false);
  const [midterms, setMidterms] = useState<{ start: Date | null; end: Date | null }[]>([{ start: null, end: null }]);
  const [finalExam, setFinalExam] = useState<{ start: Date | null; end: Date | null } | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  React.useEffect(() => {
    if (!open) {
      setShowTask(false);
      setShowExam(false);
      setShowCourse(false);
      setShowCalendarEvent(false);
    }
  }, [open]);

  const handleClose = () => {
    setShowTask(false);
    setShowExam(false);
    setShowCourse(false);
    setShowCalendarEvent(false);
    onClose?.();
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
    handleClose();
  };

  const btnClass = "flex items-center font-thin gap-2 bg-zinc-800 rounded-xl text-white font-dm h-10 focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 px-2"

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <AnimatePresence>
        {!showTask && !showExam && !showCourse && !showCalendarEvent && (
          <DialogContent className="bg-zinc-900 rounded-xl p-6 min-w-[380px] border-none outline-none shadow-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.h2 
                className="text-lg mb-4 font-nun font-semibold text-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                quick action
              </motion.h2>
              
              <motion.div 
                className="grid grid-cols-2 gap-3 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <motion.button 
                  className={`${btnClass} justify-center`} 
                  onClick={() => setShowTask(true)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.05, 
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                  add task
                </motion.button>
                
                <motion.button 
                  className={`${btnClass} justify-center`} 
                  onClick={() => setShowExam(true)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.05, 
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Clock className="w-4 h-4" />
                  </motion.div>
                  add exam
                </motion.button>
                
                <motion.button 
                  className={`${btnClass} justify-center`} 
                  onClick={() => setShowCalendarEvent(true)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.05, 
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Calendar className="w-4 h-4" />
                  </motion.div>
                  add event
                </motion.button>
                
                <motion.button 
                  className={`${btnClass} justify-center`} 
                  onClick={handleNavigateToDashboard}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.05, 
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookOpen className="w-4 h-4" />
                  </motion.div>
                  dashboard
                </motion.button>
              </motion.div>
              
              {!courseId && (
                <motion.button 
                  className={`${btnClass} w-full justify-center mb-3`} 
                  onClick={() => setShowCourse(true)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.02, 
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                  add course
                </motion.button>
              )}
              
              <motion.button 
                className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors" 
                onClick={handleClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>

      {showTask && (
        <AddTaskDialog
          isOpen={showTask}
          onClose={handleClose}
          onTaskAdded={handleClose}
          courseId={courseId || ""}
        />
      )}

      {showExam && courseId && (
        <AddExamDialog
          isOpen={showExam}
          onClose={handleClose}
          existingCourse={{
            id: courseId,
            title: "",
            code: "",
            professor: "",
            createdOn: new Date(),
            updatedOn: new Date(),
            endsOn: new Date(),
          }}
          midterms={midterms}
          setMidterms={setMidterms}
          finalExam={finalExam}
          setFinalExam={setFinalExam}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      )}

      {showCourse && !courseId && (
        <AddCourseDialog
          isOpen={showCourse}
          onClose={handleClose}
          midterms={midterms}
          setMidterms={setMidterms}
          finalExam={finalExam}
          setFinalExam={setFinalExam}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      )}

      {showCalendarEvent && (
        <AddCalendarEventDialog
          isOpen={showCalendarEvent}
          onClose={handleClose}
          onEventAdded={handleClose}
        />
      )}
    </Dialog>
  );
}
