# ThesisFlow V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing raw LaTeX code editor (Monaco) into a "hidden LaTeX" rich-text editor (Tiptap) backed by IndexedDB persistence, with starter templates, BibTeX management, and PWA support.

**Architecture:** Tiptap replaces Monaco as the primary editing surface. A `jsonToLatex` serializer converts Tiptap's JSON document model into `.tex` strings, which feed the existing compilation pipeline unchanged. Dexie.js (IndexedDB) replaces Zustand's in-memory file state for zero-data-loss persistence.

**Tech Stack:** React 19, Tiptap, Dexie.js, Zustand, vite-plugin-pwa, fflate (existing), existing WASM/API compiler

---

## Current State

The repo has:
- Monaco-based raw LaTeX editor (`src/components/Editor/CodeEditor.tsx`)
- Zustand in-memory file store (`src/store/projectStore.ts`)
- Cloud/WASM compilation pipeline (`src/lib/compiler.ts`)
- Sidebar file tree, PDF viewer, ZIP import/export
- Tokyo Night theming (light/dark)

**What changes:** editing surface, storage, templates, BibTeX modal, PWA.
**What stays:** `compiler.ts`, `PdfViewer`, `Sidebar` (with additions), `TopBar`, `projectStore` (extended), `zipHandler`.

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

```bash
cd /home/tan/thesis-editor/thesis-editor
bun add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-heading @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder dexie
bun add -d vite-plugin-pwa vitest @vitejs/plugin-react jsdom
```

**Step 2: Verify install**

```bash
bun run dev &
# Check no import errors in terminal
kill %1
```

**Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add tiptap, dexie, vite-plugin-pwa, vitest"
```

---

## Task 2: Vitest Setup

**Files:**
- Create: `vitest.config.ts`

**Step 1: Create config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

**Step 2: Add test script to package.json**

In `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Run to verify**

```bash
bun test
# Expected: "No test files found"
```

**Step 4: Commit**

```bash
git add vitest.config.ts package.json
git commit -m "chore: add vitest setup"
```

---

## Task 3: JSON-to-LaTeX Serializer (TDD)

This is the **critical algorithmic core**. Write it test-first.

**Files:**
- Create: `src/lib/jsonToLatex.ts`
- Create: `src/lib/__tests__/jsonToLatex.test.ts`

**Step 1: Write failing tests**

```ts
// src/lib/__tests__/jsonToLatex.test.ts
import { describe, it, expect } from 'vitest';
import { jsonToLatex } from '../jsonToLatex';

describe('jsonToLatex', () => {
  it('converts a plain paragraph', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }],
    };
    expect(jsonToLatex(doc)).toContain('Hello world');
  });

  it('converts heading level 1 to \\chapter', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Introduction' }] }],
    };
    expect(jsonToLatex(doc)).toContain('\\chapter{Introduction}');
  });

  it('converts heading level 2 to \\section', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Background' }] }],
    };
    expect(jsonToLatex(doc)).toContain('\\section{Background}');
  });

  it('converts heading level 3 to \\subsection', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Related Work' }] }],
    };
    expect(jsonToLatex(doc)).toContain('\\subsection{Related Work}');
  });

  it('converts bold marks to \\textbf', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'important', marks: [{ type: 'bold' }] }],
      }],
    };
    expect(jsonToLatex(doc)).toContain('\\textbf{important}');
  });

  it('converts italic marks to \\textit', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'term', marks: [{ type: 'italic' }] }],
      }],
    };
    expect(jsonToLatex(doc)).toContain('\\textit{term}');
  });

  it('converts bullet list to itemize environment', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }] },
        ],
      }],
    };
    const result = jsonToLatex(doc);
    expect(result).toContain('\\begin{itemize}');
    expect(result).toContain('\\item First');
    expect(result).toContain('\\item Second');
    expect(result).toContain('\\end{itemize}');
  });

  it('converts ordered list to enumerate environment', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'orderedList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Step one' }] }] },
        ],
      }],
    };
    const result = jsonToLatex(doc);
    expect(result).toContain('\\begin{enumerate}');
    expect(result).toContain('\\item Step one');
    expect(result).toContain('\\end{enumerate}');
  });

  it('escapes special LaTeX characters', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '50% & 100$' }] }],
    };
    const result = jsonToLatex(doc);
    expect(result).toContain('50\\%');
    expect(result).toContain('\\&');
    expect(result).toContain('100\\$');
  });

  it('wraps output in document environment', () => {
    const doc = { type: 'doc', content: [] };
    const result = jsonToLatex(doc, { wrapDocument: true, preamble: '\\documentclass{article}' });
    expect(result).toContain('\\begin{document}');
    expect(result).toContain('\\end{document}');
  });
});
```

**Step 2: Run to verify all fail**

