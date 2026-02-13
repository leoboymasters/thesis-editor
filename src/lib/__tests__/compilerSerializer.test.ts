import { describe, it, expect } from 'vitest';
import { serializeFilesForCompilation } from '../compilerSerializer';

describe('serializeFilesForCompilation', () => {
  it('passes through raw LaTeX content unchanged', () => {
    const files = {
      'f1': { id: 'f1', name: 'main.tex', type: 'file' as const, parentId: null, content: '\\documentclass{article}' }
    };
    const result = serializeFilesForCompilation(files);
    expect(result['f1'].content).toBe('\\documentclass{article}');
  });

  it('serializes Tiptap JSON to LaTeX for .tex files', () => {
    const tiptapDoc = JSON.stringify({
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Intro' }] }]
    });
    const files = {
      'f1': { id: 'f1', name: 'chapter1.tex', type: 'file' as const, parentId: null, content: tiptapDoc }
    };
    const result = serializeFilesForCompilation(files);
    expect(result['f1'].content).toContain('\\chapter{Intro}');
    expect(result['f1'].content).not.toContain('"type":"doc"');
  });

  it('leaves non-.tex files unchanged', () => {
    const bibContent = '@article{key, title={A paper}}';
    const files = {
      'b1': { id: 'b1', name: 'refs.bib', type: 'file' as const, parentId: null, content: bibContent }
    };
    const result = serializeFilesForCompilation(files);
    expect(result['b1'].content).toBe(bibContent);
  });

  it('handles folder entries by passing through unchanged', () => {
    const files = {
      'root': { id: 'root', name: 'root', type: 'folder' as const, parentId: null }
    };
    const result = serializeFilesForCompilation(files);
    expect(result['root']).toEqual(files['root']);
  });
});
