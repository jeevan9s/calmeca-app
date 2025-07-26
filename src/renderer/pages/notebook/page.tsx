"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertAdmonition,
  CodeToggle,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  StrikeThroughSupSubToggles,
  Select,
  Button,
} from "@mdxeditor/editor";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/popover";
import { HexColorPicker } from "react-colorful";

import { useState, useEffect } from "react";
import { basicDark } from "cm6-theme-basic-dark";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { EyeOff } from "lucide-react";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { useTheme } from "next-themes";
import "@mdxeditor/editor/style.css";
import "@/renderer/styles/notes.css";
import Layout from "@/renderer/components/Layout";
import NoteSidebar from "@/renderer/components/notes/NoteSidebar";
import { Eye } from "react-feather";
import { exportType, exportResponse } from "@/services/db";
import ExportDialog from "@/renderer/components/notes/ExportDialog";
import { Baseline, Save, SunMoon } from "lucide-react";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Notebook({ value = "", onChange = () => {} }: Props) {
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(true);
  const themeExtension = isDark ? [basicDark] : [];
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [font, setFont] = useState("font-system");
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState("#000000");
  const [text, setText] = useState(value);

  const fontOptions = [
    { value: "font-system", label: "system" },
    { value: "font-serif", label: "serif" },
    { value: "font-sans", label: "sans" },
    { value: "font-sans-serif", label: "sans-serif" },
    { value: "font-mono", label: "mono" },
  ];

  const editorContentClass = `w-full h-full max-w-none p-6 prose ${font} ${
    isDark ? "dark bg-neutral-900 text-white" : "bg-white text-black"
  }`;

  const [exportType, setExportType] = useState<exportType>("pdf");
  const [filename, setFilename] = useState("untitled");
  const [isExporting, setIsExporting] = useState(false);

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const openDialog = () => setIsExportDialogOpen(true);
  const closeDialog = () => setIsExportDialogOpen(false);

  const handleChange = (value: string) => {
    onChange(value);
    setText(value);
  };

  const handleNoteExport = async () => {
    if (!text.trim()) {
      alert("Enter some content to export.");
      return;
    }
    if (!filename.trim()) {
      alert("Enter a filename.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const res: exportResponse = await window.electronAPI.gTextExport(
        text,
        filename,
        exportType
      );
      if (res.success) {
        alert(`File uploaded successfully!\n${res.driveUrl}`);
      } else {
        alert(`Failed to export file: ${res.error || "Unknown error"}`);
        setError(res.error || "Export failed");
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed unexpectedly");
      setError("Export failed unexpectedly");
    } finally {
      setIsExporting(false);
    }
  };

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth < 1500) {
      setToolbarVisible(false);
    } else {
      setToolbarVisible(true);
    }
  }, [windowWidth]);