```bash
bun test src/lib/__tests__/jsonToLatex.test.ts
# Expected: FAIL - Cannot find module '../jsonToLatex'
```

**Step 3: Write minimal implementation**

```ts
// src/lib/jsonToLatex.ts

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

export interface SerializerOptions {
  wrapDocument?: boolean;
  preamble?: string;
}

const SPECIAL_CHARS: [RegExp, string][] = [
  [/\\/g, '\\textbackslash{}'],
  [/\{/g, '\\{'],
  [/\}/g, '\\}'],
  [/\$/g, '\\$'],
  [/&/g, '\\&'],
  [/%/g, '\\%'],
  [/#/g, '\\#'],
  [/_/g, '\\_'],
  [/\^/g, '\\textasciicircum{}'],
  [/~/g, '\\textasciitilde{}'],
];

const escapeLatex = (text: string): string => {
  // Escape backslash first, then others
  let result = text;
  for (const [pattern, replacement] of SPECIAL_CHARS) {
    result = result.replace(pattern, replacement);
  }
  return result;
};

const applyMarks = (text: string, marks: TiptapNode['marks']): string => {
  if (!marks || marks.length === 0) return text;
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case 'bold':      return `\\textbf{${acc}}`;
      case 'italic':    return `\\textit{${acc}}`;
      case 'code':      return `\\texttt{${acc}}`;
      case 'underline': return `\\underline{${acc}}`;
      default:          return acc;
    }
  }, text);
};

const serializeNode = (node: TiptapNode): string => {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(serializeNode).join('\n\n');

    case 'paragraph': {
      const inner = (node.content ?? []).map(serializeInline).join('');
      return inner || '';
    }

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const inner = (node.content ?? []).map(serializeInline).join('');
      const cmd = level === 1 ? 'chapter' : level === 2 ? 'section' : level === 3 ? 'subsection' : 'subsubsection';
      return `\\${cmd}{${inner}}`;
    }

    case 'bulletList': {
      const items = (node.content ?? []).map(serializeNode).join('\n');
      return `\\begin{itemize}\n${items}\n\\end{itemize}`;
    }

    case 'orderedList': {
      const items = (node.content ?? []).map(serializeNode).join('\n');
      return `\\begin{enumerate}\n${items}\n\\end{enumerate}`;
    }

    case 'listItem': {
      const inner = (node.content ?? []).map(serializeNode).join(' ').trim();
      return `\\item ${inner}`;
    }

    case 'blockquote': {
      const inner = (node.content ?? []).map(serializeNode).join('\n');
      return `\\begin{quote}\n${inner}\n\\end{quote}`;
    }

    case 'codeBlock': {
      const inner = (node.content ?? []).map(n => n.text ?? '').join('');
      return `\\begin{verbatim}\n${inner}\n\\end{verbatim}`;
    }

    case 'horizontalRule':
      return '\\hrule';

    case 'hardBreak':
      return '\\\\';

    default:
      // Unknown node: attempt to recurse into content
      return (node.content ?? []).map(serializeNode).join('');
  }
};

const serializeInline = (node: TiptapNode): string => {
  if (node.type === 'text') {
    const escaped = escapeLatex(node.text ?? '');
    return applyMarks(escaped, node.marks);
  }
  if (node.type === 'hardBreak') return '\\\\';
  return serializeNode(node);
};

export const jsonToLatex = (doc: TiptapNode, options: SerializerOptions = {}): string => {
  const body = serializeNode(doc);
  if (!options.wrapDocument) return body;
  const preamble = options.preamble ?? '\\documentclass{article}';
  return `${preamble}\n\\begin{document}\n${body}\n\\end{document}`;
};
```

**Step 4: Run tests to verify pass**

```bash
bun test src/lib/__tests__/jsonToLatex.test.ts
# Expected: all PASS
```

**Step 5: Commit**

```bash
git add src/lib/jsonToLatex.ts src/lib/__tests__/jsonToLatex.test.ts
git commit -m "feat: add jsonToLatex serializer with full test coverage"
```

---

## Task 4: Dexie.js Database Layer

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/__tests__/db.test.ts`

**Step 1: Write failing test**

```ts
// src/lib/__tests__/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
// We test the schema shape, not actual IndexedDB (which needs a real browser)
import { ThesisDB } from '../db';

describe('ThesisDB schema', () => {
  it('exports a ThesisDB class', () => {
    expect(ThesisDB).toBeDefined();
    const db = new ThesisDB();
    expect(db.projects).toBeDefined();
    expect(db.files).toBeDefined();
    expect(db.assets).toBeDefined();
  });
});
```

**Step 2: Run to verify fail**

```bash
bun test src/lib/__tests__/db.test.ts
# Expected: FAIL - Cannot find module '../db'
```

**Step 3: Implement**

```ts
// src/lib/db.ts
import Dexie, { Table } from 'dexie';

