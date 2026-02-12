import React, { useRef } from 'react';
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { FileSystemItem } from '../../types';
import { parseZipFile } from '../../lib/zipHandler';

const FileIcon = ({ name }: { name: string }) => {
  if (name.endsWith('.tex')) return <FileText className="w-4 h-4 text-blue-500" />;
  if (name.endsWith('.bib')) return <FileText className="w-4 h-4 text-green-600" />;
  if (name.endsWith('.png') || name.endsWith('.jpg')) return <ImageIcon className="w-4 h-4 text-purple-500" />;
  return <FileText className="w-4 h-4 text-muted" />;
};

const FileTreeItem: React.FC<{ item: FileSystemItem, depth?: number }> = ({ item, depth = 0 }) => {
  const { files, activeFileId, setActiveFile, toggleFolder } = useProjectStore();

  // Find children with explicit type casting to fix TypeScript inference issues
  const children = (Object.values(files) as FileSystemItem[]).filter(f => f.parentId === item.id);

  // Sort: Folders first, then files
  children.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });

  const isActive = activeFileId === item.id;
  const paddingLeft = `${depth * 1.25}rem`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'folder') {
      toggleFolder(item.id);
    } else {
      setActiveFile(item.id);
    }
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 py-1.5 pr-2 cursor-pointer select-none text-sm
          hover:bg-surface
          ${isActive ? 'bg-surface text-primary font-medium' : 'text-muted'}
        `}
        style={{ paddingLeft: depth === 0 ? '1rem' : paddingLeft }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-1 shrink-0">
          {item.type === 'folder' && (
            <span className="text-muted/60">
              {item.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {item.type === 'folder' ? (
            item.isExpanded ? <FolderOpen className="w-4 h-4 text-yellow-500" /> : <Folder className="w-4 h-4 text-yellow-500" />
          ) : (
            <span className="pl-4"><FileIcon name={item.name} /></span>
          )}
        </div>
        <span className="truncate">{item.name}</span>
      </div>

      {item.type === 'folder' && item.isExpanded && (
        <div>
          {children.map(child => (
            <FileTreeItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = () => {
  const { files, importProject } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort root files
  const rootFiles = (Object.values(files) as FileSystemItem[]).filter(f => f.parentId === 'root');

  rootFiles.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newFiles = await parseZipFile(file);
      importProject(newFiles);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Failed to import ZIP:", err);
      alert("Failed to parse ZIP file. Please ensure it is a valid archive.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-panel border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-xs uppercase tracking-wider">Project Files</h2>
        <div className="flex gap-1">
          <button
            onClick={handleUploadClick}
            className="p-1 hover:bg-surface rounded text-muted"
            title="Import ZIP Project"
          >
            <Upload size={14} />
          </button>
          <button className="p-1 hover:bg-surface rounded text-muted" title="Add File">
            <Plus size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".zip"
            className="hidden"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {rootFiles.map(item => (
          <FileTreeItem key={item.id} item={item} />
        ))}
      </div>

      <div className="p-4 border-t border-border text-xs text-muted">
        Thesis Project v1.0
      </div>
    </div>
  );
};