return (
  <div className={`h-screen w-full flex flex-col ${isDark ? "dark bg-neutral-950" : "bg-white"}`}>
    <Layout disableHoverZones />
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
      <NoteSidebar />
      <ExportDialog
        isOpen={isExportDialogOpen}
        content={text}
        filename={filename}
        exportType={exportType}
        isExporting={isExporting}
        onFilenameChange={setFilename}
        onTypeChange={setExportType}
        onClose={closeDialog}
        onConfirm={handleNoteExport}
      />
      <div className=" rounded-none flex-1 flex flex-col overflow-hidden">
        <div className={`rounded-none flex-1 border overflow-hidden ${
          isDark ? " bg-neutral-900 rounded-none border-none" : "rounded-none border-none bg-white"
        }`}>
          <MDXEditor
            markdown={value}
            onChange={handleChange}
            contentEditableClassName={editorContentClass}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              tablePlugin(),
              imagePlugin({
                imageUploadHandler: async (image: File) =>
                  URL.createObjectURL(image),
              }),
              linkPlugin(),
              linkDialogPlugin(),
              codeBlockPlugin({ defaultCodeBlockLanguage: "plaintext" }),
              codeMirrorPlugin({
                codeBlockLanguages: {
                  plaintext: "Plain Text",
                  javascript: "JavaScript",
                  typescript: "TypeScript",
                  jsx: "JSX",
                  tsx: "TSX",
                  css: "CSS",
                  html: "HTML",
                  json: "JSON",
                  markdown: "Markdown",
                  python: "Python",
                  bash: "Bash",
                  sql: "SQL",
                },
                codeMirrorExtensions: [
                  ...themeExtension,
                  javascript(),
                  html(),
                  css(),
                  json(),
                  markdown(),
                  python(),
                  sql(),
                ],
              }),
              directivesPlugin({
                directiveDescriptors: [AdmonitionDirectiveDescriptor],
              }),
              diffSourcePlugin({ viewMode: "rich-text" }),
              toolbarPlugin({
                toolbarClassName: `rounded-none w-full flex items-center relative font-dm text-black font-thin gap-1 px-1 py-0.5 ${
                  isDark ? "bg-neutral-800 border-none" : "bg-r-gray00 border-gray-300"
                } h-[40px] border-b`,
                toolbarContents: () => (
                  <div className="w-full flex items-center h-full">
                    <div className="scale-[0.85] mb-1 origin-left flex items-center gap-2 h-full">
                      {window.innerWidth >= 1500 && (
                        <motion.button
                          onClick={() => setToolbarVisible((v) => !v)}
                          type="button"
                          aria-label={toolbarVisible ? "hide toolbar" : "show toolbar"}
                          className={`h-6 w-6 p-0 rounded flex items-center justify-center ${
                            isDark ? "hover:bg-neutral-700" : "hover:bg-gray-200"
                          }`}
                          animate={{ backgroundColor: "transparent" }}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: isDark
                              ? "rgba(64, 64, 64, 0.5)"
                              : "rgba(229, 231, 235, 0.8)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                          }}
                        >
                          {toolbarVisible ? (
                            <EyeOff size={16} className={isDark ? "text-gray-300" : "text-gray-600"} />
                          ) : (
                            <Eye size={16} className={isDark ? "text-gray-300" : "text-gray-600"} />
                          )}
                        </motion.button>
                      )}
                      <AnimatePresence>
                        {toolbarVisible && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="flex items-center gap-1"
                          >
                            <motion.button
                              type="button"
                              onClick={() => setIsDark(!isDark)}
                              className={`h-6 w-6 p-0 rounded flex items-center justify-center border ${
                                isDark ? "border-neutral-600" : "border-gray-200"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <SunMoon strokeWidth={1.5} className={isDark ? "text-gray-300" : "text-gray-600"} />
                            </motion.button>
                            <UndoRedo />
                            <BoldItalicUnderlineToggles />
                            <StrikeThroughSupSubToggles />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  aria-label="pick text colour"
                                  className={`h-6 w-6 p-0 rounded flex items-center justify-center border ${
                                    isDark ? "border-neutral-600" : "border-gray-200"
                                  }`}
                                >
                                  <Baseline size={16} className={isDark ? "text-gray-300" : "text-gray-600"} />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                sideOffset={8}
                                className={`w-[230px] p-4 rounded-xl shadow-lg z-50 space-y-3 ${
                                  isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-gray-200"
                                }`}
                              >
                                <HexColorPicker color={color} onChange={setColor} className="rounded-md" />
                                <div className={`flex justify-between items-center text-xs font-mono ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  <span>HEX</span><span>{color.toUpperCase()}</span>
                                </div>
                                <div className={`grid grid-cols-3 gap-2 text-xs font-mono ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}>
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
                                          className={`w-10 text-center py-0.5 border rounded ${
                                            isDark ? "border-neutral-600 bg-neutral-700 text-gray-300" : "border-gray-300 bg-gray-100 text-gray-800"
                                          }`}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                            <CodeToggle />
                            <ListsToggle />
                            <BlockTypeSelect />
                            <Select
                              value={font}
                              items={fontOptions}
                              placeholder="Select font"
                              triggerTitle="Font"
                              onChange={(value) => setFont(value)}
                            />
                            <CreateLink />
                            <InsertImage />
                            <InsertTable />
                            <InsertThematicBreak />
                            <InsertCodeBlock />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="ml-auto flex items-center gap-1 absolute right-2">
                      <Button
                        type="button"
                        aria-label="export"
                        className={`h-6 w-6 p-0 rounded flex items-center justify-center border ${
                          isDark ? "border-neutral-600" : "border-gray-200"
                        }`}
                        onClick={openDialog}
                      >
                        <Save size={16} className={isDark ? "text-gray-300" : "text-gray-600"} />
                      </Button>
                      <DiffSourceToggleWrapper />
                    </div>
                  </div>
                ),
              }),
            ]}
          />
        </div>
      </div>
    </div>
  </div>
)

}
