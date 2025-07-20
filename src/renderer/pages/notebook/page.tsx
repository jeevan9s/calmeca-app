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
import { Baseline } from "lucide-react";
import { animate, useMotionValue } from "framer-motion";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Notebook({
  value = "",
  onChange = () => {},
}: Props) {
  const { resolvedTheme } = useTheme();
  const themeExtension = resolvedTheme === "dark" ? [basicDark] : [];
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [font, setFont] = useState("font-system");
  const [color, setColor] = useState("#000000");
  const typingOpacity = useMotionValue(1);

  const fontOptions = [
    { value: "font-system", label: "system" },
    { value: "font-serif", label: "serif" },
    { value: "font-sans", label: "sans" },
    { value: "font-sans-serif", label: "sans-serif" },
    { value: "font-mono", label: "mono" },
  ];

  function applyColorToSelection(color: string) {
    document.execCommand("foreColor", false, color);
  }

  const handleChange = (value: string) => {
  onChange(value);
};




  return (
    <div className="min-h-screen w-full flex flex-col bg-natural-950">
      <Layout disableHoverZones> </Layout>
      <div className="flex flex-1 overflow-hidden">
        <NoteSidebar />
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
                  imageUploadHandler: async (image: File) => {
                    return URL.createObjectURL(image);
                  },
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
                  toolbarClassName: `flex gap-3 items-center relative ${toolbarVisible ? "bg-gray-100" : "bg-white"}`,
                  toolbarContents: () => (
                    <>
                      <motion.div
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <motion.button
                          onClick={() => setToolbarVisible((v) => !v)}
                          type="button"
                          aria-label={
                            toolbarVisible ? "hide toolbar" : "show toolbar"
                          }
                          className="px-2 py-1 rounded"
                          animate={{
                            backgroundColor: toolbarVisible
                              ? "#f3f4f6"
                              : "#ffffff",
                          }}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(229, 231, 235, 0.8)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                          }}
                        >
                          <motion.div
                            key={toolbarVisible ? "visible" : "hidden"}
                            initial={{ rotate: 0, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                          >
                            {toolbarVisible ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </motion.div>
                        </motion.button>
                      </motion.div>

                      <AnimatePresence>
                        {toolbarVisible && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex gap-2 h-8 items-center"
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
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="relative"
                              >
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <motion.div
                                      className="rounded-lg"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <Button
                                        type="button"
                                        aria-label="pick text colour"
                                        className="h-7 w-7 p-0 rounded flex items-center justify-center border border-gray-200"
                                      >
                                        <Baseline
                                          size={22}
                                          className="text-gray-700"
                                        />
                                      </Button>
                                    </motion.div>
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
                            </DiffSourceToggleWrapper>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ),
                }),
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
