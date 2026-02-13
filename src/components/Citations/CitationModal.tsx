import React, { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { lookupDoi, formatBibtexEntry, CitationMeta } from '../../lib/doiLookup';
import { useProjectStore } from '../../store/projectStore';
import { FileSystemItem } from '../../types';

interface Props { onClose: () => void; }

export const CitationModal: React.FC<Props> = ({ onClose }) => {
  const { files, updateFileContent } = useProjectStore();
  const [doi, setDoi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<CitationMeta>({
    key: '', type: 'article', title: '', author: '', year: '', journal: '', doi: ''
  });

  const handleLookup = async () => {
    if (!doi.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await lookupDoi(doi);
      setMeta(result);
    } catch (e) {
      setError('DOI not found — please enter details manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    // Find the references.bib file
    const bibFile = Object.values(files).find(
      (f: FileSystemItem) => f.type === 'file' && f.name === 'references.bib'
    );
    if (!bibFile) {
      setError('No references.bib file found. Create one first by loading a template.');
      return;
    }
    const entry = formatBibtexEntry(meta);
    const currentContent = bibFile.content ?? '';
    const newContent = currentContent ? `${currentContent}\n\n${entry}` : entry;
    updateFileContent(bibFile.id, newContent);
    onClose();
  };

  const field = (label: string, key: keyof CitationMeta, placeholder = '') => (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      <input
        value={meta[key] ?? ''}
        onChange={e => setMeta(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-panel border border-border rounded-xl w-[540px] max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add Citation</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* DOI Lookup */}
          <div>
            <label className="block text-xs text-muted mb-1">DOI Lookup</label>
            <div className="flex gap-2">
              <input
                value={doi}
                onChange={e => setDoi(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="10.1234/example or https://doi.org/..."
                className="flex-1 px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleLookup}
                disabled={loading || !doi.trim()}
                className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Lookup
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3">
            {field('Citation Key *', 'key', 'e.g. smith2024')}
            <div>
              <label className="block text-xs text-muted mb-1">Type</label>
              <select
                value={meta.type}
                onChange={e => setMeta(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              >
                <option value="article">Article</option>
                <option value="inproceedings">Conference Paper</option>
                <option value="book">Book</option>
                <option value="misc">Miscellaneous</option>
              </select>
            </div>
            {field('Title', 'title')}
            {field('Author(s)', 'author', 'Last, First and Last, First')}
            {field('Year', 'year', '2024')}
            {field('Journal / Venue', 'journal')}
            {field('DOI', 'doi')}
            {field('Volume', 'volume')}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-between items-center">
          <p className="text-xs text-muted">Will append to references.bib</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-foreground">Cancel</button>
            <button
              onClick={handleInsert}
              disabled={!meta.key.trim()}
              className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Insert Citation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
