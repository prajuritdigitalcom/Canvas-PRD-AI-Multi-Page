import React from 'react';
import { Settings, Shield, Server, CheckCircle2, Code2, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Settings className="w-4 h-4" />
            <span>KONFIGURASI SERVER & AI ENGINE</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800"
          >
            Tutup ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>AI Model</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px]">
                gemini-3.6-flash
              </span>
            </div>
            <p className="text-slate-400">
              Aplikasi menggunakan model resmi <strong className="text-slate-200">Gemini 3.6 Flash</strong> via SDK <code className="text-cyan-300">@google/genai</code> yang berjalan aman di server Express.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Gemini API Key</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terkoneksi (Server)
              </span>
            </div>
            <p className="text-slate-400">
              API key secara otomatis disuntikkan dari panel <strong className="text-slate-200">Settings &gt; Secrets</strong> lingkungan Cloud Run AI Studio. Tidak ada API key yang terekspos di browser.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Target Build Platform</span>
              </span>
              <span className="text-slate-300 font-medium">Google AI Studio (Build mode)</span>
            </div>
            <p className="text-slate-400">
              Format output mengutamakan React 18/19, TypeScript, Vite, dan <code className="text-cyan-300">react-router-dom</code> multi-file.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
