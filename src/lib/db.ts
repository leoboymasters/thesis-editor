import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Project {
  id?: number;
  title: string;
  templateId: string;
  lastModified: number;
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
  originalId?: string;
  originalParentId?: string | null;
}

export interface Asset {
  id?: number;
  projectId: number;
  fileName: string;
  blob: Blob;
}

export class ResearchereDB extends Dexie {
  projects!: Table<Project, number>;
  files!: Table<DBFile, number>;
  assets!: Table<Asset, number>;

  constructor() {
    super('ResearchereDB');
    this.version(1).stores({
      projects: '++id, title, templateId, lastModified',
      files: '++id, projectId, name, type, parentFolderId',
      assets: '++id, projectId, fileName',
    });
  }
}

export const db = new ResearchereDB();
