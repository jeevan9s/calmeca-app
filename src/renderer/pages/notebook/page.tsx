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
import Layout from "@/renderer/components/Layout";
import NoteSidebar from "@/renderer/components/notes/NoteSidebar";
import { Eye } from "react-feather";
import { exportType, exportResponse } from "@/services/db";
import ExportDialog from "@/renderer/components/notes/ExportDialog";
import { Baseline, Save } from "lucide-react";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Notebook({ value = "", onChange = () => {} }: Props) {
  const { resolvedTheme } = useTheme();
  const themeExtension = resolvedTheme === "dark" ? [basicDark] : [];
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

  const isMobile = windowWidth < 768;

 return (
  <div className="min-h-screen w-full flex flex-col bg-natural-950">
    <Layout disableHoverZones> </Layout>
    <div className="flex flex-1 overflow-hidden">
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
      <div className="flex-1 overflow-auto p-4">
        <div className="h-full border border-gray-200 overflow-auto bg-white">
          <MDXEditor
            markdown={value}
            onChange={handleChange}
            contentEditableClassName={`max-w-none p-6 prose ${font}`}
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
                toolbarClassName: `flex flex-wrap items-center relative gap-2 px-2 py-1 ${
                  toolbarVisible ? "bg-gray-100" : "bg-white"
                }`,
toolbarContents: () => (
  <div className="flex items-center flex-wrap gap-2 w-full overflow-x-auto px-2 py-1">
<motion.div whileHover={{ scale: 1.05 }}>
  <Button
    type="button"
    aria-label={toolbarVisible ? "hide toolbar" : "show toolbar"}
    className="h-7 w-7 p-0 rounded flex items-center justify-center border border-gray-200"
    onClick={() => setToolbarVisible((v) => !v)}
  >
    <div className="h-[18px] flex items-center justify-center">
      {toolbarVisible ? <EyeOff size={18} /> : <Eye size={18} />}
    </div>
  </Button>
</motion.div>

    <AnimatePresence initial={false}>
      {toolbarVisible && (
        <motion.div
          key="toolbar"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <DiffSourceToggleWrapper>
            <motion.div whileHover={{ scale: 1.05 }}>
              <UndoRedo />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <BoldItalicUnderlineToggles />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <StrikeThroughSupSubToggles />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              {/* ... your color popover ... */}
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <CodeToggle />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <ListsToggle />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <BlockTypeSelect />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Select
                value={font}
                items={fontOptions}
                placeholder="Select font"
                triggerTitle="Font"
                onChange={(value) => setFont(value)}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <CreateLink />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <InsertImage />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <InsertTable />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <InsertThematicBreak />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <InsertAdmonition />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <InsertCodeBlock />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                type="button"
                aria-label="export"
                className="h-7 w-7 p-0 rounded flex cursor-pointer items-center justify-center border border-gray-200"
                onClick={openDialog}
              >
                <Save size={22} className="text-gray-200" />
              </Button>
            </motion.div>
          </DiffSourceToggleWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)


              }),
            ]}
          />
        </div>
      </div>
    </div>
  </div>
)
}
