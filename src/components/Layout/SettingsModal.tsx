import React from 'react';
import { X, Cloud, Cpu, Check, Info } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import type { CompilationMode } from '../../lib/compiler';

export const SettingsModal = () => {
    const {
        settingsOpen,
        toggleSettings,
        compilationMode,
        setCompilationMode,
        theme
    } = useProjectStore();

    if (!settingsOpen) return null;

    const modes: Array<{
        id: CompilationMode;
        title: string;
        description: string;
        icon: React.ReactNode;
        pros: string[];
        cons: string[];
    }> = [
            {
                id: 'api',
                title: 'Cloud API',
                description: 'Compile using YtoTech cloud service',
                icon: <Cloud size={24} />,
                pros: ['Full LaTeX support', 'All packages available', 'Reliable output'],
                cons: ['Requires internet', 'Slightly slower', 'Server availability dependent'],
            },
            {
                id: 'local',
                title: 'Local (WASM)',
                description: 'Compile in-browser using SwiftLaTeX',
                icon: <Cpu size={24} />,
                pros: ['Works offline', 'Fast after initial load', 'No external dependencies'],
                cons: ['Limited package support', 'First compile is slow', 'Some features may not work'],
            },
        ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={toggleSettings}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in slide-in-from-bottom-4 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                        <button
                            onClick={toggleSettings}
                            className="p-1.5 rounded-md text-muted hover:bg-surface hover:text-foreground transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-6">
                        {/* Compilation Mode Section */}
                        <div>
                            <h3 className="text-sm font-medium text-foreground mb-3">Compilation Mode</h3>
                            <div className="space-y-3">
                                {modes.map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setCompilationMode(mode.id)}
                                        className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${compilationMode === mode.id
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-border hover:border-muted hover:bg-surface/50'}
                    `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`
                        p-2 rounded-lg
                        ${compilationMode === mode.id
                                                    ? 'bg-primary text-white'
                                                    : 'bg-surface text-muted'}
                      `}>
                                                {mode.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-foreground">{mode.title}</span>
                                                    {compilationMode === mode.id && (
                                                        <Check size={16} className="text-primary" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted mt-0.5">{mode.description}</p>

                                                {/* Pros and Cons */}
                                                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Pros:</span>
                                                        <ul className="mt-1 space-y-0.5 text-muted">
                                                            {mode.pros.map((pro, i) => (
                                                                <li key={i}>• {pro}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <span className="text-amber-600 dark:text-amber-400 font-medium">Cons:</span>
                                                        <ul className="mt-1 space-y-0.5 text-muted">
                                                            {mode.cons.map((con, i) => (
                                                                <li key={i}>• {con}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-surface/50 border border-border">
                            <Info size={18} className="text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted leading-relaxed">
                                <strong className="text-foreground">Tip:</strong> Use Cloud API for full document compilation with all packages.
                                Switch to Local mode for quick edits when working offline or when the server is slow.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 border-t border-border bg-surface/30">
                        <button
                            onClick={toggleSettings}
                            className="px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
