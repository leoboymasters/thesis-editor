import React, { useRef } from 'react';
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Upload,
  LogOut,
  User,
  CreditCard,
  Bell,
  MoreVertical,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import { FileSystemItem } from '../../types';
import { parseZipFile } from '../../lib/zipHandler';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const FileIcon = ({ name }: { name: string }) => {
  if (name.endsWith('.tex')) return <FileText className="w-4 h-4 text-primary" />;
  if (name.endsWith('.bib')) return <FileText className="w-4 h-4 text-accent" />;
  if (name.endsWith('.png') || name.endsWith('.jpg')) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
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
          ${isActive ? 'bg-surface text-primary font-medium' : 'text-muted-foreground'}
        `}
        style={{ paddingLeft: depth === 0 ? '1rem' : paddingLeft }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-1 shrink-0">
          {item.type === 'folder' && (
            <span className="text-muted-foreground/60">
              {item.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {item.type === 'folder' ? (
            item.isExpanded ? <FolderOpen className="w-4 h-4 text-primary" /> : <Folder className="w-4 h-4 text-primary" />
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
  const { user, signOut } = useAuthStore();
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUploadClick}
            className="h-8 w-8 text-muted-foreground"
            title="Import ZIP Project"
          >
            <Upload size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Add File">
            <Plus size={14} />
          </Button>
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

      <div className="p-3 border-t border-border flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 rounded-lg p-2.5 text-left',
                'bg-muted/60 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
              title="Account menu"
            >
              <Avatar className="h-9 w-9 shrink-0 rounded-full">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email ?? ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(user?.email?.slice(0, 2) ?? '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email ?? '—'}
                </p>
              </div>
              <MoreVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 p-1">
                <Avatar className="h-9 w-9 shrink-0 rounded-full">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email ?? ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {(user?.email?.slice(0, 2) ?? '?').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email ?? '—'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-xs text-muted-foreground px-1">ThesisFlow v1.0</p>
      </div>
    </div>
  );
};