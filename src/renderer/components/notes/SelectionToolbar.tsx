import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  CodeToggle,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertAdmonition,
  InsertCodeBlock,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";

import { motion } from "framer-motion";

interface MiniToolbarProps {
  style: React.CSSProperties;
  visible: boolean;
}

export function MiniToolbar({ style, visible }: MiniToolbarProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      style={style}
      className="absolute z-50 flex items-center space-x-1 bg-gray-900 rounded-md p-1"
    >
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
    </motion.div>
  );
}
