import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { TEMPLATES, ThesisTemplate } from '../../data/templates';
import { useProjectStore } from '../../store/projectStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';

const DEFAULT_CUSTOM_PREAMBLE = `\\documentclass[12pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}`;

export const TemplatePickerModal: React.FC = () => {
  const [selected, setSelected] = useState<string>('general');
  const [customPreamble, setCustomPreamble] = useState(DEFAULT_CUSTOM_PREAMBLE);
  const { templatePickerOpen, toggleTemplatePicker, loadTemplate } = useProjectStore();

  const handleApply = () => {
    if (selected === 'custom') {
      const customTemplate: ThesisTemplate = {
        id: 'custom',
        name: 'Custom',
        description: '',
        preamble: customPreamble,
        sections: [
          { name: 'main-content.tex', tiptapContent: { type: 'doc', content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Start writing your document here.' }] }
          ]}}
        ],
      };
      loadTemplate(customTemplate);
    } else {
      const template = TEMPLATES.find(t => t.id === selected)!;
      loadTemplate(template);
    }
    toggleTemplatePicker();
  };

  return (
    <Dialog open={templatePickerOpen} onOpenChange={(open) => !open && toggleTemplatePicker()}>
      <DialogContent className="bg-panel border-border p-0 gap-0 w-[520px] max-w-[95vw] max-h-[80vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {TEMPLATES.map((t: ThesisTemplate) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-colors',
                selected === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-surface'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{t.name}</span>
                {selected === t.id && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
            </button>
          ))}

          <div
            className={cn(
              'rounded-lg border transition-colors',
              selected === 'custom' ? 'border-primary bg-primary/5' : 'border-border bg-surface'
            )}
          >
            <button
              type="button"
              onClick={() => setSelected('custom')}
              className="w-full text-left p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Custom Preamble</span>
                {selected === 'custom' && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Paste your own LaTeX preamble — sections are written in rich text.</p>
            </button>
            {selected === 'custom' && (
              <div className="px-4 pb-4">
                <Textarea
                  value={customPreamble}
                  onChange={e => setCustomPreamble(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="w-full text-xs font-mono resize-none"
                  placeholder={DEFAULT_CUSTOM_PREAMBLE}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <Button variant="ghost" onClick={toggleTemplatePicker}>Cancel</Button>
          <Button onClick={handleApply}>Apply Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
