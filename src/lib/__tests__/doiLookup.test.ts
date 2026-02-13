import { describe, it, expect } from 'vitest';
import { formatBibtexEntry } from '../doiLookup';

describe('formatBibtexEntry', () => {
  it('formats a minimal metadata object to BibTeX', () => {
    const meta = {
      key: 'smith2024',
      type: 'article',
      title: 'Deep Learning',
      author: 'Smith, John',
      year: '2024',
      journal: 'Nature',
    };
    const result = formatBibtexEntry(meta);
    expect(result).toContain('@article{smith2024,');
    expect(result).toContain('title = {Deep Learning}');
    expect(result).toContain('author = {Smith, John}');
    expect(result).toContain('year = {2024}');
  });

  it('skips undefined fields', () => {
    const meta = { key: 'x', type: 'misc', title: 'Test' };
    const result = formatBibtexEntry(meta);
    expect(result).not.toContain('author');
    expect(result).not.toContain('journal');
  });
});
