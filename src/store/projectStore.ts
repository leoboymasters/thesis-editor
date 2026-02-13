import { create } from 'zustand';
import { EditorState, FileSystemItem } from '../types';
import { INITIAL_FILES } from '@/data/constants';
import { compileProject, clearCompilationCache, CompilationMode } from '../lib/compiler';

interface ProjectStore extends EditorState {
  draftMode: boolean;
  compileProgress: string | null;
  fileNavigationRequest: { fileId: string; line: number } | null;
  compilationMode: CompilationMode;
  settingsOpen: boolean;
  editorMode: 'rich' | 'raw';
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

export const useProjectStore = create<ProjectStore>((set, get) => ({
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

  startCompilation: async (forceRecompile = false) => {
    const { draftMode, compilationMode } = get();
    set({ isCompiling: true, compileProgress: 'Initializing...' });

    try {
      const { files, activeFileId } = get();
      const pdfUrl = await compileProject(files, activeFileId, {
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
}));