export interface Project {
  id?: number;
  title: string;
  templateId: string;
  lastModified: number;
  /** Tiptap JSON document per section file, keyed by file name */
  description?: string;
}

export interface DBFile {
  id?: number;
  projectId: number;
  name: string;
  /** 'tex' | 'bib' | 'image' | 'cls' | 'folder' */
  type: string;
  /** Tiptap JSON string for 'tex' files; raw string for 'bib'; undefined for images */
  content?: string;
  parentFolderId?: number | null;
  language?: string;
  isExpanded?: boolean;
}

export interface Asset {
  id?: number;
  projectId: number;
  fileName: string;
  blob: Blob;
}

export class ThesisDB extends Dexie {
  projects!: Table<Project, number>;
  files!: Table<DBFile, number>;
  assets!: Table<Asset, number>;

  constructor() {
    super('ThesisFlowDB');
    this.version(1).stores({
      projects: '++id, title, templateId, lastModified',
      files: '++id, projectId, name, type, parentFolderId',
      assets: '++id, projectId, fileName',
    });
  }
}

export const db = new ThesisDB();
```

**Step 4: Run test**

```bash
bun test src/lib/__tests__/db.test.ts
# Expected: PASS
```

**Step 5: Commit**

```bash
git add src/lib/db.ts src/lib/__tests__/db.test.ts
git commit -m "feat: add dexie db schema (projects, files, assets)"
```

---

## Task 5: Tiptap Rich-Text Editor Component

**Files:**
- Create: `src/components/Editor/RichTextEditor.tsx`
- Create: `src/components/Editor/EditorToolbar.tsx`

**Step 1: Write the toolbar**

```tsx
// src/components/Editor/EditorToolbar.tsx
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
```

**Step 2: Write the editor**

```tsx
// src/components/Editor/RichTextEditor.tsx
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';
import { useProjectStore } from '../../store/projectStore';
import { FileText } from 'lucide-react';

// Tiptap CSS for ProseMirror content
const proseMirrorStyles = `
.ProseMirror {
  outline: none;
  min-height: 100%;
}
.ProseMirror p.is-editor-empty:first-child::before {
  color: var(--fg-secondary);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.ProseMirror h1 { font-size: 1.75rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
.ProseMirror h2 { font-size: 1.375rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
.ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 1rem 0 0.4rem; }
.ProseMirror p  { margin: 0.5rem 0; line-height: 1.7; }
.ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
.ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
.ProseMirror li { margin: 0.25rem 0; }
.ProseMirror blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--fg-secondary); margin: 0.75rem 0; }
.ProseMirror code { background: var(--bg-surface); padding: 0.1em 0.4em; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
.ProseMirror pre { background: var(--bg-surface); padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 0.75rem 0; }
.ProseMirror pre code { background: none; padding: 0; }
.ProseMirror hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
`;

export const RichTextEditor: React.FC = () => {
  const { files, activeFileId, updateFileContent, theme } = useProjectStore();
  const activeFile = activeFileId ? files[activeFileId] : null;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your thesis...' }),
    ],
    content: (() => {
      if (!activeFile?.content) return '';
      try { return JSON.parse(activeFile.content); } catch { return activeFile.content; }
    })(),
    onUpdate: ({ editor }) => {
      if (activeFileId) {
        // Store as JSON string for rich files, or fall back to text
        const json = editor.getJSON();
        updateFileContent(activeFileId, JSON.stringify(json));
      }
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-8 font-sans text-foreground',
        spellcheck: 'true',
      },
    },
  });

  // Sync editor content when active file changes
  useEffect(() => {
    if (!editor || !activeFile) return;
    const stored = activeFile.content ?? '';
    try {
      const json = JSON.parse(stored);
      // Only update if content actually differs (avoids cursor reset)
      const current = JSON.stringify(editor.getJSON());
      if (JSON.stringify(json) !== current) {
        editor.commands.setContent(json, false);
      }
    } catch {
      // Plain text fallback
      if (editor.getText() !== stored) {
        editor.commands.setContent(stored, false);
      }
    }
  }, [activeFileId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted gap-3">
        <FileText className="w-12 h-12 opacity-30" />
        <p className="text-sm">Select a file to start editing</p>
      </div>
    );
  }

  return (
    <>
      <style>{proseMirrorStyles}</style>
      <div className={`flex flex-col h-full ${theme}`}>
        <EditorToolbar editor={editor} />
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </>
  );
};
```

**Step 3: Wire into App.tsx — replace CodeEditor with RichTextEditor**

In `src/App.tsx`, change:
```tsx
import { CodeEditor } from './components/Editor/CodeEditor';
// ...
<CodeEditor />
```
to:
```tsx
import { RichTextEditor } from './components/Editor/RichTextEditor';
// ...
<RichTextEditor />
```

**Step 4: Add "Raw LaTeX" toggle to TopBar**

In `src/components/Layout/TopBar.tsx`, add a toggle button that switches between RichTextEditor and CodeEditor. Store the mode in projectStore as `editorMode: 'rich' | 'raw'`.

**Step 5: Update projectStore**

Add to `ProjectStore` interface in `src/store/projectStore.ts`:
```ts
editorMode: 'rich' | 'raw';
toggleEditorMode: () => void;
```
Add to initial state:
```ts
editorMode: 'rich' as const,
```
Add action:
```ts
toggleEditorMode: () => set((state) => ({
  editorMode: state.editorMode === 'rich' ? 'raw' : 'rich'
})),
```

**Step 6: Use editorMode in App.tsx**

```tsx
const { editorMode, ... } = useProjectStore();
// In JSX:
{editorMode === 'rich' ? <RichTextEditor /> : <CodeEditor />}
```

**Step 7: Verify visually**

```bash
bun run dev
# Open http://localhost:3000
# Should see Tiptap editor with toolbar
# Bold/italic/heading buttons should work
# Toggle to Raw should show Monaco
```

**Step 8: Commit**

```bash
git add src/components/Editor/RichTextEditor.tsx src/components/Editor/EditorToolbar.tsx \
        src/App.tsx src/store/projectStore.ts src/components/Layout/TopBar.tsx
