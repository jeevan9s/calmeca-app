import { useState } from "react"
import { Card } from "@/components/card"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import CourseFormModal from "./CourseFormModal"
import { Course } from "@/services/db"

type AddNewCourseCardProps = {}

export function AddNewCourseCard({}: AddNewCourseCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.15, ease: "easeInOut" }
        }}
        whileTap={{ scale: 0.98, transition: { duration: 0.1, ease: "easeInOut" } }}
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer"
      >
        <Card className="flex flex-col items-center justify-center border-dashed border border-gray-600 bg-transparent text-gray-500 hover:text-gray-300 hover:border-gray-400 transition-all duration-200 rounded-lg p-8 group">
          <Plus size={20} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium">add course</span>
        </Card>
      </motion.div>

      <CourseFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data: Partial<Course>) => {
          // handle saving course here or lift state up
          setIsModalOpen(false)
        }}
      />
    </>
  )
}
