# UI/UX Analysis: Shadcn UI Usage

This document analyzes where the Thesis Editor uses shadcn-style components and where it does not, so you can align the app with a consistent shadcn-based UI/UX.

---

## 1. What You Already Have (Shadcn-Style)

| Component | Location | Notes |
|-----------|----------|--------|
| **Button** | `src/components/ui/button.tsx` | CVA variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon. Uses Radix Slot. |
| **Input** | `src/components/ui/input.tsx` | Standard bordered input with focus ring. |
| **Label** | `src/components/ui/label.tsx` | Radix Label. |
| **Card** | `src/components/ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter. |
| **Alert** | `src/components/ui/alert.tsx` | Alert, AlertTitle, AlertDescription; variant: default, destructive. |
| **Avatar** | `src/components/ui/avatar.tsx` | Avatar, AvatarImage, AvatarFallback (Radix). |
| **DropdownMenu** | `src/components/ui/dropdown-menu.tsx` | Full set: Trigger, Content, Item, Label, Separator, etc. (Radix). |

**Screens that use these consistently:**

- **AuthScreen** – Uses `Button`, `Input`, `Label`, `Card`, `Alert` throughout. This is the only screen fully aligned with shadcn.

- **Sidebar (footer)** – Uses `Avatar` and `DropdownMenu` for the user menu.

---

## 2. Where Shadcn Is Not Used

### 2.1 TopBar (`src/components/Layout/TopBar.tsx`)

- **Current:** All controls are native `<button>` elements with custom Tailwind classes.
- **Issue:** Inconsistent with shadcn; no shared focus/disabled styles or variants.
- **Recommendation:** Use `Button` with:
  - `variant="ghost"` or `variant="secondary"` and `size="icon"` for icon-only buttons (sidebar toggle, theme, preview, settings).
  - `variant="outline"` or `variant="secondary"` for “New Project”, “Cite”, “Raw LaTeX”/“Rich Text”, “Draft”/“Full”, “Export .zip”.
  - `variant="default"` for “Compile” (primary action).

### 2.2 SettingsModal (`src/components/Layout/SettingsModal.tsx`)

- **Current:** Custom modal (backdrop `div` + centered `div`), no Dialog. Close and “Done” are native `<button>`; mode cards are `<button>` with custom borders.
- **Issue:** No shared modal primitive (focus trap, escape to close, accessibility). Button styles are ad-hoc.
- **Recommendation:**
  - Add shadcn **Dialog** (Radix Dialog) and use it for the modal shell (DialogContent, etc.).
  - Use **Button** for close (e.g. `variant="ghost"` `size="icon"`) and “Done” (`variant="default"`).
  - Optionally use **RadioGroup** + **Label** for “Compilation Mode” for semantics and keyboard use.

### 2.3 TemplatePickerModal (`src/components/Templates/TemplatePickerModal.tsx`)

- **Current:** Same custom modal pattern; native `<button>` for template cards, close, Cancel, and “Apply Template”; raw `<textarea>` for custom preamble.
- **Issue:** Same as SettingsModal (no Dialog, no shared Button/Input).
- **Recommendation:**
  - Use **Dialog** for the modal.
  - Use **Button** for close, “Cancel”, and “Apply Template” (e.g. `variant="ghost"` for Cancel, `variant="default"` for Apply).
  - Use **Input** or a shadcn **Textarea** (if you add it) for the custom preamble so styling and focus match the rest of the app.

### 2.4 CitationModal (`src/components/Citations/CitationModal.tsx`)

- **Current:** Same custom modal; native `<input>`, `<select>`, and `<button>` throughout; labels are plain `<label>` with custom classes.
- **Issue:** No Dialog, no Input/Select/Label/Button from ui; form looks different from AuthScreen.
- **Recommendation:**
  - Use **Dialog** for the modal.
  - Use **Input** for DOI and all text fields; use **Label** for each field.
  - Add shadcn **Select** for “Type” (article, inproceedings, book, misc) and use it instead of native `<select>`.
  - Use **Button** for “Lookup”, “Cancel”, and “Insert Citation” (e.g. primary for Lookup and Insert, ghost/outline for Cancel).

### 2.5 PdfViewer (`src/components/Preview/PdfViewer.tsx`)

- **Current:** Native `<button>` for outline toggle, native `<a>` for Download; error state is a custom red box with custom typography.
- **Issue:** Buttons/links not using Button; error UI not using Alert.
- **Recommendation:**
  - Use **Button** `variant="ghost"` `size="icon"` for outline toggle; use **Button** `variant="ghost"` or `variant="link"` for Download if you want it to look like a link.
  - Use **Alert** `variant="destructive"` for the compilation error block (icon + title + description) so it matches AuthScreen errors and theme.

### 2.6 Sidebar – File Tree (`src/components/Layout/Sidebar.tsx`)

- **Current:** File/folder rows are `<div>` with custom hover/active styles; “Project Files” header uses native `<button>` for upload/add.
- **Issue:** Minor: could use **Button** `variant="ghost"` `size="icon"` for header actions to match TopBar and PdfViewer.
- **Recommendation:** Optional: use **Button** for the upload and “Add File” icons for consistency.

---

## 3. Missing Shadcn Primitives

Adding these would align the app with a full shadcn-style stack:

| Component | Purpose | Use in Thesis Editor |
|-----------|---------|----------------------|
| **Dialog** | Modal overlay, focus trap, escape, accessibility | SettingsModal, TemplatePickerModal, CitationModal |
| **Select** | Dropdown for single choice (Type in CitationModal) | CitationModal “Type” field |
| **Textarea** | Multi-line input with same style as Input | TemplatePickerModal custom preamble |
| **Progress** (optional) | Progress bar with semantic styling | PdfViewer “Compiling…” state |

You can add them via `npx shadcn@latest add dialog select textarea progress` (or the manual install steps from [ui.shadcn.com](https://ui.shadcn.com)).

---

## 4. Theme / UX Consistency

- **AuthScreen background:** Uses `bg-gray-50` instead of theme `bg-background`. Consider `bg-background` so auth respects light/dark theme.
- **AuthScreen footer:** Uses `text-gray-400`; consider `text-muted-foreground` for theme consistency.
- **Modal radii:** Settings uses `rounded-xl`, TemplatePicker and Citation use `rounded-xl`; Dialog from shadcn typically uses `rounded-lg` (or you can override to `rounded-xl` to keep current look).
- **Button radii:** TopBar has a mix of `rounded-md`, `rounded-lg`, and `rounded-full` (Compile). Using **Button** everywhere would standardize to your `buttonVariants` (e.g. `rounded-md` by default).

---

## 5. Summary Table

| Area | Uses shadcn? | Main gap |
|------|----------------|----------|
| AuthScreen | Yes | — |
| Sidebar (user block) | Yes (Avatar, DropdownMenu) | — |
| Sidebar (file tree) | No | Optional: Button for header actions |
| TopBar | No | Use Button for all actions |
| SettingsModal | No | Dialog + Button (and optionally RadioGroup) |
| TemplatePickerModal | No | Dialog + Button + Input/Textarea |
| CitationModal | No | Dialog + Input + Label + Select + Button |
| PdfViewer | No | Button for actions; Alert for error state |

**Bottom line:** Only AuthScreen and the Sidebar user menu use shadcn consistently. Modals and toolbars use custom markup and native form controls. Introducing **Dialog** and using **Button**, **Input**, **Label**, **Select**, and **Alert** in the modals and TopBar/PdfViewer would make the whole app feel like a single shadcn-based UI.
