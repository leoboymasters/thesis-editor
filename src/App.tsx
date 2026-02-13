import React from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { TopBar } from './components/Layout/TopBar';
import { SettingsModal } from './components/Layout/SettingsModal';
import { CodeEditor } from './components/Editor/CodeEditor';
import { RichTextEditor } from './components/Editor/RichTextEditor';
import { PdfViewer } from './components/Preview/PdfViewer';
import { TemplatePickerModal } from './components/Templates/TemplatePickerModal';
import { CitationModal } from './components/Citations/CitationModal';
import { useProjectStore } from './store/projectStore';

const App = () => {
  const { sidebarVisible, previewVisible, theme, editorMode, templatePickerOpen, toggleTemplatePicker, citationModalOpen, toggleCitationModal } = useProjectStore();

  return (
    <div className={`${theme} flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden`}>
      <TopBar />

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`
            shrink-0 transition-all duration-300 ease-in-out border-r border-border bg-panel
            ${sidebarVisible ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden border-none'}
          `}
        >
          <Sidebar />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex min-w-0 bg-background">
          <div className="flex-1 flex flex-col min-w-0">
            {editorMode === 'rich' ? <RichTextEditor /> : <CodeEditor />}
          </div>

          {/* Preview Split */}
          {previewVisible && (
            <div className="w-[45%] border-l border-border shrink-0 bg-background">
              <PdfViewer />
            </div>
          )}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-6 bg-primary text-white text-[10px] px-3 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
          <span>Ready</span>
          <span>Ln 12, Col 45</span>
          <span>UTF-8</span>
          <span>LaTeX</span>
        </div>
        <div>
          <span>{theme === 'dark' ? 'Tokyo Night' : 'Tokyo Night Light'}</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal />

      {/* Template Picker Modal */}
      {templatePickerOpen && <TemplatePickerModal onClose={toggleTemplatePicker} />}

      {/* Citation Modal */}
      {citationModalOpen && <CitationModal onClose={toggleCitationModal} />}
    </div>
  );
};

export default App;