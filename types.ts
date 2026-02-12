export type FileType = 'file' | 'folder';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  content?: string; // Only for files
  isOpen?: boolean; // For folders
  isExpanded?: boolean; // For folders UI state
  language?: string; // e.g., 'latex', 'bibtex', 'plaintext'
}

export interface CompilationResult {
  success: boolean;
  pdfUrl?: string;
  logs: string[];
  timestamp: number;
}

export type Theme = 'light' | 'dark';

export interface EditorState {
  files: Record<string, FileSystemItem>;
  activeFileId: string | null;
  isCompiling: boolean;
  compilationResult: CompilationResult | null;
  sidebarVisible: boolean;
  previewVisible: boolean;
  theme: Theme;
}