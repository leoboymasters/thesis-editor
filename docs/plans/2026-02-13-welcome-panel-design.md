# Welcome Panel Design

**Date:** 2026-02-13

## Goal

Show instructional content whenever no file is active (empty state), so first-time users understand the workflow without any LaTeX knowledge.

## Trigger

`activeFileId === null` — the editor area's existing empty state.

## What It Shows

A centered welcome card with:
- App name + tagline ("Write your thesis. No LaTeX required.")
- Four numbered steps: Pick template → Write → Cite → Compile
- "New Project →" CTA button calling `toggleTemplatePicker()`

## Behavior

- Appears on every app load when no project is active
- Disappears automatically once a template is loaded and a file becomes active
- No new state required — purely presentational

## Files Changed

- `src/components/Editor/RichTextEditor.tsx` — replace the existing `if (!activeFile) return ...` empty state branch only
