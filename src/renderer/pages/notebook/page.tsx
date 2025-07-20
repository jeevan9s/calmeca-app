import { useState } from "react";
import NoteSidebar from "@/renderer/components/notes/NoteSidebar";
import Layout from "../../components/Layout";
import "@mdxeditor/editor/style.css";
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
  InsertCodeBlock
} from '@mdxeditor/editor';

interface NoteEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

export default function Notebook({ 
  content = '# Start writing your note here...\n\nThis is a basic example.', 
  onChange = () => {} 
}: NoteEditorProps) {
  const [editorKey, setEditorKey] = useState(0); 

  return (
    <div id="notebook-page" className="min-h-screen bg-black/30 text-white flex flex-col">
      <Layout />
      <div className="flex flex-1">
        <NoteSidebar />
        <div className="flex-1 p-4">
          <div 
            className="h-full border border-gray-700 rounded-lg overflow-hidden"
            key={editorKey} 
          >
            <MDXEditor
              markdown={content}
              onChange={onChange}
              contentEditableClassName="prose max-w-none text-gray-200 bg-gray-900 p-4"
              className="bg-gray-800"
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
                  }
                }),
                linkPlugin(),
                linkDialogPlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
                codeMirrorPlugin({ 
                  codeBlockLanguages: { 
                    js: 'JavaScript',
                    py: 'Python', 
                    css: 'CSS', 
                    txt: 'Plain Text', 
                    ts: 'TypeScript',
                    md: 'Markdown'
                  } 
                }),
                directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
                diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
                toolbarPlugin({
                  toolbarContents: () => (
                    <DiffSourceToggleWrapper>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <ListsToggle />
                      <BlockTypeSelect />
                      <CodeToggle />
                      <CreateLink />
                      <InsertImage />
                      <InsertTable />
                      <InsertThematicBreak />
                      <InsertAdmonition />
                      <InsertCodeBlock />
                    </DiffSourceToggleWrapper>
                  )
                })
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}