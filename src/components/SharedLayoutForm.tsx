import React from 'react';
import { SharedLayoutConfig } from '../types';
import { Compass, MessageSquare, Shield, Mail, LayoutGrid } from 'lucide-react';

interface SharedLayoutFormProps {
  config: SharedLayoutConfig;
  onChange: (config: SharedLayoutConfig) => void;
}

export const SharedLayoutForm: React.FC<SharedLayoutFormProps> = ({ config, onChange }) => {
  const update = (updates: Partial<SharedLayoutConfig>) => {
    onChange({ ...config, ...updates });
  };

  const NAVBAR_STYLES: Array<{ id: SharedLayoutConfig['navbarStyle']; name: string; desc: string }> = [
    { id: 'Standard', name: 'Standard Header', desc: 'Header statis dengan logo di kiri & menu di kanan.' },
    { id: 'Sticky', name: 'Sticky / Fixed Header', desc: 'Header tetap menempel saat di-scroll untuk navigasi cepat.' },
    { id: 'Transparent-on-Hero', name: 'Transparent Hero Header', desc: 'Transparan di atas Hero, berubah solid saat di-scroll.' },
    { id: 'Mega Menu', name: 'Mega Menu Dropdown', desc: 'Cocok untuk katalog besar atau layanan multi-kategori.' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
          <Compass className="w-4 h-4" />
          <span>KOMPONEN BERSAMA LINTAS HALAMAN</span>
        </div>
        <h3 className="text-xl font-bold text-white">Shared Layout & Global Components</h3>
        <p className="text-sm text-slate-400 mt-1">
          Komponen yang akan direusable di seluruh halaman untuk menjaga pengalaman pengguna yang konsisten.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Navbar Style */}
        <div className="space-y-3">
          <label className="block text-slate-300 font-semibold text-sm flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-400" />
            <span>Gaya Navigasi (Navbar)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {NAVBAR_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => update({ navbarStyle: style.id })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.navbarStyle === style.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-100 mb-0.5">{style.name}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Configuration */}
        <div className="space-y-3">
          <label className="block text-slate-300 font-semibold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Struktur Footer & Legal Modal</span>
          </label>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div>
              <span className="block text-slate-300 font-medium mb-1.5">Jumlah Kolom Footer</span>
              <div className="flex gap-2">
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => update({ footerColumns: cols })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      config.footerColumns === cols
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {cols} Kolom
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-indigo-950/30 border border-indigo-500/20 p-2.5 rounded-lg">
              *Footer otomatis memuat tautan Modal Hukum (Syarat & Ketentuan serta Kebijakan Privasi) dengan teks hukum Bahasa Indonesia yang realistis.
            </div>
          </div>
        </div>
      </div>

      {/* Floating features & Widgets */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="block text-slate-300 font-semibold text-sm mb-3">Widget & Floating Features Global</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            config.hasWhatsAppFloatButton ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <input
              type="checkbox"
              checked={config.hasWhatsAppFloatButton}
              onChange={(e) => update({ hasWhatsAppFloatButton: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Tombol WA Floating</div>
                <div className="text-[10px] text-slate-400">Tombol pesan melayang di pojok kanan bawah</div>
              </div>
            </div>
          </label>

          <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            config.hasStickyCTABar ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <input
              type="checkbox"
              checked={config.hasStickyCTABar}
              onChange={(e) => update({ hasStickyCTABar: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Sticky Mobile CTA Bar</div>
                <div className="text-[10px] text-slate-400">Bar CTA cepat menempel di layar HP</div>
              </div>
            </div>
          </label>

          <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            config.hasNewsletterForm ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <input
              type="checkbox"
              checked={config.hasNewsletterForm}
              onChange={(e) => update({ hasNewsletterForm: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Form Newsletter</div>
                <div className="text-[10px] text-slate-400">Formulir pendaftaran email berlangganan</div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
