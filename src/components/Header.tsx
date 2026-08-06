import React from 'react';
import { Sparkles, Plus, Clock, Code2 } from 'lucide-react';

interface HeaderProps {
  onNewPRD: () => void;
  lastSavedAt: string | null;
  aiMode: 'auto' | 'manual';
  onToggleAiMode: (mode: 'auto' | 'manual') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewPRD,
  lastSavedAt,
  aiMode,
  onToggleAiMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="w-full px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand logo & platform focus - aligned with sidebar */}
        <div className="flex items-center gap-3">
          <img
            src="https://i.ibb.co.com/wr0x733r/prajurit-digital.jpg"
            alt="Prajurit Digital Logo"
            className="w-10 h-10 rounded-xl object-cover border border-pink-200 shadow-xs shrink-0"
          />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                Prajurit Digital
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] border border-[#fe4c6f]/20 leading-none">
                AI Studio PRD Generator
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 leading-none">
              <span>Optimized for</span>
              <span className="text-slate-800 font-semibold flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-[#fe4c6f] inline" /> Google AI Studio Build
              </span>
            </p>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode switch */}
          <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => onToggleAiMode('auto')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                aiMode === 'auto'
                  ? 'bg-[#fe4c6f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Auto (Brief AI)</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleAiMode('manual')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                aiMode === 'manual'
                  ? 'bg-[#fe4c6f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Manual Form</span>
            </button>
          </div>

          {/* Autosave status indicator */}
          {lastSavedAt && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-[#fe4c6f]" />
              <span>Draft tersimpan {lastSavedAt}</span>
            </div>
          )}

          {/* New PRD button */}
          <button
            type="button"
            onClick={onNewPRD}
            className="px-3.5 py-2 rounded-xl bg-[#fe4c6f] hover:bg-[#e03b5b] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Buat PRD Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};


