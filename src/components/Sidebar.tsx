import React from 'react';
import { Layers, FileCode2, BookOpen, Settings, HelpCircle, Code, ExternalLink, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: 'generator' | 'history' | 'about' | 'settings';
  onSelectTab: (tab: 'generator' | 'history' | 'about' | 'settings') => void;
  savedPRDCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, savedPRDCount }) => {
  const NAV_ITEMS = [
    {
      id: 'generator' as const,
      label: 'PRD Generator',
      icon: Layers,
      badge: 'Build Mode',
      desc: 'Form PRD Website Multi-Halaman',
    },
    {
      id: 'history' as const,
      label: 'Daftar & Riwayat PRD',
      icon: FileCode2,
      count: savedPRDCount,
      desc: 'PRD tersimpan di browser',
    },
    {
      id: 'about' as const,
      label: 'Panduan AI Studio',
      icon: BookOpen,
      desc: 'Cara pakainya di AI Studio',
    },
    {
      id: 'settings' as const,
      label: 'Sistem & API Key',
      icon: Settings,
      desc: 'Konfigurasi Gemini Server',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-950/60 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between gap-6">
      <div className="space-y-6">
        <div className="px-2 hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            NAVIGASI APLIKASI
          </div>
          <div className="text-xs text-slate-400">
            Multi-Page Website PRD for Google AI Studio
          </div>
        </div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                  </div>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Target platform footer info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Code className="w-4 h-4 text-cyan-400" />
          <span>Target Deployment</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          PRD ini dirancang khusus untuk ditempel ke <strong className="text-slate-200">Google AI Studio (Build mode)</strong> untuk menghasilkan aplikasi React + Vite multi-halaman.
        </p>
        <a
          href="https://ai.studio/build"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 pt-1 border-t border-slate-800"
        >
          <span>Buka Google AI Studio</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};
