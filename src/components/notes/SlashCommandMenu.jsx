import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';

const MENU_ITEMS = [
  {
    category: 'Text',
    items: [
      { title: 'Paragraph', description: 'Plain text block', icon: '¶', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setParagraph().run(); } },
      { title: 'Heading 1', description: 'Large heading', icon: 'H1', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(); } },
      { title: 'Heading 2', description: 'Medium heading', icon: 'H2', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(); } },
      { title: 'Heading 3', description: 'Small heading', icon: 'H3', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(); } },
    ],
  },
  {
    category: 'Lists',
    items: [
      { title: 'Bullet List', description: 'Unordered list', icon: '•', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleBulletList().run(); } },
      { title: 'Numbered List', description: 'Ordered list', icon: '1.', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleOrderedList().run(); } },
      { title: 'To-Do List', description: 'Task checklist', icon: '☑', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).toggleTaskList().run(); } },
    ],
  },
  {
    category: 'Basic Blocks',
    items: [
      { title: 'Quote', description: 'Block quotation', icon: '"', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setBlockquote().run(); } },
      { title: 'Divider', description: 'Horizontal rule', icon: '—', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setHorizontalRule().run(); } },
      { title: 'Code Block', description: 'Code snippet', icon: '<>', command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).setCodeBlock().run(); } },
      { title: 'Callout', description: 'Highlighted info box', icon: '💡', command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run();
      } },
    ],
  },
  {
    category: 'Media',
    items: [
      { title: 'Image', description: 'Insert image from URL', icon: '🖼', command: ({ editor, range }) => {
        const url = prompt('Enter image URL:');
        if (url) {
          editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
        }
      } },
    ],
  },
  {
    category: 'Advanced',
    items: [
      { title: 'Table', description: '3x3 table', icon: '⊞', command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      } },
    ],
  },
];

const SlashCommandMenu = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  const flatItems = items || [];

  const selectItem = useCallback((index) => {
    const item = flatItems[index];
    if (item) {
      command(item);
    }
  }, [flatItems, command]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + flatItems.length - 1) % flatItems.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  useEffect(() => {
    setSelectedIndex(0);
  }, [flatItems.length]);

  useEffect(() => {
    const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (flatItems.length === 0) {
    return (
      <div className="slash-menu">
        <div className="slash-menu-empty">No results</div>
      </div>
    );
  }

  return (
    <div className="slash-menu" ref={menuRef}>
      {flatItems.map((item, index) => (
        <button
          key={index}
          data-index={index}
          className={`slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <span className="slash-menu-icon">{item.icon}</span>
          <div className="slash-menu-text">
            <span className="slash-menu-title">{item.title}</span>
            <span className="slash-menu-description">{item.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
});

SlashCommandMenu.displayName = 'SlashCommandMenu';

export { MENU_ITEMS };
export default SlashCommandMenu;
