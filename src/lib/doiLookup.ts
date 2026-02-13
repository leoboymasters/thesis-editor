export interface CitationMeta {
  key: string;
  type: string;
  title?: string;
  author?: string;
  year?: string;
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  booktitle?: string;
}

export const formatBibtexEntry = (meta: CitationMeta): string => {
  const fields: [string, string | undefined][] = [
    ['title', meta.title],
    ['author', meta.author],
    ['year', meta.year],
    ['journal', meta.journal],
    ['volume', meta.volume],
    ['number', meta.number],
    ['pages', meta.pages],
    ['publisher', meta.publisher],
    ['booktitle', meta.booktitle],
    ['doi', meta.doi],
    ['url', meta.url],
  ];
  const lines = fields
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `  ${k} = {${v}}`);
  return `@${meta.type}{${meta.key},\n${lines.join(',\n')}\n}`;
};

export const lookupDoi = async (doi: string): Promise<CitationMeta> => {
  const clean = doi.trim().replace(/^https?:\/\/doi\.org\//i, '');
  const url = `https://api.crossref.org/works/${encodeURIComponent(clean)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ThesisFlow/1.0' } });
  if (!res.ok) throw new Error(`DOI not found: ${doi}`);
  const json = await res.json();
  const w = json.message;

  const authors = (w.author ?? [])
    .map((a: { family?: string; given?: string }) => [a.family, a.given].filter(Boolean).join(', '))
    .join(' and ');

  const year = w.published?.['date-parts']?.[0]?.[0]?.toString() ?? '';
  const key = (w.author?.[0]?.family ?? 'unknown').toLowerCase() + year;
  const type = w.type === 'journal-article' ? 'article'
             : w.type === 'proceedings-article' ? 'inproceedings'
             : 'misc';

  return {
    key,
    type,
    title: w.title?.[0],
    author: authors,
    year,
    journal: w['container-title']?.[0],
    volume: w.volume,
    number: w.issue,
    pages: w.page,
    doi: clean,
    publisher: w.publisher,
  };
};
