import { useState, useRef, useEffect } from "react";
import NewNoteDialog from "./NewNoteDialog";
import CourseManager from "../course_manager/CourseManager";
import FilterModal from "./NoteOptionsDialog";
import { Note, Course } from "@/services/db";
import { getAllCourses } from "@/services/core services/courseService";
import { deleteNote } from "@/services/core services/noteService";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeft,
  ChevronsRight,
  LayoutGrid,
  Plus,
  FilePlus2,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";

export default function NoteSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(180);
  const isResizing = useRef(false);

  const MIN_W = 128;
  const ABS_MIN_W = 60;
  const MAX_W = 256;

  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newW = e.clientX;
    if (newW >= MIN_W && newW <= MAX_W) {
      setWidth(newW);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleResizeClick = () => {
    setWidth(ABS_MIN_W);
  };

  const collapsed = width <= MIN_W;

  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [courseManagerOpen, setCourseManagerOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    async function loadCourses() {
      const loadedCourses = await getAllCourses();
      setCourses(loadedCourses);
    }
    loadCourses();
  }, []);

  const handleCreateNote = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <>
      <NewNoteDialog
        isOpen={newNoteOpen}
        onClose={() => setNewNoteOpen(false)}
        onCreate={handleCreateNote}
        courses={courses}
      />
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filterOptions={[]}
        sortOptions={[]}
        selectedFilters={[]}
        selectedSort={null}
        onFilterChange={() => {}}
        onSortChange={() => {}}
      />

      <CourseManager
        isOpen={courseManagerOpen}
        onClose={() => setCourseManagerOpen(false)}
        onCreate={(newCourse) => {
          setCourses((prev) => [newCourse, ...prev]);
          setCourseManagerOpen(false);
        }}
      />

      {isOpen ? (
        <motion.div
          className="relative h-screen bg-black/40 flex flex-col"
          animate={{ width }}
          initial={false}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        >
          <div className="p-2 text-white flex justify-between items-center">
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="expanded"
                  className="flex flex-col w-full"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-semibold font-raleway font-thin text-white">
                      notes
                    </span>
                    <div className="flex flex-row gap-2 justify-end items-center flex-shrink-0">
                      {[LayoutGrid, PanelLeft].map((Icon, i) => (
                        <motion.button
                          key={i}
                          onClick={() => {
      if (Icon === PanelLeft) {
        handleResizeClick();
      } else if (Icon === LayoutGrid) {
        setCourseManagerOpen(true);
      }
    }}
                          className="p-1 rounded-lg"
                          whileHover={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            scale: 1.05,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <Icon
                            className="w-4 h-4 text-white"
                            strokeWidth={1.5}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row gap-2 mt-2 justify-end">
                    {[Search, Settings2].map((Icon, i) => (
                      <motion.button
                        key={i}
                        className="p-1 rounded-lg"
                        whileHover={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          scale: 1.05,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        onClick={() =>
                          Icon === Settings2 && setFilterModalOpen(true)
                        }
                      >
                        <Icon
                          className="w-4 h-4 text-white"
                          strokeWidth={1.5}
                        />
                      </motion.button>
                    ))}
                  </div>

                  <motion.div className="flex flex-col w-full">
                    <motion.button
                      className="flex items-center justify-center gap-2 mt-3 w-full text-sm font-raleway text-white px-2 py-1 rounded-md hover:bg-white/10"
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setNewNoteOpen(true)}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                      new
                    </motion.button>

                    <div className="flex flex-col gap-2 mt-4 max-h-[50vh] overflow-y-auto">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-white/5 text-white text-sm px-3 py-2 rounded-md font-raleway truncate hover:bg-white/10 cursor-pointer flex justify-between items-center"
                        >
                          <span>{note.title}</span>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 rounded hover:bg-red-700/70"
                            aria-label="delete note"
                          >
                            <Trash2 className="w-4 h-4  hover:scale-105" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  className="flex flex-col gap-5 justify-center items-center h-full w-full"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {[
                    ChevronsRight,
                    LayoutGrid,
                    FilePlus2,
                    Search,
                    Settings2,
                  ].map((Icon, i) => (
                    <motion.button
                      key={i}
                      className="p-1 rounded-lg"
                      whileHover={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        scale: 1.05,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      onClick={() => {
                        if (Icon === ChevronsRight) setWidth(MAX_W);
                        else if (Icon === FilePlus2) setNewNoteOpen(true);
                        else if (Icon === Settings2) setFilterModalOpen(true);
                        else if (Icon === LayoutGrid) setCourseManagerOpen(true)
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.85} />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            onMouseDown={handleMouseDown}
            onClick={handleResizeClick}
            className="absolute top-0 right-0 h-full cursor-ew-resize"
            style={{
              width: "1px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
            }}
            whileHover={{
              backgroundColor: "rgba(255, 255, 255, 0.13)",
              scaleX: 1.6,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </motion.div>
      ) : (
        <motion.div
          className="h-screen bg-black/60 flex items-start"
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      )}
    </>
  );
}
