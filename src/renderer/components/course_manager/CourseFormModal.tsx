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
import { ChromePicker } from "react-color"

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
  const [color, setColor] = useState("#ffffff")
  const [type, setType] = useState("other")
  const [endsOn, setEndsOn] = useState<Date | undefined>()

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setDescription(initialData.description || "")
      setColor(initialData.color || "#ffffff")
      setType(initialData.type || "other")
      setEndsOn(initialData.endsOn)
    } else {
      setName("")
      setDescription("")
      setColor("#3b82f6")
      setType("other")
      setEndsOn(undefined)
    }
  }, [initialData, open])

  const handleSave = async () => {
    if (!name || !type || !endsOn) return

    const baseData = {
      courseId: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      description,
      endsOn,
      type,
      color,
    }

    if (initialData?.id) {
      await updateCourse(initialData.id, {
        ...baseData,
        updatedFrom: "other",
      })
    } else {
      await addCourse(baseData)
    }

    onClose()
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
              <PopoverContent className="p-2 bg-zinc-900 border border-zinc-700">
                <ChromePicker
                  color={color}
                  onChange={(updated) => setColor(updated.hex)}
                  disableAlpha
                />
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
              <option>lecture</option>
              <option>project-based</option>
              <option>tutorial</option>
              <option>seminar</option>
              <option>workshop</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-300">end date</label>
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
      onSelect={(date) => {
        setEndsOn(date);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      }}
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
              onClick={handleSave}
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
