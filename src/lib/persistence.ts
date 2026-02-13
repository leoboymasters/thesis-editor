import { db, DBFile } from './db';
import { FileSystemItem } from '../types';

/** Saves all in-memory files to IndexedDB for a given projectId */
export const persistFiles = async (
  projectId: number,
  files: Record<string, FileSystemItem>
): Promise<void> => {
  await db.transaction('rw', db.files, async () => {
    // Delete existing records for this project, then bulk-insert fresh
    await db.files.where('projectId').equals(projectId).delete();
    const rows: DBFile[] = Object.values(files).map(f => ({
      projectId,
      name: f.name,
      type: f.type,
      content: f.content,
      parentFolderId: null,
      language: f.language,
      isExpanded: f.isExpanded,
    }));
    if (rows.length > 0) {
      await db.files.bulkAdd(rows);
    }
  });
};

/** Loads all files from IndexedDB for a given projectId */
export const loadFiles = async (
  projectId: number
): Promise<Record<string, FileSystemItem>> => {
  const rows = await db.files.where('projectId').equals(projectId).toArray();
  if (rows.length === 0) return {};
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
