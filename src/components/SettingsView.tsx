import React, { useState, useEffect } from 'react';
import { Settings, Shield, CheckCircle2, Code2, Cpu, KeyRound, Eye, EyeOff, Sparkles, Server, Info } from 'lucide-react';

interface SettingsViewProps {
  visitorApiKey: string;
  onSaveVisitorApiKey: (key: string) => void;
  onClearVisitorApiKey: () => void;
  hasSystemApiKey: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  visitorApiKey,
  onSaveVisitorApiKey,
  onClearVisitorApiKey,
  hasSystemApiKey,
}) => {
  const [inputKey, setInputKey] = useState(visitorApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setInputKey(visitorApiKey);
  }, [visitorApiKey]);

  const handleSave = () => {
    if (!inputKey.trim()) return;
    onSaveVisitorApiKey(inputKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClear = () => {
    setInputKey('');
    onClearVisitorApiKey();
    setSaveSuccess(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#fe4c6f] font-bold text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4 text-[#fe4c6f]" />
          <span>KONFIGURASI SISTEM & API KEYS</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Pengaturan Gemini AI & Server Environment
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          Kelola kunci API Gemini, pantau status server backend Express, dan atur preferensi platform target pembuatan PRD website multi-halaman.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status AI Model & Server */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-[#fe4c6f]" />
              <span>Status AI Engine & Backend</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi runtime server Express & SDK Gemini
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* AI Model Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <span>Gemini 3.6 Flash</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  SDK Resmi <code className="text-[#fe4c6f] bg-pink-50 px-1 py-0.5 rounded font-mono">@google/genai</code>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
                Aktif
              </span>
            </div>

            {/* Server Key Status Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>API Key Server (Cloud Run Secrets)</span>
                </span>
                {hasSystemApiKey ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terkoneksi
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold text-[11px]">Belum Ada</span>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                API key server dikelola secara aman via environment variables tanpa pernah terekspos ke browser pengguna.
              </p>
            </div>

            {/* Target Platform Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#fe4c6f]" />
                  <span>Target Build Platform</span>
                </span>
                <span className="text-slate-900 font-bold text-[11px] px-2.5 py-0.5 rounded-md bg-pink-50 border border-pink-200">
                  Google AI Studio (Build mode)
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Mengoptimalkan struktur PRD untuk kompatibilitas penuh dengan bundler Vite, React 18/19, TypeScript, dan <code className="text-[#fe4c6f] font-mono">react-router-dom</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Visitor Custom API Key */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-amber-500" />
                <span>API Key Gemini Pribadi (Pengunjung)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan API key sendiri jika ingin kuota khusus atau cadangan
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {hasSystemApiKey
                  ? 'Opsional — Jika kuota API key server mencapai batas penggunaan, Anda dapat memasukkan API Key Gemini pribadi di bawah ini.'
                  : 'Server belum memiliki API key bawaan. Masukkan API key Gemini pribadi Anda agar aplikasi dapat menghasilkan PRD.'}
              </p>

              {/* Input Box */}
              <div className="space-y-2">
                <label className="block text-slate-800 font-bold">API Key Gemini Anda</label>
                <div className="flex gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-mono outline-none focus:bg-white focus:border-[#fe4c6f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={showKey ? 'Sembunyikan Key' : 'Tampilkan Key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!inputKey.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#fe4c6f] hover:bg-[#e03b5b] disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simpan Key</span>
                </button>
                {visitorApiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>API Key pribadi berhasil disimpan di penyimpanan lokal browser Anda!</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fe4c6f] hover:underline font-bold text-xs flex items-center gap-1"
            >
              <span>Dapatkan API Key Gemini Gratis di Google AI Studio</span>
              <span>→</span>
            </a>
            <div className="flex items-start gap-2 text-slate-500 text-[11px] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Keamanan Terjamin: API Key pengunjung disimpan secara lokal di browser Anda (<code className="font-mono">sessionStorage</code>) dan hanya dikirim secara langsung via header terenkripsi saat merequest PRD.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