git commit -m "feat: add tiptap rich-text editor with formatting toolbar"
```

---

## Task 6: Wire Serializer into Compilation Pipeline

The compiler needs to receive valid LaTeX. Rich-text files store Tiptap JSON, which must be serialized before sending to the compiler.

**Files:**
- Modify: `src/lib/compiler.ts` (minimal change)
- Create: `src/lib/__tests__/compilerSerializer.test.ts`

**Step 1: Write failing test**

```ts
// src/lib/__tests__/compilerSerializer.test.ts
import { describe, it, expect } from 'vitest';
import { serializeFilesForCompilation } from '../compilerSerializer';

describe('serializeFilesForCompilation', () => {
  it('passes through raw LaTeX content unchanged', () => {
    const files = {
      'f1': { id: 'f1', name: 'main.tex', type: 'file' as const, parentId: null, content: '\\documentclass{article}' }
    };
    const result = serializeFilesForCompilation(files);
    expect(result['f1'].content).toBe('\\documentclass{article}');
  });

  it('serializes Tiptap JSON to LaTeX for .tex files', () => {
    const tiptapDoc = JSON.stringify({
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Intro' }] }]
    });
    const files = {
      'f1': { id: 'f1', name: 'chapter1.tex', type: 'file' as const, parentId: null, content: tiptapDoc }
    };
    const result = serializeFilesForCompilation(files);
    expect(result['f1'].content).toContain('\\chapter{Intro}');
    expect(result['f1'].content).not.toContain('"type":"doc"');
  });

  it('leaves non-.tex files unchanged', () => {
    const bibContent = '@article{key, title={A paper}}';
    const files = {
      'b1': { id: 'b1', name: 'refs.bib', type: 'file' as const, parentId: null, content: bibContent }
    };
    const result = serializeFilesForCompilation(files);
    expect(result['b1'].content).toBe(bibContent);
  });
});
```

**Step 2: Run to verify fail**

```bash
bun test src/lib/__tests__/compilerSerializer.test.ts
# Expected: FAIL - cannot find module
```

**Step 3: Implement serializer bridge**

```ts
// src/lib/compilerSerializer.ts
import { FileSystemItem } from '../types';
import { jsonToLatex, TiptapNode } from './jsonToLatex';

/**
 * Detects if a string is a Tiptap JSON document.
 * We check for the characteristic {"type":"doc",...} shape.
 */
const isTiptapJson = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return parsed?.type === 'doc' && Array.isArray(parsed?.content);
  } catch {
    return false;
  }
};

/**
 * Returns a new files map where .tex files with Tiptap JSON content
 * have been serialized to LaTeX strings. Other files pass through unchanged.
 */
export const serializeFilesForCompilation = (
  files: Record<string, FileSystemItem>
): Record<string, FileSystemItem> => {
  const result: Record<string, FileSystemItem> = {};
  for (const [id, file] of Object.entries(files)) {
    if (file.type === 'file' && file.name.endsWith('.tex') && file.content && isTiptapJson(file.content)) {
      const doc = JSON.parse(file.content) as TiptapNode;
      result[id] = { ...file, content: jsonToLatex(doc) };
    } else {
      result[id] = file;
    }
  }
  return result;
};
```

**Step 4: Run tests**

```bash
bun test src/lib/__tests__/compilerSerializer.test.ts
# Expected: all PASS
```

**Step 5: Wire into projectStore's startCompilation**

In `src/store/projectStore.ts`, import and call serializer before compiling:

```ts
import { serializeFilesForCompilation } from '../lib/compilerSerializer';

