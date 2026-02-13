export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

export interface SerializerOptions {
  wrapDocument?: boolean;
  preamble?: string;
  /** When true, h1→\section instead of h1→\chapter (for article/IEEEtran classes) */
  articleMode?: boolean;
}

const ESCAPE_MAP: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '$': '\\$',
  '&': '\\&',
  '%': '\\%',
  '#': '\\#',
  '_': '\\_',
  '^': '\\textasciicircum{}',
  '~': '\\textasciitilde{}',
};

const ESCAPE_PATTERN = /[\\{}$&%#_^~]/g;

const escapeLatex = (text: string): string =>
  text.replace(ESCAPE_PATTERN, (ch) => ESCAPE_MAP[ch]);

const applyMarks = (text: string, marks: TiptapNode['marks']): string => {
  if (!marks || marks.length === 0) return text;
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case 'bold':      return `\\textbf{${acc}}`;
      case 'italic':    return `\\textit{${acc}}`;
      case 'code':      return `\\texttt{${acc}}`;
      case 'underline': return `\\underline{${acc}}`;
      default:          return acc;
    }
  }, text);
};

const serializeInline = (node: TiptapNode): string => {
  if (node.type === 'text') {
    const escaped = escapeLatex(node.text ?? '');
    return applyMarks(escaped, node.marks);
  }
  if (node.type === 'hardBreak') return '\\\\';
  return serializeNode(node);
};

let _articleMode = false;

const serializeNode = (node: TiptapNode): string => {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(serializeNode).join('\n\n');

    case 'paragraph': {
      const inner = (node.content ?? []).map(serializeInline).join('');
      return inner || '';
    }

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const inner = (node.content ?? []).map(serializeInline).join('');
      const cmds = _articleMode
        ? ['section', 'subsection', 'subsubsection', 'paragraph']
        : ['chapter', 'section', 'subsection', 'subsubsection'];
      const cmd = cmds[Math.min(level - 1, cmds.length - 1)];
      return `\\${cmd}{${inner}}`;
    }

    case 'bulletList': {
      const items = (node.content ?? []).map(serializeNode).join('\n');
      return `\\begin{itemize}\n${items}\n\\end{itemize}`;
    }

    case 'orderedList': {
      const items = (node.content ?? []).map(serializeNode).join('\n');
      return `\\begin{enumerate}\n${items}\n\\end{enumerate}`;
    }

    case 'listItem': {
      const inner = (node.content ?? []).map(serializeNode).join(' ').trim();
      return `\\item ${inner}`;
    }

    case 'blockquote': {
      const inner = (node.content ?? []).map(serializeNode).join('\n');
      return `\\begin{quote}\n${inner}\n\\end{quote}`;
    }

    case 'codeBlock': {
      const inner = (node.content ?? []).map(n => n.text ?? '').join('');
      return `\\begin{verbatim}\n${inner}\n\\end{verbatim}`;
    }

    case 'horizontalRule':
      return '\\hrule';

    case 'hardBreak':
      return '\\\\';

    default:
      return (node.content ?? []).map(serializeNode).join('');
  }
};

// Document classes that do NOT support \chapter
const ARTICLE_CLASSES = /\\documentclass(\[[^\]]*\])?\{(article|IEEEtran|scrartcl|amsart|beamer|standalone|acmart|elsarticle)\}/;

export const isArticleClass = (preamble: string): boolean => ARTICLE_CLASSES.test(preamble);

export const jsonToLatex = (doc: TiptapNode, options: SerializerOptions = {}): string => {
  _articleMode = options.articleMode ?? false;
  const body = serializeNode(doc);
  if (!options.wrapDocument) return body;
  const preamble = options.preamble ?? '\\documentclass{article}';
  return `${preamble}\n\\begin{document}\n${body}\n\\end{document}`;
};
