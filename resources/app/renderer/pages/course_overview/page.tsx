"use client";

import { useState, useEffect } from "react";
import { Course } from "@/services/db";
import CourseCard from "@/renderer/components/Courses/CourseCard";
import AddCourseDialog from "@/renderer/components/Courses/AddCourseDialog";
import { Plus, List, Grid, BookOpen, Trash2, Edit2, Archive, ChevronRight } from "react-feather";
import Layout from "@/renderer/components/Layout";
import {
  getAllCourses,
  deleteCourse,
} from "@/services/core services/courseService";
import { Input } from "@/components/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/select";
import { toast } from "sonner";
import { dummyCourses } from "@/lib/dummy";
import { useNavigate } from "react-router-dom";

export default function CourseOverviewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null);

  const navigate = useNavigate();

  const [midterms, setMidterms] = useState<
    { start: Date | null; end: Date | null }[]
  >([]);
  const [finalExam, setFinalExam] = useState<{
    start: Date | null;
    end: Date | null;
  } | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // useEffect(() => {
  //   const loadCourses = async () => {
  //     try {
  //       const allCourses = await getAllCourses();
  //       setCourses(allCourses);
  //     } catch {
  //       toast.error("Error loading courses");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   loadCourses();
  // }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        // small delay so the skeleton state doesn't just flash
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCourses(dummyCourses);
      } catch {
        toast.error("Error loading courses");
        setCourses(dummyCourses);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse]);
    setIsDialogOpen(false);
    toast.success(`${newCourse.title} was added successfully`);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)),
    );
    setEditingCourse(null);
    setIsDialogOpen(false);
    toast.success(`${updatedCourse.title} was updated`);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setMidterms(
      course.midterms && course.midterms.length > 0
        ? course.midterms.map((mt) => ({
            start: mt.start ? new Date(mt.start) : null,
            end: mt.end ? new Date(mt.end) : null,
          }))
        : [{ start: null, end: null }],
    );

    setFinalExam(
      course.finalExamDate
        ? {
            start: new Date(course.finalExamDate),
            end: course.finalExamDate ? new Date(course.finalExamDate) : null,
          }
        : null,
    );
    setEndDate(course.endsOn ? new Date(course.endsOn) : null);
    setIsDialogOpen(true);
  };

  const requestDeleteCourse = (course: Course) => {
    setPendingDelete(course);
  };

  const confirmDeleteCourse = async () => {
    if (!pendingDelete) return;
    const course = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      toast.success(`${course.title} was deleted`);
    } catch {
      toast.error("Error deleting course");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCourse(null);
    setMidterms([]);
    setFinalExam(null);
    setEndDate(null);
  };

  const handleAddCourseClick = () => {
    setEditingCourse(null);
    setMidterms([{ start: null, end: null }]);
    setFinalExam(null);
    setEndDate(null);
    setIsDialogOpen(true);
  };

  const filteredCourses = courses
    .filter(
      (c) =>
        c.title &&
        c.title.trim() !== "" &&
        c.code &&
        c.code.trim() !== "" &&
        c.title.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (sort === "newest")
        return (
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
        );
      if (sort === "oldest")
        return (
          new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
        );
      return 0;
    });

  const btnClass =
    "flex items-center justify-center gap-2 bg-zinc-800 rounded-xl text-white font-dm h-10 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 active:scale-95 px-3 cursor-pointer";

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-zinc-950/70 text-white">
        <Layout>
          <div className="px-4 flex flex-col gap-y-1 mb-3">
            <h1 className="font-nun font-bold text-2xl sm:text-3xl lg:text-4xl">
              course overview
            </h1>
            <h2 className="font-dm text-neutral-400 text-sm">
              view, edit, & add courses
            </h2>
          </div>
          <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-zinc-800/60 animate-pulse border border-zinc-800"
              />
            ))}
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white">
      <Layout>
        <div className="px-4 flex flex-col gap-y-1 mb-5">
          <h1 className="font-dm font-bold text-2xl sm:text-3xl lg:text-4xl">
            courses overview
          </h1>
          <h2 className="font-dm text-neutral-400 text-sm">
            view, edit, & add courses
          </h2>
        </div>

        <div className="px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Input
              placeholder="search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-zinc-800 rounded-xl text-white font-dm h-10 border-none outline-none focus:ring-2 focus:ring-zinc-500 px-3"
              aria-label="Search courses"
            />

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                className={`${btnClass} w-full sm:w-40 border-none bg-zinc-800 rounded-xl font-dm text-white hover:bg-zinc-700`}
                aria-label="Sort courses"
              >
                <SelectValue placeholder="sort by" />
              </SelectTrigger>
              <SelectContent className="border-none rounded-xl mt-2 bg-zinc-900 text-white border-zinc-700 shadow-xl">
                <SelectItem value="alpha" className="focus:bg-zinc-800 focus:text-white cursor-pointer rounded-xl">
                  alphabetical
                </SelectItem>
                <SelectItem value="newest" className="focus:bg-zinc-800 focus:text-white cursor-pointer rounded-xl">
                  newest
                </SelectItem>
                <SelectItem value="oldest" className="focus:bg-zinc-800 focus:text-white cursor-pointer rounded-xl">
                  oldest
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <button
              onClick={handleAddCourseClick}
              className={`${btnClass} px-5 bg-zinc-800 hover:bg-zinc-700 text-sm`}
            >
              <Plus size={16} /> add course
            </button>

            <div className="flex items-center gap-1.5 bg-zinc-950/40 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${viewMode === "grid" ? "bg-zinc-800 text-white shadow" : "text-neutral-400 hover:text-white"}`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${viewMode === "list" ? "bg-zinc-800 text-white shadow" : "text-neutral-400 hover:text-white"}`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="px-4 flex flex-col items-center justify-center mt-16 mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-neutral-400" />
            </div>
            {courses.length === 0 ? (
              <>
                <p className="font-nun font-semibold text-lg text-white mb-1">
                  no courses yet
                </p>
                <p className="text-neutral-400 text-sm mb-5 max-w-xs">
                  add your first course to start tracking assignments, exams, and deadlines
                </p>
                <button
                  onClick={handleAddCourseClick}
                  className={`${btnClass} px-5 bg-zinc-800 hover:bg-zinc-700 text-sm`}
                >
                  <Plus size={16} /> add course
                </button>
              </>
            ) : (
              <>
                <p className="font-nun font-semibold text-lg text-white mb-1">
                  no matches found
                </p>
                <p className="text-neutral-400 text-sm">
                  try a different search term
                </p>
              </>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 auto-rows-min">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={() => requestDeleteCourse(course)}
                onArchive={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 flex flex-col gap-2">
            {filteredCourses.map((course) => {
              const initials = course.code
                .replace(/[^A-Za-z0-9]/g, "")
                .slice(0, 3)
                .toUpperCase();

              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="group flex items-center gap-4 px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
                    <span className="font-nun font-semibold font-mp text-xs text-neutral-300">
                      {initials || "?"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <p className="font-medium font-mp text-white truncate">
                      {course.title}
                    </p>
                    <span className="hidden sm:inline text-zinc-700">·</span>
                    <p className="text-neutral-400 font-mp text-sm shrink-0">
                      {course.code}
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEditCourse(course)}
                      aria-label={`Edit ${course.title}`}
                      title="Edit"
                      className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {}}
                      aria-label={`Archive ${course.title}`}
                      title="Archive"
                      className="p-2 rounded-lg text-neutral-400 hover:text-yellow-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <Archive size={15} />
                    </button>
                    <button
                      onClick={() => requestDeleteCourse(course)}
                      aria-label={`Delete ${course.title}`}
                      title="Delete"
                      className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <ChevronRight
                    size={16}
                    className="hidden sm:block shrink-0 text-zinc-700 group-hover:text-zinc-500 transition-colors"
                  />
                </div>
              );
            })}
          </div>
        )}

        <AddCourseDialog
          isOpen={isDialogOpen}
          onAddCourse={handleAddCourse}
          onUpdateCourse={handleUpdateCourse}
          onClose={handleCloseDialog}
          existingCourse={editingCourse}
          midterms={midterms}
          setMidterms={setMidterms}
          finalExam={finalExam}
          setFinalExam={setFinalExam}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        {pendingDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setPendingDelete(null)}
          >
            <div
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <p className="font-nun font-semibold text-white text-lg mb-1">
                delete {pendingDelete.title}?
              </p>
              <p className="text-neutral-400 text-sm mb-5">
                this can't be undone. all associated assignments and dates will be removed.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPendingDelete(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  cancel
                </button>
                <button
                  onClick={confirmDeleteCourse}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
}