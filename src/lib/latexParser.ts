import { FileSystemItem } from '../types';

export interface StructureItem {
    id: string; // Unique ID for the item
    type: 'chapter' | 'section' | 'subsection' | 'figure' | 'table';
    title: string;
    fileId: string;
    lineNumber: number;
    children?: StructureItem[];
}

export interface ParsedStructure {
    toc: StructureItem[];
    figures: StructureItem[];
    tables: StructureItem[];
}

// Regex patterns
const REGEX = {
    // Capture level, title
    section: /\\(chapter|section|subsection)\*?\{([^}]+)\}/g,
    // Capture environment type
    environment: /\\begin\{(figure|table)\}/g,
    // Capture caption content
    caption: /\\caption\{([^}]+)\}/g,
    // Capture input/include
    input: /\\(input|include)\{([^}]+)\}/g,
};

// Helper: Resolve file ID from path reference (e.g., 'chapters/chapter1')
const resolveFileId = (
    refPath: string,
    currentFileId: string,
    files: Record<string, FileSystemItem>
): string | null => {
    // Normalize refPath
    let targetPath = refPath.trim();
    if (!targetPath.endsWith('.tex')) targetPath += '.tex';

    // simplistic resolution: check if any file ends with this path
    // Ideally, we should implement full path resolution similar to compiler.ts
    // For now, matching by name is often enough for flat unique names, 
    // but let's try to match strict path if possible.

    const currentFile = files[currentFileId];
    // If absolute path logic isn't fully implemented in the file system model, 
    // we primarily search by name matching the basename.
    const basename = targetPath.split('/').pop();

    if (!basename) return null;

    for (const file of Object.values(files)) {
        if (file.type === 'file' && file.name === basename) {
            return file.id;
        }
    }

    return null;
};

export const parseProjectStructure = (
    files: Record<string, FileSystemItem>,
    rootFileId: string | null
): ParsedStructure => {
    const result: ParsedStructure = {
        toc: [],
        figures: [],
        tables: [],
    };

    const processedFiles = new Set<string>();

    // Recursive parser
    const parseFile = (fileId: string) => {
        if (processedFiles.has(fileId)) return;
        processedFiles.add(fileId);

        const file = files[fileId];
        if (!file || !file.content) return;

        const lines = file.content.split('\n');

        // We scan line by line to get line numbers easily
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;

            // 1. Check for Sections/Chapters
            // We manually check regex against line to verify it's not commented out
            if (!line.trim().startsWith('%')) {
                let match;

                // Reset lastIndex for global regexes is tricky if re-using, 
                // but here we instantiate new RegExp or use matchAll if complex.
                // Simple scan:
                const sectionMatch = line.match(/\\(chapter|section|subsection)\*?\{([^}]+)\}/);
                if (sectionMatch) {
                    const level = sectionMatch[1] as 'chapter' | 'section' | 'subsection';
                    const title = sectionMatch[2];
                    result.toc.push({
                        id: `${fileId}-${lineNum}`,
                        type: level,
                        title,
                        fileId,
                        lineNumber: lineNum,
                    });
                }

                // 2. Check for Figures/Tables
                // Note: Figures often span multiple lines. We detect \begin{figure} 
                // and look ahead for \caption.
                if (line.includes('\\begin{figure}')) {
                    // fast-forward to find caption in subsequent lines
                    let caption = 'Untitled Figure';
                    let captionLine = lineNum;

                    for (let j = i; j < Math.min(i + 20, lines.length); j++) {
                        const capMatch = lines[j].match(/\\caption\{([^}]+)\}/);
                        if (capMatch) {
                            caption = capMatch[1];
                            captionLine = j + 1;
                            break;
                        }
                        if (lines[j].includes('\\end{figure}')) break;
                    }

                    result.figures.push({
                        id: `${fileId}-${lineNum}`,
                        type: 'figure',
                        title: caption,
                        fileId,
                        lineNumber: captionLine, // Navigate to caption ideally
                    });
                }

                if (line.includes('\\begin{table}')) {
                    let caption = 'Untitled Table';
                    let captionLine = lineNum;

                    for (let j = i; j < Math.min(i + 20, lines.length); j++) {
                        const capMatch = lines[j].match(/\\caption\{([^}]+)\}/);
                        if (capMatch) {
                            caption = capMatch[1];
                            captionLine = j + 1;
                            break;
                        }
                        if (lines[j].includes('\\end{table}')) break;
                    }

                    result.tables.push({
                        id: `${fileId}-${lineNum}`,
                        type: 'table',
                        title: caption,
                        fileId,
                        lineNumber: captionLine,
                    });
                }

                // 3. Handle Inputs/Includes to parse recursively
                const inputMatch = line.match(/\\(input|include)\{([^}]+)\}/);
                if (inputMatch) {
                    const refPath = inputMatch[2];
                    const refId = resolveFileId(refPath, fileId, files);
                    if (refId) {
                        parseFile(refId);
                    }
                }
            }
        }
    };

    if (rootFileId) {
        parseFile(rootFileId);
    } else {
        // If no root, try to parse all tex files (structure might be messy but better than nothing)
        // Or just pick 'thesis-tex' if available (default in store)
        const defaultRoot = Object.values(files).find(f => f.name === 'thesis.tex' || f.name === 'main.tex');
        if (defaultRoot) parseFile(defaultRoot.id);
    }

    return result;
};
