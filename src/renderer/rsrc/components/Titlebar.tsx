import '@/renderer/rsrc/abs.css'
import { Minus, Square, Copy, X } from 'lucide-react'

export default function TitleBar() {
  return (
<div id="titlebar" className="drag flex justify-end gap-2 p-2">
  <div id="icon-section" className="flex gap-2 ml-30 no-drag">
    <Minus color="white" size={13} />
    <X color="white" size={13} />
  </div>
</div>
  )
}
