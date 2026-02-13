import { FileSystemItem } from '../types';
import { jsonToLatex, TiptapNode } from './jsonToLatex';

/**
 * Detects if a string is a Tiptap JSON document.
 */
export const isTiptapJson = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return parsed?.type === 'doc' && Array.isArray(parsed?.content);
  } catch {
    return false;
  }
};

/**
 * Returns a new files map where .tex files with Tiptap JSON content
 * have been serialized to LaTeX strings. Other files pass through unchanged.
 */
export const serializeFilesForCompilation = (
  files: Record<string, FileSystemItem>
): Record<string, FileSystemItem> => {
  const result: Record<string, FileSystemItem> = {};
  for (const [id, file] of Object.entries(files)) {
    if (file.type === 'file' && file.name.endsWith('.tex') && file.content && isTiptapJson(file.content)) {
      const doc = JSON.parse(file.content) as TiptapNode;
      result[id] = { ...file, content: jsonToLatex(doc) };
    } else {
      result[id] = file;
    }
  }
  return result;
};