// In startCompilation, before calling compileProject:
const { files, activeFileId } = get();
const serializedFiles = serializeFilesForCompilation(files);
const pdfUrl = await compileProject(serializedFiles, activeFileId, { ... });
```

**Step 6: Commit**

```bash
git add src/lib/compilerSerializer.ts src/lib/__tests__/compilerSerializer.test.ts \
        src/store/projectStore.ts
git commit -m "feat: serialize tiptap json to latex before compilation"
```

---

## Task 7: Starter Templates

**Files:**
- Create: `src/data/templates.ts`
- Create: `src/components/Templates/TemplatePickerModal.tsx`
- Modify: `src/store/projectStore.ts`

**Step 1: Create template definitions**

```ts
// src/data/templates.ts
export interface ThesisTemplate {
  id: string;
  name: string;
  description: string;
  preamble: string;   // LaTeX preamble (documentclass + packages)
  sections: Array<{ name: string; tiptapContent: object }>;
}

export const TEMPLATES: ThesisTemplate[] = [
  {
    id: 'general',
    name: 'General University',
    description: 'Standard academic thesis format, works for most universities.',
    preamble: `\\documentclass[12pt,a4paper]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage{times}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{hyperref}
\\usepackage[backend=biber,style=apa]{biblatex}
\\addbibresource{references.bib}`,
    sections: [
      { name: 'abstract.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Abstract' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Write your abstract here...' }] }
      ]}},
      { name: 'chapter1.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Introduction' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Introduce your research here...' }] }
      ]}},
      { name: 'chapter2.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Literature Review' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Review related work here...' }] }
      ]}},
    ],
  },
  {
    id: 'ieee',
    name: 'IEEE Conference',
    description: 'IEEE double-column format for conference papers.',
    preamble: `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}`,
    sections: [
      { name: 'abstract.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Abstract' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Your abstract here...' }] }
      ]}},
      { name: 'introduction.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Introduce your paper...' }] }
      ]}},
    ],
  },
  {
    id: 'apa',
    name: 'APA Style',
    description: 'American Psychological Association 7th edition format.',
    preamble: `\\documentclass[12pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{times}
\\usepackage{setspace}
\\doublespacing
\\usepackage[backend=biber,style=apa]{biblatex}
\\addbibresource{references.bib}`,
    sections: [
      { name: 'abstract.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Abstract' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Abstract goes here (150-250 words)...' }] }
      ]}},
      { name: 'introduction.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'State the problem here...' }] }
      ]}},
    ],
  },
];
```

**Step 2: Build the TemplatePickerModal**

```tsx
// src/components/Templates/TemplatePickerModal.tsx
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { TEMPLATES, ThesisTemplate } from '../../data/templates';
import { useProjectStore } from '../../store/projectStore';

interface Props { onClose: () => void; }

