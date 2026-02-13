import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { TEMPLATES, ThesisTemplate } from '../../data/templates';
import { useProjectStore } from '../../store/projectStore';

interface Props { onClose: () => void; }

export const TemplatePickerModal: React.FC<Props> = ({ onClose }) => {
  const [selected, setSelected] = useState<string>('general');
  const { loadTemplate } = useProjectStore();

  const handleApply = () => {
    const template = TEMPLATES.find(t => t.id === selected)!;
    loadTemplate(template);
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
