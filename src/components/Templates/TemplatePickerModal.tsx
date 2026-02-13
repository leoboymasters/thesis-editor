import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { TEMPLATES, ThesisTemplate } from '../../data/templates';
import { useProjectStore } from '../../store/projectStore';

const DEFAULT_CUSTOM_PREAMBLE = `\\documentclass[12pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}`;

interface Props { onClose: () => void; }

export const TemplatePickerModal: React.FC<Props> = ({ onClose }) => {
  const [selected, setSelected] = useState<string>('general');
  const [customPreamble, setCustomPreamble] = useState(DEFAULT_CUSTOM_PREAMBLE);
  const { loadTemplate } = useProjectStore();

  const handleApply = () => {
    if (selected === 'custom') {
      const customTemplate: ThesisTemplate = {
        id: 'custom',
        name: 'Custom',
        description: '',
        preamble: customPreamble,
        sections: [
          { name: 'main-content.tex', tiptapContent: { type: 'doc', content: [
            { type: 'paragraph', content: [] }
          ]}}
        ],
      };
      loadTemplate(customTemplate);
    } else {
      const template = TEMPLATES.find(t => t.id === selected)!;
      loadTemplate(template);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-panel border border-border rounded-xl w-[520px] max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Choose a Template</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {TEMPLATES.map((t: ThesisTemplate) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selected === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-surface'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{t.name}</span>
                {selected === t.id && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted mt-1">{t.description}</p>
            </button>
          ))}

          {/* Custom template */}
          <div
            className={`rounded-lg border transition-colors ${
              selected === 'custom'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface'
            }`}
          >
            <button
              onClick={() => setSelected('custom')}
              className="w-full text-left p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Custom Preamble</span>
                {selected === 'custom' && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted mt-1">Paste your own LaTeX preamble — sections are written in rich text.</p>
            </button>
            {selected === 'custom' && (
              <div className="px-4 pb-4">
                <textarea
                  value={customPreamble}
                  onChange={e => setCustomPreamble(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary resize-none"
                  placeholder={DEFAULT_CUSTOM_PREAMBLE}
                />
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-foreground">Cancel</button>
          <button onClick={handleApply} className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};
