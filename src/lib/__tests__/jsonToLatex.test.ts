import { describe, it, expect } from 'vitest';
import { jsonToLatex } from '../jsonToLatex';

describe('jsonToLatex', () => {
  it('converts a plain paragraph', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }],
    };
    expect(jsonToLatex(doc)).toContain('Hello world');
  });

  it('converts heading level 1 to \\chapter', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Introduction' }] }],
    };
    expect(jsonToLatex(doc)).toContain('\\chapter{Introduction}');
  });

  it('converts heading level 2 to \\section', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Background' }] }],
    };
    expect(jsonToLatex(doc)).toContain('\\section{Background}');
  });

  it('converts heading level 3 to \\subsection', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Related Work' }] }],
    };
    expect(jsonToLatex(doc)).toContain('\\subsection{Related Work}');
  });

  it('converts bold marks to \\textbf', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'important', marks: [{ type: 'bold' }] }],
      }],
    };
    expect(jsonToLatex(doc)).toContain('\\textbf{important}');
  });

  it('converts italic marks to \\textit', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'term', marks: [{ type: 'italic' }] }],
      }],
    };
    expect(jsonToLatex(doc)).toContain('\\textit{term}');
  });

  it('converts bullet list to itemize environment', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }] },
        ],
      }],
    };
    const result = jsonToLatex(doc);
    expect(result).toContain('\\begin{itemize}');
    expect(result).toContain('\\item First');
    expect(result).toContain('\\item Second');
    expect(result).toContain('\\end{itemize}');
  });

  it('converts ordered list to enumerate environment', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'orderedList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Step one' }] }] },
        ],
      }],
    };
    const result = jsonToLatex(doc);
    expect(result).toContain('\\begin{enumerate}');
    expect(result).toContain('\\item Step one');
    expect(result).toContain('\\end{enumerate}');
  });

  it('escapes special LaTeX characters', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '50% & 100$' }] }],
    };
    const result = jsonToLatex(doc);
    expect(result).toContain('50\\%');
    expect(result).toContain('\\&');
    expect(result).toContain('100\\$');
  });

  it('wraps output in document environment', () => {
    const doc = { type: 'doc', content: [] };
    const result = jsonToLatex(doc, { wrapDocument: true, preamble: '\\documentclass{article}' });
    expect(result).toContain('\\begin{document}');
    expect(result).toContain('\\end{document}');
  });
});
