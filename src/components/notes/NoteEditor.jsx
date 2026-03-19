import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import SlashCommand from './slashCommand';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote, Minus, Undo, Redo, Highlighter, Table as TableIcon,
} from 'lucide-react';
import './NoteEditor.css';

const ToolbarButton = ({ onClick, isActive, children, label }) => (
  <IconButton
    aria-label={label}
    size="xs"
    variant={isActive ? 'solid' : 'ghost'}
    colorScheme={isActive ? 'blue' : 'gray'}
    onClick={onClick}
    minW="28px"
    h="28px"
  >
    {children}
  </IconButton>
);

export default function NoteEditor({ content, onUpdate, editorRef }) {
  const debounceRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Image,
      SlashCommand,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const json = JSON.stringify(editor.getJSON());
        onUpdate?.(json);
      }, 500);
    },
    editorProps: {
      attributes: {
        class: 'note-editor-content',
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        if (parsed && JSON.stringify(editor.getJSON()) !== JSON.stringify(parsed)) {
          editor.commands.setContent(parsed);
        }
      } catch {
        // content may be empty string on first load
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <Box className="note-editor-wrapper">
      <Flex className="note-editor-toolbar" wrap="wrap" gap="2px" p={2} align="center">
        <ToolbarButton label="Bold" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton label="Italic" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton label="Code" isActive={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={14} />
        </ToolbarButton>
        <ToolbarButton label="Highlight" isActive={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter size={14} />
        </ToolbarButton>

        <Box w="1px" h="20px" bg="gray.600" mx={1} />

        <ToolbarButton label="Heading 1" isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton label="Heading 2" isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={14} />
        </ToolbarButton>

        <Box w="1px" h="20px" bg="gray.600" mx={1} />

        <ToolbarButton label="Bullet List" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton label="Ordered List" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton label="Task List" isActive={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <CheckSquare size={14} />
        </ToolbarButton>

        <Box w="1px" h="20px" bg="gray.600" mx={1} />

        <ToolbarButton label="Blockquote" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={14} />
        </ToolbarButton>
        <ToolbarButton label="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon size={14} />
        </ToolbarButton>

        <Box w="1px" h="20px" bg="gray.600" mx={1} />

        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={14} />
        </ToolbarButton>
      </Flex>
      <Box flex="1" minH={0} overflow="auto">
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
