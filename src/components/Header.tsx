import React from 'react';
import { Sparkles, FileText, Plus, Check, Clock, Code2, Layers } from 'lucide-react';

interface HeaderProps {
  onNewPRD: () => void;
  savedCount: number;
  onOpenHistory: () => void;
  lastSavedAt: string | null;
  aiMode: 'auto' | 'manual';
  onToggleAiMode: (mode: 'auto' | 'manual') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewPRD,
  savedCount,
  onOpenHistory,
  lastSavedAt,
  aiMode,
  onToggleAiMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand logo & platform focus */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight">
                AI Studio PRD Generator
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multi-Page Web
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Optimized for</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-cyan-400 inline" /> Google AI Studio Build
              </span>
            </p>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode switch */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => onToggleAiMode('auto')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                aiMode === 'auto'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto (Brief AI)</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleAiMode('manual')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                aiMode === 'manual'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Manual Form</span>
            </button>
          </div>

          {/* Autosave status indicator */}
          {lastSavedAt && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Draft tersimpan {lastSavedAt}</span>
            </div>
          )}

          {/* History button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Riwayat PRD</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* New PRD button */}
          <button
            type="button"
            onClick={onNewPRD}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Buat PRD Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
