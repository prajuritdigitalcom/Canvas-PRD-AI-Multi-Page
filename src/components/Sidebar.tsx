import React from 'react';
import { Layers, FileCode2, Settings, KeyRound } from 'lucide-react';

interface SidebarProps {
  activeTab: 'generator' | 'history' | 'settings';
  onSelectTab: (tab: 'generator' | 'history' | 'settings') => void;
  savedPRDCount: number;
  serverKeyCount: number;
  backupKeyCount: number;
  visitorKeyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  savedPRDCount,
  serverKeyCount,
  backupKeyCount,
  visitorKeyCount,
}) => {
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
      id: 'settings' as const,
      label: 'Sistem & API Key',
      icon: Settings,
      desc: 'Konfigurasi Gemini Server',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between gap-6 shadow-xs">
      <div className="space-y-4">
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

      {/* Gemini API Key Status Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#fe4c6f]" />
          <span>Status API Key Gemini</span>
        </div>
        <div className="space-y-2 text-xs pt-2 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium text-[11px]">Server</span>
            {serverKeyCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Aktif ({serverKeyCount})
              </span>
            ) : (
              <span className="text-slate-500 font-semibold text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                Kosong
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium text-[11px]">Pribadi (Anda)</span>
            {visitorKeyCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sky-800 font-bold text-[11px] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                Aktif ({visitorKeyCount})
              </span>
            ) : (
              <span className="text-slate-500 font-semibold text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                Kosong
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};


