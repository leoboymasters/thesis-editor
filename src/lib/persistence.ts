import { db, DBFile } from './db';
import { FileSystemItem } from '../types';

/** Saves all in-memory files to IndexedDB for a given projectId */
export const persistFiles = async (
  projectId: number,
  files: Record<string, FileSystemItem>
): Promise<void> => {
  await db.transaction('rw', [db.files], async () => {
    // Get existing files from DB for this project
    const existing = await db.files.where('projectId').equals(projectId).toArray();
    const existingMap = new Map<string, DBFile>(
        existing.map(f => [f.originalId || String(f.id), f])
    );

    const memoryFiles = Object.values(files);
    const toAdd: DBFile[] = [];
    const toUpdate: DBFile[] = [];
    const processedIds = new Set<string>();

    for (const f of memoryFiles) {
        const row: DBFile = {
            projectId,
            name: f.name,
            type: f.type,
            content: f.content,
            parentFolderId: null,
            language: f.language,
            isExpanded: f.isExpanded,
            originalId: f.id,
            originalParentId: f.parentId,
        };

        const existingRow = existingMap.get(f.id);
        if (existingRow) {
            // Found existing, update if changed
            row.id = existingRow.id; // Keep PK
            
            // Shallow compare some fields to avoid redundant writes if possible
            // But content is often changed, so we'll just put it for now
            toUpdate.push(row);
        } else {
            toAdd.push(row);
        }
        processedIds.add(f.id);
    }

    // Identifiy files to delete (exist in DB but not in memory)
    const toDeleteIds = existing
        .filter(f => f.originalId && !processedIds.has(f.originalId))
        .map(f => f.id!)
        .filter((id): id is number => id !== undefined);

    if (toAdd.length > 0) await db.files.bulkAdd(toAdd);
    if (toUpdate.length > 0) await db.files.bulkPut(toUpdate);
    if (toDeleteIds.length > 0) await db.files.bulkDelete(toDeleteIds);
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
    const id = row.originalId ?? String(row.id!);
    files[id] = {
      id,
      name: row.name,
      type: row.type as 'file' | 'folder',
      parentId: row.originalParentId ?? null,
      content: row.content,
      language: row.language,
      isExpanded: row.isExpanded,
    };
  }
  return files;
};
