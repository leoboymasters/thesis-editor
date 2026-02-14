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

    // Helper to calculate line number from index
    const getLineNumber = (content: string, index: number) => {
        return content.substring(0, index).split('\n').length;
    };

    // Recursive parser
    const parseFile = (fileId: string) => {
        if (processedFiles.has(fileId)) return;
        processedFiles.add(fileId);

        const file = files[fileId];
        if (!file || !file.content) return;

        const content = file.content;
        
        // Remove comments for parsing but keep indices relative to original content
        // Actually, replacing comments with spaces of same length preserves indices
        const cleanContent = content.replace(/%.*$/gm, (match) => ' '.repeat(match.length));

        // 1. Check for Sections/Chapters (Multi-line supported via [\s\S]*?)
        const sectionRegex = /\\(chapter|section|subsection)\*?\{([\s\S]*?)\}/g;
        let match;
        while ((match = sectionRegex.exec(cleanContent)) !== null) {
            const level = match[1] as 'chapter' | 'section' | 'subsection';
            const title = match[2].trim().replace(/\s+/g, ' ');
            const lineNumber = getLineNumber(content, match.index);

            result.toc.push({
                id: `${fileId}-${match.index}`,
                type: level,
                title,
                fileId,
                lineNumber,
            });
        }

        // 2. Check for Figures/Tables
        const envRegex = /\\begin\{(figure|table)\}([\s\S]*?)\\end\{\1\}/g;
        while ((match = envRegex.exec(cleanContent)) !== null) {
            const type = match[1] as 'figure' | 'table';
            const body = match[2];
            const startLine = getLineNumber(content, match.index);
            
            // Find caption within environment
            const capMatch = body.match(/\\caption\{([\s\S]*?)\}/);
            const caption = capMatch ? capMatch[1].trim().replace(/\s+/g, ' ') : `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const captionLine = capMatch 
                ? getLineNumber(content, match.index + (capMatch.index ?? 0) + '\\begin{figure}'.length) // Approximation
                : startLine;

            const item: StructureItem = {
                id: `${fileId}-${match.index}`,
                type: type,
                title: caption,
                fileId,
                lineNumber: captionLine,
            };

            if (type === 'figure') result.figures.push(item);
            else result.tables.push(item);
        }

        // 3. Handle Inputs/Includes
        const inputRegex = /\\(input|include)\{([^}]+)\}/g;
        while ((match = inputRegex.exec(cleanContent)) !== null) {
            const refPath = match[2].trim();
            const refId = resolveFileId(refPath, fileId, files);
            if (refId) {
                parseFile(refId);
            }
        }
    };

    if (rootFileId) {
        parseFile(rootFileId);
    } else {
        const defaultRoot = Object.values(files).find(f => 
            f.name.toLowerCase() === 'thesis.tex' || 
            f.name.toLowerCase() === 'main.tex'
        );
        if (defaultRoot) parseFile(defaultRoot.id);
    }

    return result;
};
