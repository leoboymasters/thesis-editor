import { FileSystemItem } from '../types';
import { jsonToLatex, isArticleClass, TiptapNode } from './jsonToLatex';

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
  // Detect document class from main.tex to decide heading mapping
  const mainTex = Object.values(files).find(
    f => f.type === 'file' && f.name === 'main.tex' && f.content
  );
  const articleMode = mainTex ? isArticleClass(mainTex.content!) : false;

  const result: Record<string, FileSystemItem> = {};
  for (const [id, file] of Object.entries(files)) {
    if (file.type === 'file' && file.name.endsWith('.tex') && file.content && isTiptapJson(file.content)) {
      const doc = JSON.parse(file.content) as TiptapNode;
      result[id] = { ...file, content: jsonToLatex(doc, { articleMode }) };
    } else {
      result[id] = file;
    }
  }
  return result;
};
