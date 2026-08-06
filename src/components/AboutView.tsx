import React from 'react';
import { BookOpen, Code2, Layers, Sparkles, ArrowRight, ExternalLink, CheckCircle2, Terminal } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
          <BookOpen className="w-4 h-4" />
          <span>PANDUAN ALUR KERJA</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          Cara Membangun Website Multi-Halaman dengan Google AI Studio
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          Generator PRD ini dirancang khusus untuk menghasilkan spesifikasi bertaraf profesional yang dapat dieksekusi secara instan oleh <strong className="text-white">Google AI Studio (mode Build)</strong> untuk membuat proyek React + TypeScript + Vite multi-halaman nyata.
        </p>
      </div>

      {/* Step-by-Step Workflow */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white px-1">Langkah Demi Langkah (Workflow)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-slate-100 text-base">Susun Profil & Halaman di Aplikasi Ini</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gunakan mode <strong className="text-indigo-300">Auto (Brief AI)</strong> atau <strong className="text-indigo-300">Manual Page Builder</strong> untuk menentukan daftar halaman (\`/\`, \`/tentang-kami\`, \`/layanan\`, \`/kontak\`, dll.) beserta komponen bersama yang Anda inginkan.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-slate-100 text-base">Salin Master Prompt Sekali Klik</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Setelah PRD digenerate, klik tombol <strong className="text-cyan-300 font-semibold">"Copy Master Prompt (Sekali Klik)"</strong>. Bagian ini berisi instruksi teknis utuh yang mencakup seluruh arsitektur multi-file React+Vite.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-slate-100 text-base">Tempel ke Google AI Studio (Build Mode)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buka Google AI Studio di <a href="https://ai.studio/build" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">ai.studio/build</a>, buat aplikasi baru, dan tempelkan Master Prompt tersebut ke kotak percakapan agen.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-slate-100 text-base">Nikmati Website Multi-Halaman Siap Pakai</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI Studio akan membuat file-file fisik (\`src/pages/*.tsx\`, \`src/components/*.tsx\`, \`App.tsx\` dengan \`react-router-dom\`). Website Anda siap diuji, di-share, atau dideploy ke Cloud Run!
            </p>
          </div>
        </div>
      </div>

      {/* Why Multi-Page React Architecture */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>Mengapa Arsitektur Multi-Page React Lebih Baik?</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-lg space-y-1">
            <div className="font-semibold text-slate-100 text-xs">Modular & Mudah Dirawat</div>
            <div className="text-[11px] text-slate-400">Kode terpisah per halaman (\`pages/\`) dan per komponen (\`components/\`).</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-lg space-y-1">
            <div className="font-semibold text-slate-100 text-xs">Navigasi Multi-Route</div>
            <div className="text-[11px] text-slate-400">Routing nyata via \`react-router-dom\` tanpa bergantung pada scroll anchor tunggal.</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-lg space-y-1">
            <div className="font-semibold text-slate-100 text-xs">Standard AI Studio Build</div>
            <div className="text-[11px] text-slate-400">Sesuai standar kontainer Cloud Run dan Vite bundler AI Studio.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
