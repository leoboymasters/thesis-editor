import React from 'react';
import { Play, Settings, PanelLeftClose, PanelLeft, MonitorPlay, Sun, Moon, Zap, Image, RefreshCw, Code2, Type, Plus, BookMarked, Download } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { exportProjectZip } from '../../lib/exportZip';

export const TopBar = () => {
  const {
    startCompilation,
    isCompiling,
    sidebarVisible,
    toggleSidebar,
    togglePreview,
    previewVisible,
    theme,
    toggleTheme,
    draftMode,
    toggleDraftMode,
    activeFileId,
    files,
    compileProgress,
    toggleSettings,
    compilationMode,
    editorMode,
    toggleEditorMode,
    toggleTemplatePicker,
    toggleCitationModal,
  } = useProjectStore();

  const activeFile = activeFileId ? files[activeFileId] : null;

  return (
    <header className="h-14 bg-panel border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-foreground font-semibold tracking-tight">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
            <span className="font-serif font-bold italic">Tx</span>
          </div>
          <span>Thesis<span className="font-light text-muted">Editor</span></span>
        </div>

        <div className="h-6 w-px bg-border mx-2"></div>

        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-md ${!sidebarVisible ? 'bg-surface text-foreground' : 'text-muted hover:bg-surface'}`}
          title="Toggle Sidebar"
        >
          {sidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>

        <button
          onClick={toggleTemplatePicker}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted hover:bg-surface hover:text-foreground transition-colors"
          title="New Project from Template"
        >
          <Plus size={14} />
          New Project
        </button>

        <button
          onClick={toggleCitationModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted hover:bg-surface hover:text-foreground transition-colors"
          title="Add Citation"
        >
          <BookMarked size={14} />
          Cite
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="text-xs text-muted mr-4 hidden md:block">
          {isCompiling && compileProgress ? (
            <span className="text-primary font-medium animate-pulse">{compileProgress}</span>
          ) : (
            <>
              <span className="font-medium text-foreground">{activeFile?.name || 'No file'}</span>
              <span className="mx-2">•</span>
              Saved
            </>
          )}
        </div>

        {/* Editor Mode Toggle */}
        <button
          onClick={toggleEditorMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            editorMode === 'rich'
              ? 'bg-surface text-foreground'
              : 'bg-surface text-foreground'
          } hover:bg-border`}
          title={editorMode === 'rich' ? 'Switch to Raw LaTeX' : 'Switch to Rich Text'}
        >
          {editorMode === 'rich' ? (
            <>
              <Code2 size={14} />
              Raw LaTeX
            </>
          ) : (
            <>
              <Type size={14} />
              Rich Text
            </>
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 text-muted hover:bg-surface rounded-md"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Draft Mode Toggle */}
        <button
          onClick={toggleDraftMode}
          disabled={isCompiling}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
            ${isCompiling ? 'opacity-50 cursor-not-allowed' : ''}
            ${draftMode
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}
          `}
          title={draftMode ? 'Draft mode: Fast compilation without images' : 'Full mode: Complete compilation with images'}
        >
          {draftMode ? (
            <>
              <Zap size={14} />
              Draft
            </>
          ) : (
            <>
              <Image size={14} />
              Full
            </>
          )}
        </button>

        {/* Compile Button */}
        <button
          onClick={() => startCompilation()}
          disabled={isCompiling}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm min-w-[120px] justify-center
            ${isCompiling
              ? 'bg-surface text-muted cursor-not-allowed'
              : 'bg-primary text-white hover:opacity-90 hover:shadow-md active:scale-95'}
          `}
        >
          {isCompiling ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Compiling
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              Compile
            </>
          )}
        </button>

        {/* Export .zip Button */}
        <button
          onClick={() => exportProjectZip(files)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted hover:bg-surface hover:text-foreground transition-colors"
          title="Export project as .zip for Overleaf"
        >
          <Download size={14} />
          Export .zip
        </button>

        <button
          onClick={togglePreview}
          className={`p-2 rounded-md ${!previewVisible ? 'text-muted' : 'text-primary bg-surface'}`}
          title="Toggle Preview"
        >
          <MonitorPlay size={18} />
        </button>

        <button
          onClick={toggleSettings}
          className="p-2 text-muted hover:bg-surface rounded-md relative"
          title={`Settings (Current: ${compilationMode === 'local' ? 'Local WASM' : 'Cloud API'})`}
        >
          <Settings size={18} />
          {/* Small indicator dot for compilation mode */}
          <span className={`
            absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-panel
            ${compilationMode === 'local'
              ? 'bg-amber-500'
              : 'bg-emerald-500'}
          `} />
        </button>
      </div>
    </header>
  );
};
