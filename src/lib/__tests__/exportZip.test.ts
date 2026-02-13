import { describe, it, expect } from 'vitest';
import { buildExportManifest } from '../exportZip';

describe('buildExportManifest', () => {
  it('serializes tiptap files to latex and returns a flat name->content map', () => {
    const files = {
      'root': { id: 'root', name: 'root', type: 'folder' as const, parentId: null },
      'f1': {
        id: 'f1', name: 'chapter1.tex', type: 'file' as const, parentId: 'root',
        content: JSON.stringify({ type: 'doc', content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Intro' }] }
        ]})
      },
      'f2': { id: 'f2', name: 'refs.bib', type: 'file' as const, parentId: 'root', content: '@article{x}' }
    };
    const manifest = buildExportManifest(files);
    expect(manifest['chapter1.tex']).toContain('\\chapter{Intro}');
    expect(manifest['refs.bib']).toBe('@article{x}');
    expect(manifest['root']).toBeUndefined(); // folders excluded
  });

  it('handles files with undefined content gracefully', () => {
    const files = {
      'f1': { id: 'f1', name: 'empty.tex', type: 'file' as const, parentId: null, content: undefined }
    };
    const manifest = buildExportManifest(files);
    // File with undefined content should be excluded from manifest
    expect(manifest['empty.tex']).toBeUndefined();
  });
});
