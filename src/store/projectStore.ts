import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { EditorState, FileSystemItem } from '../types';
import { INITIAL_FILES } from '@/data/constants';
import { compileProject, clearCompilationCache, CompilationMode } from '../lib/compiler';
import { serializeFilesForCompilation } from '../lib/compilerSerializer';
import { ThesisTemplate } from '../data/templates';
import { persistFiles } from '../lib/persistence';

interface ProjectStore extends EditorState {
  draftMode: boolean;
  compileProgress: string | null;
  fileNavigationRequest: { fileId: string; line: number } | null;
  compilationMode: CompilationMode;
  settingsOpen: boolean;
  editorMode: 'rich' | 'raw';
  templatePickerOpen: boolean;
  citationModalOpen: boolean;
  toggleTemplatePicker: () => void;
  toggleCitationModal: () => void;
  loadTemplate: (template: ThesisTemplate) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  toggleFolder: (id: string) => void;
  toggleSidebar: () => void;
  togglePreview: () => void;
  toggleTheme: () => void;
  toggleDraftMode: () => void;
  setCompilationMode: (mode: CompilationMode) => void;
  toggleSettings: () => void;
  toggleEditorMode: () => void;
  startCompilation: (forceRecompile?: boolean) => Promise<void>;
  createFile: (parentId: string, name: string, type: 'file' | 'folder') => void;
  deleteItem: (id: string) => void;
  importProject: (files: Record<string, FileSystemItem>) => void;
}

export const useProjectStore = create<ProjectStore>()(
  subscribeWithSelector((set, get) => ({
  files: INITIAL_FILES,
  activeFileId: 'thesis-tex',
  isCompiling: false,
  compilationResult: null,
  sidebarVisible: true,
  previewVisible: true,
  theme: 'light',
  draftMode: true, // Default to draft mode for faster compilation
  compileProgress: null,
  fileNavigationRequest: null,
  compilationMode: 'api' as const, // Default to API for reliability
  settingsOpen: false,
  editorMode: 'rich' as const,
  templatePickerOpen: false,
  citationModalOpen: false,

  setActiveFile: (id) => set({ activeFileId: id }),

  updateFileContent: (id, content) => set((state) => ({
    files: {
      ...state.files,
      [id]: { ...state.files[id], content },
    },
  })),

  toggleFolder: (id) => set((state) => ({
    files: {
      ...state.files,
      [id]: { ...state.files[id], isExpanded: !state.files[id].isExpanded },
    },
  })),

  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),

  togglePreview: () => set((state) => ({ previewVisible: !state.previewVisible })),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  toggleDraftMode: () => set((state) => ({ draftMode: !state.draftMode })),

  setCompilationMode: (mode) => set({ compilationMode: mode }),

  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),

  toggleEditorMode: () => set((state) => ({
    editorMode: state.editorMode === 'rich' ? 'raw' : 'rich'
  })),

  toggleTemplatePicker: () => set((state) => ({ templatePickerOpen: !state.templatePickerOpen })),

  toggleCitationModal: () => set((state) => ({ citationModalOpen: !state.citationModalOpen })),

  loadTemplate: (template) => {
    clearCompilationCache();
    const newFiles: Record<string, FileSystemItem> = {
      root: { id: 'root', name: 'root', type: 'folder', parentId: null, isExpanded: true },
    };

    // Preamble as raw LaTeX (NOT Tiptap JSON)
    newFiles['preamble'] = {
      id: 'preamble',
      name: 'preamble.tex',
      type: 'file',
      parentId: 'root',
      content: template.preamble,
      language: 'latex',
    };

    // Section files as Tiptap JSON
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

    // Empty references.bib
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

  startCompilation: async (forceRecompile = false) => {
    const { draftMode, compilationMode } = get();
    set({ isCompiling: true, compileProgress: 'Initializing...' });

    try {
      const { files, activeFileId } = get();
      const serializedFiles = serializeFilesForCompilation(files);
      const pdfUrl = await compileProject(serializedFiles, activeFileId, {
        draftMode,
        skipCache: forceRecompile,
        compilationMode,
        onProgress: (msg) => set({ compileProgress: msg })
      });

      set({
        isCompiling: false,
        compileProgress: null,
        compilationResult: {
          success: true,
          pdfUrl,
          logs: [
            'Compilation successful!',
            `Using ${compilationMode === 'local' ? 'local WASM' : 'cloud API'} compiler`,
            draftMode ? 'Draft mode: Images skipped for faster compilation' : 'Full compilation with images'
          ],
          timestamp: Date.now(),
        }
      });
    } catch (error: unknown) {
      console.error(error);

      let errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Network Error: Unable to reach the compilation server.';
      }

      set({
        isCompiling: false,
        compileProgress: null,
        compilationResult: {
          success: false,
          logs: [errorMessage],
          timestamp: Date.now(),
        }
      });
    }
  },

  createFile: (parentId, name, type) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem: FileSystemItem = {
      id,
      name,
      type,
      parentId,
      content: type === 'file' ? '' : undefined,
      isExpanded: true,
      language: name.endsWith('.tex') ? 'latex' : name.endsWith('.bib') ? 'bibtex' : 'plaintext'
    };

    // Clear compilation cache when files change
    clearCompilationCache();

    set((state) => ({
      files: { ...state.files, [id]: newItem }
    }));
  },

  deleteItem: (id) => {
    // Clear compilation cache when files change
    clearCompilationCache();

    set((state) => {
      const newFiles = { ...state.files };
      delete newFiles[id];
      return { files: newFiles, activeFileId: state.activeFileId === id ? null : state.activeFileId };
    });
  },

  importProject: (newFiles) => {
    // Clear compilation cache when importing new project
    clearCompilationCache();

    const fileList = Object.values(newFiles) as FileSystemItem[];

    let activeId: string | null = null;
    const priorityNames = ['thesis.tex', 'main.tex', 'index.tex'];

    const mainFile = fileList.find(f => f.type === 'file' && priorityNames.includes(f.name.toLowerCase()));

    if (mainFile) {
      activeId = mainFile.id;
    } else {
      const firstTex = fileList.find(f => f.type === 'file' && f.name.endsWith('.tex'));
      if (firstTex) activeId = firstTex.id;
    }

    set({
      files: newFiles,
      activeFileId: activeId,
      compilationResult: null
    });
  }
})));

const SAVE_DEBOUNCE_MS = 800;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

useProjectStore.subscribe(
  (state) => state.files,
  (files) => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      persistFiles(1, files).catch(console.error);
    }, SAVE_DEBOUNCE_MS);
  }
);
