"use client";

import React from "react";
import {
  MDXEditor,
  headingsPlugin,
  StrikeThroughSupSubTogglesProps,
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
} from "@mdxeditor/editor";

import { basicDark } from "cm6-theme-basic-dark";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { useTheme } from "next-themes";
import "@mdxeditor/editor/style.css";
import Layout from "@/renderer/components/Layout";
import NoteSidebar from "@/renderer/components/notes/NoteSidebar";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Notebook({
  value = "# Welcome\n\n- Sample content\n~~strikethrough~~\n^superscript^\n~subscript~",
  onChange = () => {},
}: Props) {
  const { resolvedTheme } = useTheme();
  const themeExtension = resolvedTheme === "dark" ? [basicDark] : [];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <Layout disableHoverZones > </Layout>
      <div className="flex flex-1 overflow-hidden">
        <NoteSidebar />
        <div className="flex-1 overflow-auto p-4">
          <div className="h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <MDXEditor
              markdown={value}
              onChange={onChange}
              contentEditableClassName="prose max-w-none p-6 dark:text-gray-200"
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
                  toolbarContents: () => (
                    <DiffSourceToggleWrapper>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <StrikeThroughSupSubToggles />
                      <CodeToggle />
                      <ListsToggle />
                      <BlockTypeSelect />
                      <CreateLink />
                      <InsertImage />
                      <InsertTable />
                      <InsertThematicBreak />
                      <InsertAdmonition />
                      <InsertCodeBlock />
                    </DiffSourceToggleWrapper>
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