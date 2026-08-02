import { useState } from "react";
import { Palette } from "lucide-react";
import { colorPalette } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";

interface ColorPickerFieldProps {
  color: string;
  setColor: (color: string) => void;
  label: string;
}

export default function ColorPickerField({ color, setColor, label }: ColorPickerFieldProps) {
  return (
    <div className="w-full sm:w-auto mt-2">
      <label className="block text-sm font-thin text-gray-400 font-mp mb-1">{label}</label>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 text-white font-dm rounded-[0.5em] hover:bg-zinc-700 transition-colors w-full sm:w-auto transition-transform duration-200 hover:scale-105 hover:shadow-m"
          >
            <Palette size={16} />
            <span
              className="w-4 h-4 rounded-xl"
              style={{ backgroundColor: color }}
            />
          </button>
        </PopoverTrigger>

<PopoverContent className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-lg w-40 p-4">
  <div className="space-y-4">
    <h3 className="text-white font-dm text-sm mb-3">choose a color</h3>
    <div className="grid grid-cols-4 gap-3">
      {colorPalette.map((paletteColor) => (
        <button
          key={paletteColor}
          onClick={() => setColor(paletteColor)}
          className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
            color === paletteColor ? "border-white ring-2 ring-white/50" : "border-gray-600"
          }`}
          style={{ backgroundColor: paletteColor }}
        />
      ))}
    </div>
    <div className="pt-2 border-t border-zinc-700">
      <label className="text-white text-xs font-dm block mb-2">custom color</label>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-full h-8 bg-transparent rounded-full border-none outline-none cursor-pointer"
      />
    </div>
  </div>
</PopoverContent>

      </Popover>
    </div>
  );
}
