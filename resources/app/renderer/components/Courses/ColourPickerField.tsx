import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  const handleSelectColor = (selectedColor: string) => {
    setColor(selectedColor);
    setOpen(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm text-gray-400 mb-1 font-mp">{label}</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Select color, current is ${color}`}
            className="group flex items-center justify-between px-3.5 h-10 bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 font-dm rounded-xl hover:border-zinc-600 focus:ring-1 focus:ring-zinc-600 focus:outline-none transition-all duration-150 w-full cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full border border-zinc-700 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider">{color}</span>
            </div>
            <span className="text-xs text-zinc-500 font-mp">change</span>
          </button>
        </PopoverTrigger>

        <PopoverContent className="bg-zinc-800/50 border-zinc-700/50backdrop-blur-md rounded-xl shadow-2xl w-48 p-3.5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-dm tracking-wide">Palette</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{color}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {colorPalette.map((paletteColor) => {
                const isSelected = color.toLowerCase() === paletteColor.toLowerCase();
                return (
                  <button
                    key={paletteColor}
                    type="button"
                    aria-label={`Choose color ${paletteColor}`}
                    onClick={() => handleSelectColor(paletteColor)}
                    className={`w-9 h-9 bg-zinc-800/50 border-zinc-700/50 rounded-lg transition-transform hover:scale-105 active:scale-95 relative flex items-center justify-center cursor-pointer ${
                      isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : ""
                    }`}
                    style={{ backgroundColor: paletteColor }}
                  />
                );
              })}
            </div>

            <div className="pt-2 bg-zinc-800/50 border-zinc-700/50 flex items-center justify-between gap-2">
              <label htmlFor="custom-color-input" className="text-zinc-400 text-xs font-dm cursor-pointer">
                Custom
              </label>
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-zinc-700 cursor-pointer">
                <input
                  id="custom-color-input"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute -inset-2 w-10 h-10 cursor-pointer border-0 bg-zinc-800/50 border-zinc-700/50 p-0"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}