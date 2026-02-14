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
    toggleSettings,
    compilationMode,
    editorMode,
    toggleEditorMode,
    toggleTemplatePicker,
    toggleCitationModal,
  } = useProjectStore();

  const activeFile = activeFileId ? files[activeFileId] : null;

  return (
    <header className="h-12 bg-panel border-b border-border flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-foreground font-medium tracking-tight">
          <div className="w-7 h-7 bg-primary/90 rounded flex items-center justify-center text-white">
            <span className="font-serif font-semibold italic text-sm">R</span>
          </div>
          <span className="text-sm font-semibold">Researchere</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          className={cn('h-8 w-8', !sidebarVisible && 'bg-surface text-foreground')}
        >
          {sidebarVisible ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTemplatePicker}
          title="New Project from Template"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Plus size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCitationModal}
          title="Add Citation"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <BookMarked size={16} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-[11px] text-muted-foreground mr-2 hidden md:block">
          {isCompiling ? (
            <span className="text-primary font-medium animate-pulse">Compiling…</span>
          ) : (
            <>
              <span className="font-medium text-foreground">{activeFile?.name || 'No file'}</span>
              <span className="mx-1.5">·</span>
              <span>Saved</span>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleEditorMode}
          title={editorMode === 'rich' ? 'Switch to Raw LaTeX' : 'Switch to Rich Text'}
          className="h-8 w-8"
        >
          {editorMode === 'rich' ? <Code2 size={16} /> : <Type size={16} />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="h-8 w-8"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={toggleDraftMode}
          disabled={isCompiling}
          title={draftMode ? 'Draft: fast compile without images' : 'Full: compile with images'}
          className={cn(
            'h-8 w-8',
            draftMode
              ? 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:bg-amber-500/20 dark:text-amber-400'
              : 'bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-primary'
          )}
        >
          {draftMode ? <Zap size={16} /> : <Image size={16} />}
        </Button>

        <Button
          onClick={() => startCompilation()}
          disabled={isCompiling}
          variant="secondary"
          size="sm"
          className="gap-1.5 h-8 text-xs border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary min-w-[4.5rem]"
        >
          {isCompiling ? (
            <RefreshCw size={14} className="animate-spin shrink-0" />
          ) : (
            <>
              <Play size={14} fill="currentColor" className="shrink-0" />
              Compile
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => exportProjectZip(files)}
          title="Export project as .zip"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Download size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          title="Toggle Preview"
          className={cn('h-8 w-8', previewVisible && 'text-primary bg-surface')}
        >
          <MonitorPlay size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSettings}
          title={`Settings · ${compilationMode === 'local' ? 'Local WASM' : 'Cloud API'}`}
          className="h-8 w-8"
        >
          <Settings size={16} />
        </Button>
      </div>
    </header>
  );
};
