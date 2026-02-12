import React, { useMemo, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { parseProjectStructure, StructureItem } from '../../lib/latexParser';
import {
    FileText,
    Image as ImageIcon,
    Table as TableIcon,
    BookOpen,
    Heading1,
    Heading2
} from 'lucide-react';

export const DocumentStructure = () => {
    const { files, activeFileId, setActiveFile } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'toc' | 'figures' | 'tables'>('toc');

    // Parse structure whenever files change (memoized)
    // In a real app, might want to debounce this or trigger only on save
    const structure = useMemo(() => {
        // Find root file (thesis.tex)
        const rootFile = Object.values(files).find(f => f.name === 'thesis.tex' || f.name === 'main.tex');
        return parseProjectStructure(files, rootFile?.id || null);
    }, [files]);

    const handleNavigate = (fileId: string, line: number) => {
        setActiveFile(fileId);
        // Note: We need a mechanism to scroll to the line. 
        // For now, we rely on the user finding the line, or we can add a store property "scrollToLine"
        // that CodeEditor listens to. We'll handle that in the next step.
        useProjectStore.setState({ activeFileId: fileId, fileNavigationRequest: { fileId, line } } as any);
    };

    const typeMeta = {
        chapter: { icon: BookOpen, label: 'Chapter', padding: 'pl-3', text: 'text-foreground font-semibold' },
        section: { icon: Heading1, label: 'Section', padding: 'pl-6', text: 'text-foreground/90' },
        subsection: { icon: Heading2, label: 'Subsection', padding: 'pl-9', text: 'text-muted' },
    } as const;

    const renderItem = (item: StructureItem) => {
        const meta = typeMeta[item.type];
        const Icon = meta?.icon || FileText;

        return (
            <div
                key={item.id}
                onClick={() => handleNavigate(item.fileId, item.lineNumber)}
                className={`
          cursor-pointer py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 border-l-2 border-transparent
          ${meta?.padding || ''}
        `}
            >
                <div className={`flex items-center gap-2 ${meta?.text || 'text-muted'}`}>
                    <Icon size={14} className="text-muted shrink-0" />
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] text-muted opacity-60 ml-auto whitespace-nowrap">L{item.lineNumber}</span>
                </div>
            </div>
        );
    };

    const renderList = (items: StructureItem[], emptyMsg: string) => {
        if (items.length === 0) {
            return (
                <div className="p-8 text-center text-muted text-sm">
                    {emptyMsg}
                </div>
            );
        }
        return <div className="py-2">{items.map(renderItem)}</div>;
    };

    return (
        <div className="flex flex-col h-full bg-background border-l border-border">
            {/* Tabs */}
            <div className="flex items-center border-b border-border">
                <button
                    onClick={() => setActiveTab('toc')}
                    className={`flex-1 p-3 flex justify-center border-b-2 text-xs font-medium transition-colors
            ${activeTab === 'toc' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}
          `}
                    title="Table of Contents"
                >
                    <FileText size={16} />
                </button>
                <button
                    onClick={() => setActiveTab('figures')}
                    className={`flex-1 p-3 flex justify-center border-b-2 text-xs font-medium transition-colors
            ${activeTab === 'figures' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}
          `}
                    title="List of Figures"
                >
                    <ImageIcon size={16} />
                </button>
                <button
                    onClick={() => setActiveTab('tables')}
                    className={`flex-1 p-3 flex justify-center border-b-2 text-xs font-medium transition-colors
            ${activeTab === 'tables' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}
          `}
                    title="List of Tables"
                >
                    <TableIcon size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'toc' && renderList(structure.toc, 'No chapters or sections found')}
                {activeTab === 'figures' && renderList(structure.figures, 'No figures found')}
                {activeTab === 'tables' && renderList(structure.tables, 'No tables found')}
            </div>
        </div>
    );
};
