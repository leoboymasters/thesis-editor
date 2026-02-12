import { unzip, strFromU8 } from 'fflate';
import { FileSystemItem } from '../types';

// Helper to convert Uint8Array to base64
const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const parseZipFile = async (file: File): Promise<Record<string, FileSystemItem>> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  return new Promise((resolve, reject) => {
    unzip(bytes, (err, unzipped) => {
      if (err) return reject(err);
      
      const files: Record<string, FileSystemItem> = {};
      
      // Initialize root
      files['root'] = {
        id: 'root',
        name: 'root',
        type: 'folder',
        parentId: null,
        isExpanded: true
      };

      const pathIdMap = new Map<string, string>();
      pathIdMap.set('', 'root');

      // Helper to ensure parent folders exist recursively
      const getParentId = (fullPath: string): string => {
         const parts = fullPath.split('/');
         parts.pop(); // Remove self to get parent path
         
         if (parts.length === 0) return 'root';
         
         const parentPath = parts.join('/');
         if (pathIdMap.has(parentPath)) return pathIdMap.get(parentPath)!;
         
         // Recursively create grandparent
         const grandParentId = getParentId(parentPath);
         const folderName = parts[parts.length - 1];
         const newId = Math.random().toString(36).substr(2, 9);
         
         files[newId] = {
             id: newId,
             name: folderName,
             type: 'folder',
             parentId: grandParentId,
             isExpanded: true
         };
         pathIdMap.set(parentPath, newId);
         return newId;
      };

      // Iterate through unzipped entries
      for (const [path, content] of Object.entries(unzipped)) {
          // Skip Mac OS metadata and hidden files
          if (path.startsWith('__MACOSX') || path.includes('/.')) continue;
          
          const isDir = path.endsWith('/');
          const cleanPath = isDir ? path.slice(0, -1) : path;
          const parts = cleanPath.split('/');
          const name = parts[parts.length - 1];
          
          if (!name) continue;

          // Ensure parent exists
          const parentId = getParentId(cleanPath);

          if (isDir) {
              // Only create if not already created by getParentId
              if (!pathIdMap.has(cleanPath)) {
                   const newId = Math.random().toString(36).substr(2, 9);
                   files[newId] = {
                       id: newId,
                       name,
                       type: 'folder',
                       parentId,
                       isExpanded: true
                   };
                   pathIdMap.set(cleanPath, newId);
              }
          } else {
              // Determine file type based on extension
              const textExtensions = ['.tex', '.bib', '.cls', '.sty', '.txt', '.md', '.bbl', '.aux', '.log', '.toc'];
              const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf'];
              const isText = textExtensions.some(ext => name.toLowerCase().endsWith(ext));
              const isImage = imageExtensions.some(ext => name.toLowerCase().endsWith(ext));
              
              let fileContent = '[Binary Data]';
              let language = 'plaintext';
              
              if (isText) {
                  try {
                    fileContent = strFromU8(content);
                  } catch (e) {
                    console.warn('Failed to decode text file', name);
                  }
                  
                  if (name.endsWith('.tex')) language = 'latex';
                  else if (name.endsWith('.bib')) language = 'bibtex';
                  else if (name.endsWith('.cls') || name.endsWith('.sty')) language = 'latex';
              } else if (isImage) {
                  // Store images as base64 for proper handling
                  try {
                    const base64 = uint8ArrayToBase64(content);
                    const mimeType = name.toLowerCase().endsWith('.png') ? 'image/png' :
                                    name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' :
                                    name.toLowerCase().endsWith('.gif') ? 'image/gif' :
                                    name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
                    fileContent = `data:${mimeType};base64,${base64}`;
                    language = 'binary';
                  } catch (e) {
                    console.warn('Failed to encode binary file', name);
                  }
              }
              
              const newId = Math.random().toString(36).substr(2, 9);
              files[newId] = {
                  id: newId,
                  name,
                  type: 'file',
                  parentId,
                  content: fileContent,
                  language
              };
          }
      }
      
      resolve(files);
    });
  });
};