export const TemplatePickerModal: React.FC<Props> = ({ onClose }) => {
  const [selected, setSelected] = useState<string>('general');
  const { loadTemplate } = useProjectStore();

  const handleApply = () => {
    const template = TEMPLATES.find(t => t.id === selected)!;
    loadTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-panel border border-border rounded-xl w-[520px] max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Choose a Template</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {TEMPLATES.map((t: ThesisTemplate) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selected === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-surface'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{t.name}</span>
                {selected === t.id && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted mt-1">{t.description}</p>
            </button>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-foreground">Cancel</button>
          <button onClick={handleApply} className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Step 3: Add loadTemplate to projectStore**

```ts
// In ProjectStore interface:
loadTemplate: (template: ThesisTemplate) => void;

// In store implementation:
loadTemplate: (template) => {
  clearCompilationCache();
  const newFiles: Record<string, FileSystemItem> = {
    root: { id: 'root', name: 'root', type: 'folder', parentId: null, isExpanded: true },
  };

  // Create preamble file (raw LaTeX)
  newFiles['preamble'] = {
    id: 'preamble',
    name: 'preamble.tex',
    type: 'file',
    parentId: 'root',
    content: template.preamble,
    language: 'latex',
  };

  // Create section files (Tiptap JSON)
  template.sections.forEach((section, i) => {
    const id = `section-${i}`;
    newFiles[id] = {
      id,
      name: section.name,
      type: 'file',
      parentId: 'root',
      content: JSON.stringify(section.tiptapContent),
      language: 'latex',
    };
  });

  // Create references.bib
  newFiles['refs'] = {
    id: 'refs', name: 'references.bib', type: 'file',
    parentId: 'root', content: '', language: 'bibtex'
  };

  set({
    files: newFiles,
    activeFileId: 'section-0',
    compilationResult: null,
  });
},
```

**Step 4: Add "New Project" button to TopBar**

In `src/components/Layout/TopBar.tsx`, add a button that sets `templatePickerOpen: true` in store.
Render `<TemplatePickerModal>` in `App.tsx` when `templatePickerOpen` is true.

**Step 5: Verify visually**

```bash
bun run dev
# Click "New Project" → template picker appears
# Select IEEE → files appear in sidebar
# Editor shows placeholder content
```

**Step 6: Commit**

```bash
git add src/data/templates.ts src/components/Templates/TemplatePickerModal.tsx \
        src/store/projectStore.ts src/components/Layout/TopBar.tsx src/App.tsx
git commit -m "feat: add 3 starter templates (General, IEEE, APA) with template picker"
```

---

## Task 8: BibTeX Citation Modal

**Files:**
- Create: `src/components/Citations/CitationModal.tsx`
- Create: `src/lib/doiLookup.ts`
- Create: `src/lib/__tests__/doiLookup.test.ts`

**Step 1: Write DOI lookup failing test**

```ts
// src/lib/__tests__/doiLookup.test.ts
import { describe, it, expect, vi } from 'vitest';
import { formatBibtexEntry } from '../doiLookup';

describe('formatBibtexEntry', () => {
  it('formats a minimal metadata object to BibTeX', () => {
    const meta = {
      key: 'smith2024',
      type: 'article',
      title: 'Deep Learning',
      author: 'Smith, John',
      year: '2024',
      journal: 'Nature',
    };
    const result = formatBibtexEntry(meta);
    expect(result).toContain('@article{smith2024,');
    expect(result).toContain('title = {Deep Learning}');
    expect(result).toContain('author = {Smith, John}');
    expect(result).toContain('year = {2024}');
  });

  it('skips undefined fields', () => {
    const meta = { key: 'x', type: 'misc', title: 'Test' };
    const result = formatBibtexEntry(meta);
    expect(result).not.toContain('author');
    expect(result).not.toContain('journal');
  });
});
```

**Step 2: Run to verify fail**

```bash
bun test src/lib/__tests__/doiLookup.test.ts
# Expected: FAIL
```

**Step 3: Implement doiLookup.ts**

```ts
// src/lib/doiLookup.ts

export interface CitationMeta {
  key: string;
  type: string;
  title?: string;
  author?: string;
  year?: string;
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  booktitle?: string;
}

export const formatBibtexEntry = (meta: CitationMeta): string => {
  const fields: [string, string | undefined][] = [
    ['title', meta.title],
    ['author', meta.author],
    ['year', meta.year],
    ['journal', meta.journal],
    ['volume', meta.volume],
    ['number', meta.number],
    ['pages', meta.pages],
    ['publisher', meta.publisher],
    ['booktitle', meta.booktitle],
    ['doi', meta.doi],
    ['url', meta.url],
  ];
  const lines = fields
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `  ${k} = {${v}}`);
  return `@${meta.type}{${meta.key},\n${lines.join(',\n')}\n}`;
};

/**
 * Looks up DOI via the public CrossRef API (no auth required).
 * Returns a CitationMeta or throws.
 */
export const lookupDoi = async (doi: string): Promise<CitationMeta> => {
  const clean = doi.trim().replace(/^https?:\/\/doi\.org\//i, '');
  const url = `https://api.crossref.org/works/${encodeURIComponent(clean)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ThesisFlow/1.0' } });
  if (!res.ok) throw new Error(`DOI not found: ${doi}`);
  const json = await res.json();
  const w = json.message;

  const authors = (w.author ?? [])
    .map((a: { family?: string; given?: string }) => [a.family, a.given].filter(Boolean).join(', '))
    .join(' and ');

  const year = w.published?.['date-parts']?.[0]?.[0]?.toString() ?? '';
  const key = (w.author?.[0]?.family ?? 'unknown').toLowerCase() + year;
  const type = w.type === 'journal-article' ? 'article'
             : w.type === 'proceedings-article' ? 'inproceedings'
             : 'misc';

  return {
    key,
    type,
    title: w.title?.[0],
    author: authors,
    year,
    journal: w['container-title']?.[0],
    volume: w.volume,
    number: w.issue,
    pages: w.page,
    doi: clean,
    publisher: w.publisher,
  };
};
```

**Step 4: Run tests**

```bash
bun test src/lib/__tests__/doiLookup.test.ts
# Expected: PASS
```

**Step 5: Build CitationModal**

> **Your turn:** Implement `src/components/Citations/CitationModal.tsx`.
>
> I've set up `lookupDoi` and `formatBibtexEntry` in `src/lib/doiLookup.ts`. The modal needs to:
> 1. Show a DOI input field with a "Lookup" button
> 2. Pre-fill the form fields (author, title, year, journal, type) after lookup
> 3. Allow manual editing of fields
> 4. On "Insert", find the `references.bib` file in the store and append the formatted entry
>
> **The key decision:** How should the modal handle errors (network fail, bad DOI, duplicate keys)?
> Consider: show inline error vs toast vs console, and whether to auto-generate a citation key or let the user edit it.
>
> Render this modal from TopBar when a "Cite" button is clicked.

**Step 6: Commit**

```bash
git add src/lib/doiLookup.ts src/lib/__tests__/doiLookup.test.ts \
        src/components/Citations/CitationModal.tsx src/components/Layout/TopBar.tsx
git commit -m "feat: add bibtex citation modal with doi lookup"
```

---

## Task 9: IndexedDB Persistence (Dexie Auto-Save)

Wire the Dexie DB to automatically persist file changes.

**Files:**
- Create: `src/lib/persistence.ts`
- Modify: `src/store/projectStore.ts`

**Step 1: Write persistence hook**

```ts
// src/lib/persistence.ts
import { db, DBFile } from './db';
import { FileSystemItem } from '../types';

/** Save all files for a project to IndexedDB */
export const persistFiles = async (
  projectId: number,
  files: Record<string, FileSystemItem>
): Promise<void> => {
  // Replace all files for this project
  await db.transaction('rw', db.files, async () => {
    await db.files.where('projectId').equals(projectId).delete();
    const rows: DBFile[] = Object.values(files).map(f => ({
      projectId,
      name: f.name,
      type: f.type,
      content: f.content,
      parentFolderId: null, // simplified for V1
      language: f.language,
      isExpanded: f.isExpanded,
    }));
    await db.files.bulkAdd(rows);
  });
};

/** Load files from IndexedDB for a project */
export const loadFiles = async (
  projectId: number
): Promise<Record<string, FileSystemItem>> => {
  const rows = await db.files.where('projectId').equals(projectId).toArray();
  const files: Record<string, FileSystemItem> = {};
  for (const row of rows) {
    const id = String(row.id!);
    files[id] = {
      id,
      name: row.name,
      type: row.type as 'file' | 'folder',
      parentId: null,
      content: row.content,
      language: row.language,
      isExpanded: row.isExpanded,
    };
  }
  return files;
};
```

**Step 2: Add a Zustand middleware subscriber**

In `src/store/projectStore.ts`, after `create(...)`:

```ts
import { persistFiles } from '../lib/persistence';

// After creating the store, subscribe to file changes
const DEBOUNCE_MS = 800;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

useProjectStore.subscribe(
  (state) => state.files,
  (files) => {
    // Debounce saves
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      // projectId 1 = default local project for V1 (no-auth mode)
      persistFiles(1, files).catch(console.error);
    }, DEBOUNCE_MS);
  }
);
```

**Step 3: Load from IndexedDB on app start**

In `src/index.tsx`, before rendering:

```ts
import { loadFiles } from './lib/persistence';
import { useProjectStore } from './store/projectStore';

const bootstrap = async () => {
  try {
    const files = await loadFiles(1);
    if (Object.keys(files).length > 0) {
      useProjectStore.setState({ files });
    }
  } catch {
    // First run — no persisted data, use INITIAL_FILES
  }
};

bootstrap().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
});
```

**Step 4: Verify persistence**

```bash
bun run dev
# Type something in the editor
# Refresh the page
# Content should be restored from IndexedDB
```

**Step 5: Commit**

```bash
git add src/lib/persistence.ts src/store/projectStore.ts src/index.tsx
git commit -m "feat: persist file content to indexeddb via dexie, auto-restore on load"
```

---

## Task 10: LaTeX .zip Export

The existing `zipHandler.ts` handles import; add export.

**Files:**
- Create: `src/lib/exportZip.ts`
- Create: `src/lib/__tests__/exportZip.test.ts`

**Step 1: Write failing test**

```ts
// src/lib/__tests__/exportZip.test.ts
import { describe, it, expect } from 'vitest';
import { buildExportManifest } from '../exportZip';

