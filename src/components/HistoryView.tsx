import React, { useState } from 'react';
import { SavedPRD } from '../types';
import { FileCode2, Search, Trash2, ExternalLink, Calendar, Layers, Download, Copy, Check, Sparkles } from 'lucide-react';

interface HistoryViewProps {
  savedPRDs: SavedPRD[];
  onSelectPRD: (prd: SavedPRD) => void;
  onDeletePRD: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ savedPRDs, onSelectPRD, onDeletePRD }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPRDs = savedPRDs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.formState.websiteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.formState.businessType && p.formState.businessType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
            <FileCode2 className="w-4 h-4" />
            <span>RIWAYAT TERSIMPAN</span>
          </div>
          <h2 className="text-2xl font-black text-white">Daftar PRD Multi-Halaman Tersimpan</h2>
          <p className="text-xs text-slate-400 mt-1">
            Seluruh PRD yang pernah Anda generate tersimpan dengan aman di penyimpanan lokal browser.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari PRD atau jenis bisnis..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {filteredPRDs.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <FileCode2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">Belum Ada PRD Tersimpan</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm
              ? 'Tidak ada PRD yang cocok dengan kata kunci pencarian.'
              : 'PRD yang Anda hasilkan akan muncul di sini secara otomatis setelah Anda menyimpannya.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPRDs.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold shrink-0">
                    Score: {item.readyScore}/100
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {item.pageCount} Halaman
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {item.formState.websiteType}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPRD(item)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>Buka & Lihat PRD</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePRD(item.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Hapus PRD"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
