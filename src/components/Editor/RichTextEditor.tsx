import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';
import { useProjectStore } from '../../store/projectStore';
import { FileText, BookOpen } from 'lucide-react';

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
  const { files, activeFileId, updateFileContent, toggleTemplatePicker } = useProjectStore();
  const activeFile = activeFileId ? files[activeFileId] : null;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your research...' }),
    ],
    content: (() => {
      if (!activeFile?.content) return '';
      try { return JSON.parse(activeFile.content); } catch { return activeFile.content; }
    })(),
    onUpdate: ({ editor }) => {
      if (activeFileId) {
        updateFileContent(activeFileId, JSON.stringify(editor.getJSON()));
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
      const current = JSON.stringify(editor.getJSON());
      if (JSON.stringify(json) !== current) {
        editor.commands.setContent(json);
      }
    } catch {
      if (editor.getText() !== stored) {
        editor.commands.setContent(stored);
      }
    }
  }, [activeFileId, editor]);

  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Welcome to Researchere</h1>
              <p className="text-sm text-muted-foreground">Write your research. No LaTeX required.</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-8">
            {[
              { n: 1, title: 'Pick a template', desc: 'General University, IEEE, or APA — we set up the structure.' },
              { n: 2, title: 'Write in rich text', desc: 'Bold, headings, lists — we generate the LaTeX.' },
              { n: 3, title: 'Add citations', desc: 'Paste a DOI and we fill in the BibTeX entry.' },
              { n: 4, title: 'Compile & preview', desc: 'Live PDF preview. Export .zip for Overleaf anytime.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-3 p-3 rounded-lg border border-border bg-surface">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {n}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={toggleTemplatePicker}
            className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            New Project →
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{proseMirrorStyles}</style>
      <div className="flex flex-col h-full">
        <EditorToolbar editor={editor} />
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </>
  );
};
