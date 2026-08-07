import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@radix-ui/react-tooltip";
import { Paperclip } from "react-feather";
import { useState } from "react";
import { extractCourseFromPDF } from "@/services/google";

interface FileUploadTooltipProps {
  setCourseData: (data: Partial<any>) => void; 
}

export default function FileUploadTooltip({ setCourseData }: FileUploadTooltipProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setPdfFile(file);
    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));
      const result = await extractCourseFromPDF(base64String);

      if (result?.success && result.course) {
        setCourseData(result.course);
      } else {
        console.error(result?.error || "Unknown error during PDF extraction");
      }
    } catch (err) {
      console.error("Error extracting course from PDF:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="flex h-6 w-6 items-center justify-center text-white hover:bg-gray-600/30 cursor-pointer rounded-full">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
            />
            {isLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Paperclip size={16} />
            )}
          </label>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="bg-zinc-800 text-white/90 rounded-xl text-xs font-dm p-2 mr-1 font-thin"
        >
          beta NLP syllabi extraction
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
