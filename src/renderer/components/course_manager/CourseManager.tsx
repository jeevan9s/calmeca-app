import { addCourse, getActiveCourses, updateCourse } from "@/services/core services/courseService"
import { Course } from "@/services/db"
import { useState, useEffect, Fragment, useCallback, useMemo } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X } from "lucide-react"
import CourseCard from "./CourseCard"
import { AddNewCourseCard } from "./NewCourseCard"
import { useLiveQuery } from "dexie-react-hooks"

export type newCourseInput = Omit<
  Course,
  "id" | "createdOn" | "archived" | "updatedOn" | "updatedFrom"
>

type courseManagerProps = {
  isOpen: boolean
  onClose: () => void
  course?: Course
}

export default function CourseManager({
  isOpen,
  onClose,
  course
}: courseManagerProps) {
  const [inputs, setInputs] = useState<newCourseInput>({
    name: "",
    courseId: "",
    type: "",
    description: "",
    endsOn: new Date(),
    color: ""
  })

  const [loading, setLoading] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [isAddNewOpen, setIsAddNewOpen] = useState(false)

  const courses = useLiveQuery(() => getActiveCourses(), [])

  const handleChange = useCallback(
    <K extends keyof newCourseInput>(field: K, value: newCourseInput[K]) => {
      setInputs(prev => ({ ...prev, [field]: value }))
    },
    []
  )

  useEffect(() => {
    if (course) setInputs(course)
    else
      setInputs({
        name: "",
        courseId: "",
        type: "",
        description: "",
        endsOn: new Date(),
        color: "#000000"
      })
  }, [course, isOpen])

  const handleSubmit = useCallback(async () => {
    if (!inputs.name.trim() && !inputs.courseId.trim()) return

    setLoading(true)
    try {
      if (course) {
        await updateCourse(course.id, { ...course, ...inputs })
      } else {
        await addCourse({
          ...inputs,
          name: inputs.name.trim(),
          description: inputs.description?.trim() || ""
        })
      }
      onClose()
    } catch (err) {
      console.error("Failed to save course:", err)
    } finally {
      setLoading(false)
    }
  }, [inputs, course, onClose])

  const handleCancel = useCallback(() => {
    setInputs({
      name: "",
      courseId: "",
      type: "",
      description: "",
      endsOn: new Date(),
      color: ""
    })
    onClose()
  }, [onClose])

  const renderedCourses = useMemo(
    () =>
      courses?.map(c => (
        <CourseCard
          key={c.id}
          course={c}
          isSelected={selectedCourseId === c.id}
          onSelect={() => setSelectedCourseId(c.id)}
        />
      )),
    [courses, selectedCourseId]
  )

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
          <div className="fixed inset-0 bg-black/80" />
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
            <Dialog.Panel className="relative w-full max-w-6xl h-[90vh] overflow-y-auto transform rounded-xl bg-neutral-900 p-10 shadow-xl">

              <button
                className="absolute top-3 right-5 text-white text-xl hover:text-white transition"
                onClick={onClose}
              >
                <X size={20} />
              </button>

              <h1 className="font-raleway font-bold font-800 text-4xl text-white mb-10">courses</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {renderedCourses}
                <AddNewCourseCard onClick={() => setIsAddNewOpen(true)} />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
