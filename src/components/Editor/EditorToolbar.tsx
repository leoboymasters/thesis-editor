import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3,
  Quote, Code, Minus
} from 'lucide-react';

interface ToolbarProps { editor: Editor | null; }

const Btn = ({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded text-sm transition-colors ${
      active ? 'bg-primary text-white' : 'text-muted hover:bg-surface hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

export const EditorToolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) return null;
  const e = editor;
  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border bg-panel flex-wrap">
      <Btn onClick={() => e.chain().focus().toggleHeading({ level: 1 }).run()}
           active={e.isActive('heading', { level: 1 })} title="Chapter (H1)">
        <Heading1 className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()}
           active={e.isActive('heading', { level: 2 })} title="Section (H2)">
        <Heading2 className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()}
           active={e.isActive('heading', { level: 3 })} title="Subsection (H3)">
        <Heading3 className="w-4 h-4" />
      </Btn>
      <div className="w-px h-5 bg-border mx-1" />
      <Btn onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive('bold')} title="Bold">
        <Bold className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive('italic')} title="Italic">
        <Italic className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => e.chain().focus().toggleCode().run()} active={e.isActive('code')} title="Inline Code">
        <Code className="w-4 h-4" />
      </Btn>
      <div className="w-px h-5 bg-border mx-1" />
      <Btn onClick={() => e.chain().focus().toggleBulletList().run()} active={e.isActive('bulletList')} title="Bullet List">
        <List className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => e.chain().focus().toggleOrderedList().run()} active={e.isActive('orderedList')} title="Numbered List">
        <ListOrdered className="w-4 h-4" />
      </Btn>
      <div className="w-px h-5 bg-border mx-1" />
      <Btn onClick={() => e.chain().focus().toggleBlockquote().run()} active={e.isActive('blockquote')} title="Block Quote">
        <Quote className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => e.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        <Minus className="w-4 h-4" />
      </Btn>
    </div>
  );
};
