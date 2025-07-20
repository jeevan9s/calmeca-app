import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog"
import { Input } from "@/components/input"
import { Button } from "@/components/button"
import { Calendar } from "@/components/calendar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/popover"
import { format } from "date-fns"
import { Course } from "@/services/db"
import { addCourse, updateCourse } from "@/services/core services/courseService"
import { HexColorPicker } from "react-colorful"

type CourseFormModalProps = {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Course>) => void
  initialData?: Partial<Course>
}

export default function CourseFormModal({
  open,
  onClose,
  onSave,
  initialData,
}: CourseFormModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [courseId, setCourseId] = useState("")
  const [color, setColor] = useState("#ffffff")
  const [type, setType] = useState("other")
  const [endsOn, setEndsOn] = useState<Date | undefined>()
  const [errors, setErrors] = useState<{ name?: string, courseId?: string }>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setCourseId(initialData.courseId || "")
      setDescription(initialData.description || "")
      setColor(initialData.color || "#ffffff")
      setType(initialData.type || "other")
      setEndsOn(initialData.endsOn ? new Date(initialData.endsOn) : undefined)
    } else {
      setName("")
      setCourseId("")
      setDescription("")
      setColor("#3b82f6")
      setType("other")
      setEndsOn(undefined)
    }
    setErrors({})
  }, [initialData, open])

  const validate = () => {
    const newErrors = {} as typeof errors

    if (!name.trim() && !courseId.trim()) {
      newErrors.name = "course name or code is required"
      newErrors.courseId = "course name or code is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    const courseData = {
      courseId,
      name,
      description,
      endsOn,
      type,
      color,
    }

    try {
      if (initialData?.id) {
        await updateCourse(initialData.id, {
          ...courseData,
          updatedFrom: "other",
        })
      } else {
        await addCourse(courseData as Omit<Course, "id" | "createdOn" | "archived" | "updatedOn">)
      }
      onSave(courseData)
      onClose()
    } catch (error) {
      console.error("Failed to save course:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 border border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold font-raleway">
            {initialData ? "edit course" : "new course"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm text-gray-300 font-dm">course name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="eg. Introduction to Computer Science"
              className="bg-zinc-800 text-white border-zinc-700 font-raleway"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-300 font-dm">course code</label>
            <Input
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="eg. CS-100"
              className="bg-zinc-800 text-white border-zinc-700 font-dm"
            />
            {errors.courseId && <p className="text-red-500 text-xs">{errors.courseId}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-300 font-dm">description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="short description"
              className="bg-zinc-800 text-white border-zinc-700 font-raleway"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-300 font-dm">colour</label>
            <Popover>
              <PopoverTrigger asChild>
                <div
                  className="h-10 w-full rounded-md border border-zinc-700 cursor-pointer"
                  style={{ backgroundColor: color }}
                />
              </PopoverTrigger>
<PopoverContent
  align="start"
  sideOffset={8}
  className="w-[230px] p-4 bg-zinc-800 border border-zinc-200 rounded-xl shadow-lg z-50 space-y-3"
>
  <HexColorPicker color={color} onChange={setColor} className="rounded-md" />

  <div className="flex justify-between items-center text-xs text-white font-mono">
    <span>HEX</span>
    <span>{color.toUpperCase()}</span>
  </div>

  <div className="grid grid-cols-3 gap-2 text-xs text-zinc-300 font-mono">
    {["R", "G", "B"].map((channel, i) => {
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = rgb & 255;
      const values = [r, g, b];

      return (
        <div key={channel} className="flex flex-col items-center">
          <label className="text-[10px]">{channel}</label>
          <input
            value={values[i]}
            disabled
            className="w-12 text-center py-1 border border-zinc-300 rounded bg-gray-200 text-zinc-800"
          />
        </div>
      );
    })}
  </div>
</PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-dm text-gray-300">type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 rounded-md bg-zinc-800 text-white border border-zinc-700 px-3"
            >
              <option value="lecture">lecture</option>
              <option value="project-based">project-based</option>
              <option value="tutorial">tutorial</option>
              <option value="seminar">seminar</option>
              <option value="workshop">workshop</option>
              <option value="other">other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-300">end date (optional)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-full justify-start text-left font-normal bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
                  {endsOn ? format(endsOn, "PPP") : <span className="text-zinc-400">select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border border-zinc-700">
                <Calendar
                  mode="single"
                  selected={endsOn}
                  onSelect={setEndsOn}
                  initialFocus
                  className="bg-zinc-900 font-raleway text-white/80"
                  classNames={{
                    day: "text-white/80 hover:bg-white/10 rounded-md transition-colors",
                    day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                    day_today: "border border-white/30",
                    head_cell: "text-white/60 text-xs font-normal",
                    nav_button: "text-white/80 hover:bg-white/10 rounded-md",
                    caption: "text-white/90",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {handleSave(); onClose()}}
              className="inline-block py-3 px-5 bg-zinc-800 text-sm font-semibold font-raleway text-white rounded-xl shadow-md transition-all hover:bg-white/40"
            >
              {initialData ? "update" : "create"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}