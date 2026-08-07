import React, { useState } from 'react';
import { DESIGN_THEMES, DesignThemeRule } from '../data/designThemes';
import { Layers, CheckCircle2, ExternalLink, X, Info } from 'lucide-react';

interface ThemeFoundationSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeFoundationSelector: React.FC<ThemeFoundationSelectorProps> = ({
  selectedThemeId,
  onSelectTheme,
}) => {
  const [previewTheme, setPreviewTheme] = useState<DesignThemeRule | null>(null);

  return (
    <div className="bg-white border-2 border-[#fe4c6f] rounded-2xl p-6 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-[#fe4c6f] font-bold text-xs uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4 text-[#fe4c6f]" />
          <span>FONDASI TEMA DESAIN — WAJIB DIPILIH</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Pilih Gaya Desain Website</h3>
        <p className="text-sm text-slate-500 mt-1">
          Ini adalah keputusan paling awal & mendasar. Seluruh struktur, warna, tipografi, dan
          detail visual di PRD akan mengikuti tema yang Anda pilih di sini secara konsisten.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {DESIGN_THEMES.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <div
              key={theme.id}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#fe4c6f] bg-[#fff5f7]'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                className="text-left w-full cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">{theme.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#fe4c6f] shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 mb-2">{theme.tagline}</p>
                <p className="text-[11px] text-slate-400 italic">Cocok untuk: {theme.bestFor}</p>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTheme(theme)}
                className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#fe4c6f] hover:underline cursor-pointer self-start"
              >
                <Info className="w-3 h-3" />
                Lihat Contoh Website
              </button>
            </div>
          );
        })}
      </div>

      {/* Popup Referensi Contoh Website */}
      {previewTheme && (
        <div
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewTheme(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">{previewTheme.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{previewTheme.tagline}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {previewTheme.referenceExamples.map((ex) => (
                <a
                  key={ex.url}
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-t border-slate-100 pt-3 first:border-0 first:pt-0 group"
                >
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#fe4c6f] group-hover:underline">
                    {ex.name}
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ex.note}</p>
                </a>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
              Referensi visual publik, bukan afiliasi/endorsement. PRD Anda tidak akan meniru
              struktur atau konten situs ini — hanya "rasa" visualnya yang sudah diterjemahkan
              ke aturan teknis di kamus tema.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
