// composable accessible course manager page
import { addCourse, getActiveCourses } from "@/services/core services/courseService"
import { Course } from "@/services/db"
import { useState, useEffect, Fragment, useCallback } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X } from "lucide-react"
import CourseCard from "./CourseCard"
import { AddNewCourseCard } from "./NewCourseCard"

export type newCourseInput = Omit<
  Course,
  "id" | "createdOn" | "archived" | "updatedOn" | "updatedFrom"
>
type courseManagerProps = {
  isOpen: boolean
  onClose: () => void
  course?: Course
  onCreate: (course: Course) => void
}

export default function CourseManager({
  isOpen,
  onClose,
  course,
  onCreate,
}: courseManagerProps) {
  console.log("hello")
  const [inputs, setInputs] = useState<newCourseInput>({
    name: "",
    courseId: "",
    type: "",
    description: "",
    endsOn: new Date(),
    color: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = <K extends keyof newCourseInput>(
    field: K,
    value: newCourseInput[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (course) setInputs(course)
    else
      setInputs({
        name: "",
        courseId: "",
        type: "",
        description: "",
        endsOn: new Date(),
        color: "#000000",
      })
  }, [course, isOpen])

  const handleSubmit = async () => {
    if (!inputs.name.trim()) return

    setLoading(true)
    try {
      const course = await addCourse({
        ...inputs,
        name: inputs.name.trim(),
        description: inputs.description?.trim() || "",
      })
      onCreate(course)
      setInputs({
        name: "",
        description: "",
        courseId: "",
        type: "",
        endsOn: new Date(),
        color: "",
      })
      onClose()
    } catch (err) {
      console.error("Failed to add course:", err)
    } finally {
      setLoading(false)
    }
  }

    const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isAddNewOpen, setIsAddNewOpen] = useState(false)

  
  useEffect(() => {
    if (isOpen) {
      getActiveCourses().then(setCourses)
    }
  }, [isOpen])

  const handleAddCourse = useCallback(
    (newCourse: Course) => {
      setCourses((prev) => [...prev, newCourse])
      setSelectedCourse(newCourse)
      setIsAddNewOpen(false)
      onCreate(newCourse)
    },
    [onCreate]
  )

  const handleCancel = () => {
    setInputs({
      name: "",
      description: "",
      courseId: "",
      type: "",
      endsOn: new Date(),
      color: "",
    })
    onClose()
  }

  

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-200 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition-transform duration-150 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative w-full max-w-6xl h-[90vh] overflow-y-auto transform rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 p-10 shadow-xl">
              <button
                className="absolute top-3 right-5 text-white text-xl hover:text-red-800 transition"
                onClick={onClose}
              >
                <X size={20} />
              </button>

              <h1 className="font-raleway font-bold font-800 text-4xl text-white mb-10">courses</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {courses.map((c) => (
    <CourseCard
      key={c.id}
      course={c}
      isSelected={selectedCourse?.id === c.id}
      onSelect={setSelectedCourse}
    />
  ))}
  <AddNewCourseCard onClick={() => setIsAddNewOpen(true)} />
</div>


              

              
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
