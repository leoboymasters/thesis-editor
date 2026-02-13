export interface ThesisTemplate {
  id: string;
  name: string;
  description: string;
  preamble: string;   // Raw LaTeX preamble
  sections: Array<{ name: string; tiptapContent: object }>;
}

export const TEMPLATES: ThesisTemplate[] = [
  {
    id: 'general',
    name: 'General University',
    description: 'Standard academic thesis format, works for most universities.',
    preamble: `\\documentclass[12pt,a4paper]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{hyperref}`,
    sections: [
      { name: 'abstract.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Abstract' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Write your abstract here...' }] }
      ]}},
      { name: 'chapter1.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Introduction' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Introduce your research here...' }] }
      ]}},
      { name: 'chapter2.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Literature Review' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Review related work here...' }] }
      ]}},
    ],
  },
  {
    id: 'ieee',
    name: 'IEEE Conference',
    description: 'IEEE double-column format for conference papers.',
    preamble: `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}`,
    sections: [
      { name: 'abstract.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Abstract' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Your abstract here...' }] }
      ]}},
      { name: 'introduction.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Introduce your paper...' }] }
      ]}},
    ],
  },
  {
    id: 'apa',
    name: 'APA Style',
    description: 'American Psychological Association 7th edition format.',
    preamble: `\\documentclass[12pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{setspace}
\\doublespacing
\\usepackage{hyperref}`,
    sections: [
      { name: 'abstract.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Abstract' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Abstract goes here (150-250 words)...' }] }
      ]}},
      { name: 'introduction.tex', tiptapContent: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'State the problem here...' }] }
      ]}},
    ],
  },
];
