# ThesisFlow V1 — Release Report

**Date:** 2026-02-13
**Branch:** main
**Build:** passing (22 tests, 0 failures)

---

## Overview

ThesisFlow V1 transforms a raw LaTeX code editor into a word-processor-style thesis writing environment. Users write in rich text — bold, headings, lists, citations — and the application silently converts everything to LaTeX, compiles it to PDF, and exports Overleaf-ready archives. No LaTeX knowledge required to write; full LaTeX control is still available when needed.

---

## What Was Built

### 1. Rich Text Editor (Tiptap)
- Replaced the Monaco raw-code editor with a Tiptap ProseMirror editor for `.tex` section files
- Toolbar: H1/H2/H3, Bold, Italic, Inline Code, Bullet List, Ordered List, Blockquote, Horizontal Rule
- Document content stored internally as Tiptap JSON; LaTeX is generated only at compile time
- Editor auto-switches between rich mode (section files) and raw/code mode (main.tex, .bib files) when the user selects a file

### 2. JSON → LaTeX Serializer (`src/lib/jsonToLatex.ts`)
- Pure recursive tree-walk converting Tiptap AST to valid LaTeX
- Heading mapping adapts to document class: `report`/`book` → `\chapter`, `\section`, …; `article`/`IEEEtran`/`beamer` → `\section`, `\subsection`, …
- Single-pass special-character escaping (`\`, `{`, `}`, `$`, `&`, `%`, `#`, `_`, `^`, `~`) using a regex map to prevent double-escaping
- Supported elements: paragraphs, all heading levels, bold, italic, monospace, underline, bullet lists, ordered lists, blockquotes, code blocks, horizontal rules, hard breaks
- 13 unit tests covering all node types and edge cases

### 3. Transparent Compilation Bridge (`src/lib/compilerSerializer.ts`)
- Before compilation, detects which `.tex` files contain Tiptap JSON vs raw LaTeX
- Converts only Tiptap JSON files; raw LaTeX files (main.tex, custom preambles) pass through unchanged
- The existing compiler (`compiler.ts`) required no changes
- Article-class detection reads `main.tex` preamble to determine correct heading commands

### 4. Starter Templates
Three built-in templates and a custom preamble option:

| Template | Class | Sections |
|---|---|---|
| General University | `report` | Abstract, Introduction, Literature Review, Methodology, Conclusion |
| IEEE Conference | `IEEEtran` | Abstract, Introduction |
| APA Style | `article` | Abstract, Introduction |
| Custom Preamble | user-defined | Single section, user writes preamble |

Each template creates: section files (Tiptap JSON), `main.tex` (raw LaTeX with `\input` statements), and an empty `references.bib`.

### 5. DOI Citation Lookup (`src/lib/doiLookup.ts`)
- Fetches metadata from the CrossRef API (`https://api.crossref.org/works/{DOI}`)
- Accepts full URLs (`https://doi.org/...`) or bare DOI strings
- Maps CrossRef response to BibTeX fields; correctly routes `container-title` to `journal` for articles and `booktitle` for conference papers
- Pre-fills a form in the Citation Modal for review before insertion
- Appends formatted BibTeX entry to `references.bib`

### 6. IndexedDB Persistence (`src/lib/db.ts`, `src/lib/persistence.ts`)
- Dexie.js schema: `projects`, `files`, `assets` tables
- Auto-saves file content 800 ms after any edit (debounced Zustand subscriber)
- Restores the full project on next app load before React renders
- Round-trip fidelity: preserves original file IDs and parent IDs

### 7. ZIP Export (`src/lib/exportZip.ts`)
- Serializes all Tiptap JSON files to LaTeX before zipping
- Produces a flat `.zip` archive compatible with Overleaf drag-and-drop import
- Uses fflate for in-browser compression with no server round-trip

### 8. PWA / Offline Support
- `vite-plugin-pwa` with Workbox service worker
- Precaches app shell and assets
- WASM files cached with CacheFirst strategy for offline compilation

### 9. Welcome Panel
- Shown whenever no project file is active (first load or empty state)
- Four numbered steps explaining the workflow: pick template → write → cite → compile
- "New Project →" button opens the template picker

---

## Bug Fixes Made During Testing

| Bug | Root Cause | Fix |
|---|---|---|
| Compile fails after switching template | `pathCache` (fileId → filename map) never cleared on project load; stale paths sent to compiler | `clearPathCache()` called in `loadTemplate`, `importProject`, `createFile`, `deleteItem` |
| IEEE/APA compilation fails | `\chapter` is undefined in `article`/`IEEEtran` classes; serializer always emitted `\chapter` for H1 | Auto-detect document class from `main.tex` preamble; shift heading commands for article-class |
| Compile fails without citations | Built-in templates originally included `biblatex` + `\addbibresource`; biber errors on empty `.bib` | Removed biblatex from built-in preambles |
| biber always ran even without biblatex | `useBiber: true` hardcoded in every API call; biber exits non-zero when no `.bcf` file | Only enable biber when preamble contains `biblatex` or `\addbibresource` |
| DOI conference paper had wrong BibTeX field | `container-title` always mapped to `journal`; `inproceedings` needs `booktitle` | Route by type: `article` → `journal`, `inproceedings` → `booktitle` |
| Raw LaTeX files opened in rich text editor | `setActiveFile` never checked content type | Detect Tiptap JSON on file selection; auto-switch editor mode |
| Opaque LaTeX error messages | Raw errors like `Undefined control sequence` shown verbatim | `humanizeLatexError()` translates common LaTeX errors to plain English |

---

## Test Coverage

```
22 tests across 5 files — 0 failures
```

Key test files:
- `src/lib/__tests__/jsonToLatex.test.ts` — 13 tests for the serializer
- Supporting tests for persistence, compiler serializer, export

---

## Tech Stack

| Layer | Technology |
|---|---|
| Editor | Tiptap (ProseMirror), React 19 |
| State | Zustand with subscribeWithSelector |
| Persistence | Dexie.js (IndexedDB) |
| Compilation | YtoTech API (cloud pdflatex) |
| Compression | fflate |
| PWA | vite-plugin-pwa + Workbox |
| Build | Vite 6, Bun |
| Tests | Vitest + jsdom |

---

## Known Limitations

- **Local WASM mode** is non-functional: SwiftLaTeX CDNs are unreliable and the bundled package set is too limited for real thesis documents. The setting is available but cloud API is the reliable path.
- **Images** are not yet supported in the rich text editor (draft mode skips them; full mode expects base64 data URLs).
- **Bibliography** requires manual `\cite{}` in the raw editor or in rich text as plain text; there is no in-editor citation picker that inserts `\cite{}` automatically.
