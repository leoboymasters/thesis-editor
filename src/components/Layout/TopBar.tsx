import React from 'react';
import { Play, Settings, PanelLeftClose, PanelLeft, MonitorPlay, Sun, Moon, Zap, Image, RefreshCw, Code2, Type, Plus, BookMarked, Download } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { exportProjectZip } from '../../lib/exportZip';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

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
            <span className="font-serif font-bold italic">Tf</span>
          </div>
          <span>Thesis<span className="font-light text-muted-foreground">Flow</span></span>
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          className={cn(!sidebarVisible && 'bg-surface text-foreground')}
        >
          {sidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTemplatePicker}
          title="New Project from Template"
          className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
        >
          <Plus size={14} />
          New Project
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCitationModal}
          title="Add Citation"
          className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
        >
          <BookMarked size={14} />
          Cite
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground mr-4 hidden md:block">
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

        <Button
          variant="secondary"
          size="sm"
          onClick={toggleEditorMode}
          title={editorMode === 'rich' ? 'Switch to Raw LaTeX' : 'Switch to Rich Text'}
          className="gap-1.5 h-8"
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
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={toggleDraftMode}
          disabled={isCompiling}
          title={draftMode ? 'Draft mode: Fast compilation without images' : 'Full mode: Complete compilation with images'}
          className={cn(
            'gap-1.5 h-8',
            draftMode
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-100/90 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/40'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/90 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
          )}
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
        </Button>

        <Button
          onClick={() => startCompilation()}
          disabled={isCompiling}
          size="sm"
          className="gap-2 rounded-full min-w-[120px] h-9"
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
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => exportProjectZip(files)}
          title="Export project as .zip for Overleaf"
          className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
        >
          <Download size={14} />
          Export .zip
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          title="Toggle Preview"
          className={cn(previewVisible && 'text-primary bg-surface')}
        >
          <MonitorPlay size={18} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSettings}
          title={`Settings (Current: ${compilationMode === 'local' ? 'Local WASM' : 'Cloud API'})`}
          className="relative"
        >
          <Settings size={18} />
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-panel',
              compilationMode === 'local' ? 'bg-amber-500' : 'bg-emerald-500'
            )}
          />
        </Button>
      </div>
    </header>
  );
};
