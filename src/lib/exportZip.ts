import { strToU8, zip } from 'fflate';
import { FileSystemItem } from '../types';
import { serializeFilesForCompilation } from './compilerSerializer';

/** Returns a flat { filename: latexContent } map for all files with content */
export const buildExportManifest = (
  files: Record<string, FileSystemItem>
): Record<string, string> => {
  const serialized = serializeFilesForCompilation(files);
  const manifest: Record<string, string> = {};
  for (const file of Object.values(serialized)) {
    if (file.type === 'file' && file.content !== undefined) {
      manifest[file.name] = file.content;
    }
  }
  return manifest;
};

/** Zips all project files and triggers a browser download */
export const exportProjectZip = (
  files: Record<string, FileSystemItem>,
  projectTitle = 'thesis'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const manifest = buildExportManifest(files);
    const zipData: Record<string, Uint8Array> = {};
    for (const [name, content] of Object.entries(manifest)) {
      zipData[name] = strToU8(content);
    }
    zip(zipData, (err, data) => {
      if (err) return reject(err);
      const blob = new Blob([data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    });
  });
};
