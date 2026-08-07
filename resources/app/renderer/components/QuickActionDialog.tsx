import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/dialog";
import { Calendar, BookOpen, Plus, Clock, Folder, X, FolderPlus } from "react-feather";
import { motion, AnimatePresence } from "framer-motion";
import AddTaskDialog from "./Courses/addTaskDialog";
import AddExamDialog from "./Courses/AddExamDialog";
import AddCourseDialog from "./Courses/AddCourseDialog";
import AddCalendarEventDialog from "./Courses/AddCalendarEventDialog";
import { LayoutDashboard, ListTodo } from "lucide-react";

export interface QuickAddDialogProps {
  courseId?: string;
  open?: boolean;
  onClose?: () => void;
}

export default function QuickActionDialog({
  courseId,
  open,
  onClose,
}: QuickAddDialogProps) {
  const navigate = useNavigate();
  const [showTask, setShowTask] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [showCalendarEvent, setShowCalendarEvent] = useState(false);
  const [midterms, setMidterms] = useState<
    { start: Date | null; end: Date | null }[]
  >([{ start: null, end: null }]);
  const [finalExam, setFinalExam] = useState<{
    start: Date | null;
    end: Date | null;
  } | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
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
    navigate("/dashboard");
    handleClose();
  };

  const handleNavigateToCourses = () => {
    navigate("/courses");
    handleClose();
  };

  const btnClass =
    "flex items-center font-thin justify-center gap-1.5 bg-zinc-800 rounded-xl text-white font-dm h-9 text-xs cursor-pointer transition-colors duration-300 hover:bg-zinc-700 focus:ring-1 focus:ring-zinc-500 focus:ring-opacity-50 px-3 w-full";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <AnimatePresence>
        {!showTask && !showExam && !showCourse && !showCalendarEvent && (
          <DialogContent className="bg-zinc-900 rounded-xl p-4 w-[380px] border-none outline-none shadow-xl [&>button]:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between mb-3">
                <motion.h2
                  className="text-sm font-dm font-semibold text-white tracking-wide"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  quick action
                </motion.h2>

                <motion.button
                  className="text-neutral-400 transition-colors duration-300 hover:text-red-500/70 p-1 rounded-md cursor-pointer"
                  onClick={handleClose}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={16} />
                </motion.button>
              </div>

              <motion.div
                className="grid grid-cols-3 gap-2 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <motion.button
                  className={btnClass}
                  onClick={() => setShowTask(true)}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ListTodo className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">add task</span>
                </motion.button>

                <motion.button
                  className={btnClass}
                  onClick={() => setShowCalendarEvent(true)}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">add event</span>
                </motion.button>

                {!courseId && (
                  <motion.button
                    className={btnClass}
                    onClick={() => setShowCourse(true)}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">add course</span>
                  </motion.button>
                )}
              </motion.div>

              <motion.div
                className="grid grid-cols-2 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <motion.button
                  className={btnClass}
                  onClick={handleNavigateToDashboard}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">dashboard</span>
                </motion.button>

                <motion.button
                  className={btnClass}
                  onClick={handleNavigateToCourses}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Folder className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">courses</span>
                </motion.button>
              </motion.div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>

      {showTask && (
        <AddTaskDialog
          isOpen={showTask}
          onClose={handleClose}
          onTaskAdded={handleClose}
          outsideCourseOrigin={true}
          courseId={courseId || ""}
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