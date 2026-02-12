import React, { useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useProjectStore } from '../../store/projectStore';
import { FileText } from 'lucide-react';

export const CodeEditor = () => {
  const { files, activeFileId, updateFileContent, theme } = useProjectStore();
  const activeFile = activeFileId ? files[activeFileId] : null;
  const monaco = useMonaco();

  useEffect(() => {
    const { fileNavigationRequest } = useProjectStore.getState();
    if (fileNavigationRequest && fileNavigationRequest.fileId === activeFileId && monaco) {
      const editor = monaco.editor.getEditors()[0];
      if (editor) {
        editor.revealLineInCenter(fileNavigationRequest.line);
        editor.setPosition({ lineNumber: fileNavigationRequest.line, column: 1 });
        editor.focus();
        // Clear request
        useProjectStore.setState({ fileNavigationRequest: null } as any);
      }
    }
  });

  useEffect(() => {
    if (monaco) {
      // Define Tokyo Night Light (Customized with white background)
      // Uses the provided color palette for syntax highlighting
      monaco.editor.defineTheme('tokyo-night-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '8c4351' },
          { token: 'type.identifier', foreground: '5a3e8e' },
          { token: 'string', foreground: '385f0d' },
          { token: 'number', foreground: '965027' },
          { token: 'comment', foreground: '6c6e75' },
          { token: 'delimiter', foreground: '343b58' },
          { token: 'variable', foreground: '343b58' },
          { token: 'variable.predefined', foreground: '8c4351' },
          { token: 'function', foreground: '2959aa' },
        ],
        colors: {
          'editor.background': '#ffffff', // Maintain white background
          'editor.foreground': '#343b58', // Default text color
          'editorCursor.foreground': '#343b58',
          'editor.lineHighlightBackground': '#f1f5f9',
          'editorLineNumber.foreground': '#9da0b0',
          'editor.selectionBackground': '#9da0b040',
        }
      });

      // Define Tokyo Night Dark (Standard)
      monaco.editor.defineTheme('tokyo-night-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: 'bb9af7' },
          { token: 'type.identifier', foreground: 'c0caf5' },
          { token: 'string', foreground: '9ece6a' },
          { token: 'number', foreground: 'ff9e64' },
          { token: 'comment', foreground: '565f89' },
          { token: 'delimiter', foreground: 'a9b1d6' },
          { token: 'variable', foreground: 'c0caf5' },
          { token: 'function', foreground: '7aa2f7' },
        ],
        colors: {
          'editor.background': '#1a1b26',
          'editor.foreground': '#a9b1d6',
          'editorCursor.foreground': '#c0caf5',
          'editor.lineHighlightBackground': '#292e42',
          'editorLineNumber.foreground': '#565f89',
          'editor.selectionBackground': '#515c7e40',
        }
      });
    }
  }, [monaco]);

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted bg-background">
        <FileText size={48} className="mb-4 opacity-50" />
        <p>Select a file to start editing</p>
      </div>
    );
  }

  // Determine language for Monaco
  let language = 'plaintext';
  if (activeFile.name.endsWith('.tex')) language = 'latex';
  if (activeFile.name.endsWith('.bib')) language = 'bibtex';

  // Basic image preview for non-text files
  if (activeFile.type === 'file' && (activeFile.name.endsWith('.png') || activeFile.name.endsWith('.jpg'))) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <div className="text-muted mb-2">{activeFile.name}</div>
        <div className="w-64 h-64 border border-border rounded flex items-center justify-center text-muted">
          [Image Preview]
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-9 flex items-center px-4 bg-panel border-b border-border text-sm text-muted">
        <span className="font-mono text-xs">{activeFile.name}</span>
      </div>
      <div className="flex-1 relative">
        <Editor
          height="100%"
          path={activeFile.id}
          defaultLanguage={language}
          language={language}
          value={activeFile.content}
          onChange={handleEditorChange}
          theme={theme === 'dark' ? 'tokyo-night-dark' : 'tokyo-night-light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 16 },
            fontFamily: "'JetBrains Mono', monospace",
          }}
        />
      </div>
    </div>
  );
};