import React from 'react';
import { Layers, FileCode2, BookOpen, Settings, Code, ExternalLink } from 'lucide-react';

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
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between gap-6 shadow-xs">
      <div className="space-y-6">
        <div className="px-2 hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            NAVIGASI APLIKASI
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Prajurit Digital - AI Studio PRD
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
                    ? 'bg-[#fe4c6f]/10 border-[#fe4c6f]/30 text-[#fe4c6f] shadow-xs'
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-[#fe4c6f] text-white' : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#fe4c6f]/10 text-[#fe4c6f] font-mono font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                  </div>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#fe4c6f] text-white text-[10px] font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Target platform footer info */}
      <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Code className="w-4 h-4 text-[#fe4c6f]" />
          <span>Target Deployment</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          PRD ini dirancang khusus untuk ditempel ke <strong className="text-slate-900">Google AI Studio (Build mode)</strong> untuk menghasilkan aplikasi React + Vite multi-halaman.
        </p>
        <a
          href="https://ai.studio/build"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#fe4c6f] hover:text-[#e03b5b] flex items-center gap-1.5 pt-2 border-t border-pink-200/60"
        >
          <span>Buka Google AI Studio</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};

