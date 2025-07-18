import { Card } from "@/components/card"
import { motion } from "framer-motion"
import { useState } from "react"
import { Course } from "@/services/db"
import CourseFormModal from "./CourseFormModal"
import { deleteCourse, archiveCourse } from "@/services/core services/courseService"
import { Trash2, Archive } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu"
import { Button } from "@/components/button"

type CourseCardProps = {
  course: Course
  isSelected: boolean
  onSelect: (course: Course) => void
  onDelete: (courseId: string) => void
  onArchive: (courseId: string) => void
}

export default function CourseCard({ course, isSelected, onSelect, onDelete, onArchive }: CourseCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  const handleDelete = async () => {
    await deleteCourse(course.id)
    onDelete(course.id)
    setIsDeleteDialogOpen(false)
  }

  const handleArchive = async () => {
    await archiveCourse(course.id)
    onArchive(course.id)
    setIsArchiveDialogOpen(false)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="cursor-pointer"
        transition={{ duration: 0.2, ease: "easeInOut" }}
        whileHover={{
          scale: 1.03,
          transition: { duration: 0.15, ease: "easeInOut" }
        }}
        whileTap={{ scale: 0.98, transition: { duration: 0.1, ease: "easeInOut" } }}
          onClick={() => {
    onSelect(course);
    setIsModalOpen(true); 
    
  }}
        
         >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full hover:bg-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-zinc-900 border-zinc-700 text-white/80">
            <DropdownMenuItem 
              className="focus:bg-zinc-800 focus:text-red-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              delete
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="focus:bg-zinc-800 focus:text-yellow-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                setIsArchiveDialogOpen(true)
              }}
            >
              <Archive className="mr-2 h-4 w-4" />
              archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Card className="bg-zinc-900 border-gray-700 rounded-lg overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: course.color }} />
          <div className="p-5">
            <h3 className="font-semibold font-mp text-gray-100">{course.name}</h3>
            <p className="text-sm font-dm text-gray-400">{course.courseId}</p>
            <p className="text-xs mt-2 font-raleway text-gray-500">{course.type}</p>
          </div>
        </Card>
      </motion.div>

      <CourseFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => setIsModalOpen(false)}
        initialData={course}
      />


      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-raleway">delete course?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-300 font-raleway">
              Are you sure you want to delete "{course.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-raleway">archive?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-300">
              archive "{course.name}"? you can restore it later from the course archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}