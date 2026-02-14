import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { lookupDoi, formatBibtexEntry, CitationMeta } from '../../lib/doiLookup';
import { useProjectStore } from '../../store/projectStore';
import { FileSystemItem } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';

const TYPE_OPTIONS = [
  { value: 'article', label: 'Article' },
  { value: 'inproceedings', label: 'Conference Paper' },
  { value: 'book', label: 'Book' },
  { value: 'misc', label: 'Miscellaneous' },
] as const;

export const CitationModal: React.FC = () => {
  const { citationModalOpen, toggleCitationModal, files, updateFileContent } = useProjectStore();
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
      setError(e instanceof Error ? e.message : 'Lookup failed — check the DOI and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
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
    toggleCitationModal();
  };

  const field = (label: string, key: keyof CitationMeta, placeholder = '') => (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input
        value={meta[key] ?? ''}
        onChange={e => setMeta(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  );

  return (
    <Dialog open={citationModalOpen} onOpenChange={(open) => !open && toggleCitationModal()}>
      <DialogContent className="bg-panel border-border p-0 gap-0 w-[540px] max-w-[95vw] max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle>Add Citation</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">DOI Lookup</Label>
            <div className="flex gap-2">
              <Input
                value={doi}
                onChange={e => setDoi(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="10.1234/example or https://doi.org/..."
                className="flex-1 h-9"
              />
              <Button
                onClick={handleLookup}
                disabled={loading || !doi.trim()}
                size="sm"
                className="gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Lookup
              </Button>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3">
            {field('Citation Key *', 'key', 'e.g. smith2024')}
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <Select
                value={meta.type}
                onValueChange={(value) => setMeta(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {field('Title', 'title')}
            {field('Author(s)', 'author', 'Last, First and Last, First')}
            {field('Year', 'year', '2024')}
            {field('Journal / Venue', 'journal')}
            {field('DOI', 'doi')}
            {field('Volume', 'volume')}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Will append to references.bib</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={toggleCitationModal}>Cancel</Button>
            <Button onClick={handleInsert} disabled={!meta.key.trim()}>
              Insert Citation
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
