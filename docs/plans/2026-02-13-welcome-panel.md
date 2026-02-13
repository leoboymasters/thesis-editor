# Welcome Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder empty state in the editor with a welcoming instruction panel that shows whenever no project file is active.

**Architecture:** The `RichTextEditor` component already has an `if (!activeFile) return ...` branch that renders a minimal placeholder. We replace that branch with a styled welcome card. The "New Project →" button calls `toggleTemplatePicker()` from the existing Zustand store. No new state, no new files.

**Tech Stack:** React 19, Tailwind CSS (via CDN), lucide-react, existing CSS custom properties (`--accent`, `--fg-secondary`, `--border`, `--bg-surface`)

---

### Task 1: Replace empty-state branch in RichTextEditor

**Files:**
- Modify: `src/components/Editor/RichTextEditor.tsx` — the `if (!activeFile) return ...` block only

**Step 1: Read the current empty-state block**

```bash
grep -n "activeFile" /home/tan/thesis-editor/thesis-editor/src/components/Editor/RichTextEditor.tsx
```

Confirm the block currently looks like:
```tsx
if (!activeFile) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted gap-3">
      <FileText className="w-12 h-12 opacity-30" />
      <p className="text-sm">Select a file to start editing</p>
    </div>
  );
}
```

**Step 2: Add `BookOpen` to the lucide-react import**

The current import is:
```tsx
import { FileText } from 'lucide-react';
```

Change it to:
```tsx
import { FileText, BookOpen } from 'lucide-react';
```

(`FileText` is still used elsewhere in the file — keep it.)

**Step 3: Add `toggleTemplatePicker` to the store destructure**

The current destructure is:
```tsx
const { files, activeFileId, updateFileContent } = useProjectStore();
```

Change it to:
```tsx
const { files, activeFileId, updateFileContent, toggleTemplatePicker } = useProjectStore();
```

**Step 4: Replace the empty-state return block**

Replace the existing `if (!activeFile) { return (...) }` block with:

```tsx
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
            <h1 className="text-xl font-semibold text-foreground">Welcome to ThesisFlow</h1>
            <p className="text-sm text-muted">Write your thesis. No LaTeX required.</p>
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
                <p className="text-xs text-muted mt-0.5">{desc}</p>
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
```

**Step 5: Run the build to verify no TypeScript errors**

```bash
~/.bun/bin/bun run build 2>&1 | tail -5
# Expected: ✓ built in X.XXs
```

**Step 6: Run tests**

```bash
~/.bun/bin/bun test
# Expected: 22 pass, 0 fail
```

**Step 7: Commit**

```bash
git add src/components/Editor/RichTextEditor.tsx
git commit -m "feat: add welcome panel with instructions on empty state"
```
