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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-[#fe4c6f] font-bold text-xs uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4 text-[#fe4c6f]" />
          <span>KOMPONEN BERSAMA LINTAS HALAMAN</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Shared Layout & Global Components</h3>
        <p className="text-sm text-slate-500 mt-1">
          Komponen yang akan direusable di seluruh halaman untuk menjaga pengalaman pengguna yang konsisten.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Navbar Style */}
        <div className="space-y-3">
          <label className="block text-slate-800 font-bold text-sm flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#fe4c6f]" />
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
                    ? 'bg-[#fe4c6f]/10 border-[#fe4c6f] text-slate-900 shadow-xs font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-slate-900 mb-0.5">{style.name}</div>
                <div className="text-[11px] text-slate-500 line-clamp-2">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Configuration */}
        <div className="space-y-3">
          <label className="block text-slate-800 font-bold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#fe4c6f]" />
            <span>Struktur Footer & Legal Modal</span>
          </label>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div>
              <span className="block text-slate-700 font-semibold mb-1.5">Jumlah Kolom Footer</span>
              <div className="flex gap-2">
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => update({ footerColumns: cols })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      config.footerColumns === cols
                        ? 'bg-[#fe4c6f] border-[#fe4c6f] text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cols} Kolom
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-pink-50 border border-pink-200 p-2.5 rounded-lg">
              *Footer otomatis memuat tautan Modal Hukum (Syarat & Ketentuan serta Kebijakan Privasi) dengan teks hukum Bahasa Indonesia yang realistis.
            </div>
          </div>
        </div>
      </div>

      {/* Floating features & Widgets */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-slate-800 font-bold text-sm mb-3">Widget & Floating Features Global</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            config.hasWhatsAppFloatButton ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <input
              type="checkbox"
              checked={config.hasWhatsAppFloatButton}
              onChange={(e) => update({ hasWhatsAppFloatButton: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Tombol WA Floating</div>
                <div className="text-[10px] text-slate-500">Tombol pesan melayang di pojok kanan bawah</div>
              </div>
            </div>
          </label>

          <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            config.hasStickyCTABar ? 'bg-rose-50 border-rose-300 text-slate-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <input
              type="checkbox"
              checked={config.hasStickyCTABar}
              onChange={(e) => update({ hasStickyCTABar: e.target.checked })}
              className="rounded border-slate-300 text-[#fe4c6f] focus:ring-[#fe4c6f]"
            />
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#fe4c6f] shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Sticky Mobile CTA Bar</div>
                <div className="text-[10px] text-slate-500">Bar CTA cepat menempel di layar HP</div>
              </div>
            </div>
          </label>

          <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            config.hasNewsletterForm ? 'bg-rose-50 border-rose-300 text-slate-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <input
              type="checkbox"
              checked={config.hasNewsletterForm}
              onChange={(e) => update({ hasNewsletterForm: e.target.checked })}
              className="rounded border-slate-300 text-[#fe4c6f] focus:ring-[#fe4c6f]"
            />
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#fe4c6f] shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Form Newsletter</div>
                <div className="text-[10px] text-slate-500">Formulir pendaftaran email berlangganan</div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