describe('buildExportManifest', () => {
  it('serializes tiptap files to latex and returns a flat name->content map', () => {
    const files = {
      'root': { id: 'root', name: 'root', type: 'folder' as const, parentId: null },
      'f1': {
        id: 'f1', name: 'chapter1.tex', type: 'file' as const, parentId: 'root',
        content: JSON.stringify({ type: 'doc', content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Intro' }] }
        ]})
      },
      'f2': { id: 'f2', name: 'refs.bib', type: 'file' as const, parentId: 'root', content: '@article{x}' }
    };
    const manifest = buildExportManifest(files);
    expect(manifest['chapter1.tex']).toContain('\\chapter{Intro}');
    expect(manifest['refs.bib']).toBe('@article{x}');
    expect(manifest['root']).toBeUndefined(); // folders excluded
  });
});
```

**Step 2: Run to verify fail**

```bash
bun test src/lib/__tests__/exportZip.test.ts
```

**Step 3: Implement**

```ts
// src/lib/exportZip.ts
import { strToU8, zip } from 'fflate';
import { FileSystemItem } from '../types';
import { serializeFilesForCompilation } from './compilerSerializer';

/** Returns a flat { filename: latexContent } map for all files */
export const buildExportManifest = (
  files: Record<string, FileSystemItem>
): Record<string, string> => {
  const serialized = serializeFilesForCompilation(files);
  const manifest: Record<string, string> = {};
  for (const file of Object.values(serialized)) {
    if (file.type === 'file' && file.content !== undefined) {
      manifest[file.name] = file.content;
    }
  }
  return manifest;
};

