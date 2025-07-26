import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { addNote } from "@/services/core services/noteService"
import { Course, Note } from "@/services/db"

type NewNoteProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (note: Note) => void
  courses: Course[]
}

type NewNoteInputs = {
  title: string
  description?: string
  courseId?: string
}

export default function NewNoteDialog({
  isOpen,
  onClose,
  onCreate,
  courses,
}: NewNoteProps) {
  const [inputs, setInputs] = useState<NewNoteInputs>({
    title: "",
    description: "",
    courseId: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof NewNoteInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!inputs.title.trim()) return

    setLoading(true)
    try {
      const note = await addNote({
        title: inputs.title.trim(),
        description: inputs.description?.trim(),
        courseId: inputs.courseId || undefined,
      })
      onCreate(note)
      setInputs({ title: "", description: "", courseId: "" })
      onClose()
    } catch (err) {
      console.error("Failed to add note:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setInputs({ title: "", description: "", courseId: "" })
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
<style>
{`
  input, select, textarea, button {
    -moz-box-shadow: none
  }
`}
</style>
      <Dialog as="div" className="relative z-10" onClose={handleCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-neutral-900 p-6 text-left align-middle shadow-lg transition-all">

                <div className="space-y-4">
                  <input
                    type="text"
                    value={inputs.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full bg-black/60 placeholder-white/70 px-3 py-2 rounded-md font-raleway text-sm text-white "
                    placeholder="note title"
                  />
                  <textarea
                    value={inputs.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full bg-black/60 placeholder-white/70 px-3 py-2 rounded-md font-raleway text-sm text-white "
                    placeholder="description"
                  />
                  <select
                    value={inputs.courseId || ""}
                    onChange={(e) => handleChange("courseId", e.target.value)}
                    className="w-full bg-black/60 placeholder-white/70 px-3 py-2 rounded-md font-raleway text-sm text-white
             "
                    style={{ color: "white" }}
                  >
                    <option className="bg-black/80 text-white" value="">
                      no course
                    </option>
                    {courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                        className="bg-black/80 text-white hover:bg-white/10"
                      >
                        {course.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleCancel}
                      className="font-raleway px-4 py-2 text-sm rounded-xl bg-white/10 text-white hover:bg-red-950"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="font-raleway px-4 py-2 text-sm rounded-xl bg-white/10 text-white hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      create
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
