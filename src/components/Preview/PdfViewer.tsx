import React from 'react';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

import { DocumentStructure } from './DocumentStructure';
import { List } from 'lucide-react';

// Map progress message to percentage
const getProgressPercent = (progress: string | null): number => {
  if (!progress) return 10;
  const lower = progress.toLowerCase();
  if (lower.includes('cache')) return 20;
  if (lower.includes('analyz') || lower.includes('depend')) return 35;
  if (lower.includes('prepar') || lower.includes('structure')) return 50;
  if (lower.includes('send')) return 65;
  if (lower.includes('compil') || lower.includes('process')) return 80;
  if (lower.includes('done') || lower.includes('success')) return 100;
  return 15;
};

export const PdfViewer = () => {
  const { isCompiling, compilationResult, compileProgress } = useProjectStore();
  const [showStructure, setShowStructure] = React.useState(false);

  if (isCompiling) {
    const progressPercent = getProgressPercent(compileProgress);
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-6" />
        <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  if (!compilationResult) {
    // ... (keep existing no-result code)
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-muted text-center p-8">
        <div className="w-16 h-20 border-2 border-dashed border-border rounded mb-4 mx-auto opacity-50"></div>
        <p className="font-medium text-foreground">No compiled document yet</p>
        <p className="text-sm mt-2">Click <span className="text-primary font-medium">"Compile"</span> to generate the PDF</p>
      </div>
    );
  }

  if (!compilationResult.success) {
    const message = compilationResult.logs[0] ?? 'An unknown error occurred.';
    const isNetwork = message.includes('internet connection') || message.includes('compilation server');
    return (
      <div className="h-full bg-background p-6 overflow-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300 mb-1">Compilation failed</p>
              <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
              {isNetwork && (
                <ul className="mt-3 text-xs text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                  <li>Disable ad blockers or privacy extensions for this page</li>
                  <li>The compilation service may be temporarily down — try again in a moment</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      <div className="h-10 bg-panel border-b border-border flex items-center justify-between px-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted uppercase">Preview</span>
          <button
            onClick={() => setShowStructure(!showStructure)}
            className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${showStructure ? 'text-primary' : 'text-muted'}`}
            title="Toggle Document Outline"
          >
            <List size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={compilationResult.pdfUrl}
            download="thesis.pdf"
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-primary"
          >
            <Download size={14} /> Download
          </a>
        </div>
      </div>

      <div className="flex-1 flex relative h-full overflow-hidden">
        {/* Main PDF View */}
        <div className="flex-1 bg-black/5 dark:bg-black/20 relative">
          <object
            data={`${compilationResult.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            className="w-full h-full block"
          >
            <div className="flex flex-col items-center justify-center h-full text-muted p-4 text-center">
              <p className="mb-2">This browser does not support inline PDFs.</p>
              <a
                href={compilationResult.pdfUrl}
                download="thesis.pdf"
                className="text-primary hover:underline"
              >
                Download PDF to view
              </a>
            </div>
          </object>
        </div>

        {/* Structure Sidebar */}
        {showStructure && (
          <div className="w-64 border-l border-border bg-background flex flex-col h-full animate-in slide-in-from-right duration-200">
            <div className="h-full overflow-hidden">
              <DocumentStructure />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