/** Zips all project files and triggers a browser download */
export const exportProjectZip = (
  files: Record<string, FileSystemItem>,
  projectTitle = 'thesis'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const manifest = buildExportManifest(files);
    const zipData: Record<string, Uint8Array> = {};
    for (const [name, content] of Object.entries(manifest)) {
      zipData[name] = strToU8(content);
    }
    zip(zipData, (err, data) => {
      if (err) return reject(err);
      const blob = new Blob([data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    });
  });
};
```

**Step 4: Run tests**

```bash
bun test src/lib/__tests__/exportZip.test.ts
# Expected: PASS
```

**Step 5: Wire export button into TopBar**

In `src/components/Layout/TopBar.tsx`, add an "Export .zip" button that calls `exportProjectZip(files)`.

**Step 6: Commit**

```bash
git add src/lib/exportZip.ts src/lib/__tests__/exportZip.test.ts \
        src/components/Layout/TopBar.tsx
git commit -m "feat: export project as raw .tex zip for overleaf compatibility"
```

---

## Task 11: PWA Support

**Files:**
- Modify: `vite.config.ts`
- Create: `public/manifest.json`

**Step 1: Update vite config**

```ts
// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: { port: 3000, host: '0.0.0.0' },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /\.wasm$/,
              handler: 'CacheFirst',
              options: { cacheName: 'wasm-cache', expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 } }
            }
          ]
        },
        manifest: {
          name: 'ThesisFlow',
          short_name: 'ThesisFlow',
          description: 'Write your thesis without touching LaTeX',
          theme_color: '#7c3aed',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  };
});
```

**Step 2: Add placeholder icons**

```bash
# Create minimal placeholder icons (replace with real ones before launch)
cd /home/tan/thesis-editor/thesis-editor/public
# Add icon-192.png and icon-512.png (any 192x192 and 512x512 images)
```

**Step 3: Build and verify**

```bash
bun run build
bun run preview
# Open http://localhost:4173
# Chrome should show "Install ThesisFlow" in address bar
```

**Step 4: Commit**

```bash
git add vite.config.ts public/
git commit -m "feat: add pwa support with workbox caching"
```

---

## Task 12: Final Integration & CSS Variables

**Files:**
- Modify: `src/index.css`

Ensure CSS custom properties match what the Tiptap prose styles use:

```css
/* Confirm these variables exist in src/index.css for both .light and .dark */
:root {
  --bg-app: #ffffff;
  --bg-panel: #f8f9fa;
  --bg-surface: #f1f5f9;
  --fg-primary: #1e293b;
  --fg-secondary: #64748b;
  --border: #e2e8f0;
  --accent: #7c3aed;
}
.dark {
  --bg-app: #1a1b26;
  /* ... (existing dark values) */
}
```

Run all tests and verify:

```bash
bun test
# Expected: all PASS
bun run build
# Expected: no TypeScript errors, successful build
```

Final commit:

```bash
git add -A
git commit -m "feat: thesisflow v1 complete - rich text editor with hidden latex, persistence, templates, citations, pwa"
```

---

## Success Criteria Checklist

- [ ] User can select a template and immediately start writing in rich text
- [ ] Bold/italic/heading toolbar formatting works
- [ ] Compile button serializes Tiptap JSON → LaTeX → PDF
- [ ] Content survives page refresh (IndexedDB)
- [ ] Citation modal: manual entry + DOI lookup populates `.bib` file
- [ ] "Export .zip" downloads raw `.tex` files (Overleaf-compatible)
- [ ] "Raw LaTeX" toggle switches to Monaco for power users
- [ ] PWA: "Install to Desktop" option in Chrome
- [ ] All unit tests pass: `bun test`
- [ ] Build succeeds: `bun run build`
