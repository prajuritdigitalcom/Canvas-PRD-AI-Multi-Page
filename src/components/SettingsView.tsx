import React, { useState } from 'react';
import { Settings, Shield, CheckCircle2, Code2, Cpu, KeyRound, Sparkles, Info, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface SettingsViewProps {
  visitorApiKeys: string[];
  onSaveVisitorApiKeys: (keys: string[]) => void;
  onClearVisitorApiKeys: () => void;
  onRemoveVisitorApiKey: (key: string) => void;
  hasSystemApiKey: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  visitorApiKeys,
  onSaveVisitorApiKeys,
  onClearVisitorApiKeys,
  onRemoveVisitorApiKey,
  hasSystemApiKey,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [validationNote, setValidationNote] = useState<string | null>(null);

  const handleCheckAndSave = async () => {
    const candidates = Array.from(
      new Set(
        rawInput
          .split('\n')
          .map((k) => k.trim())
          .filter(Boolean)
      )
    );
    if (candidates.length === 0) return;

    setChecking(true);
    setValidationNote(null);

    try {
      const res = await fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: candidates }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memverifikasi key.');
      }

      const validResults = (data.results || []).filter((r: any) => r.valid);
      const validKeys: string[] = validResults.map((r: any) => r.key);
      const invalidCount = (data.results || []).length - validKeys.length;

      if (validKeys.length > 0) {
        const merged = Array.from(new Set([...visitorApiKeys, ...validKeys]));
        onSaveVisitorApiKeys(merged);
        setRawInput('');
      }

      if (invalidCount > 0) {
        setValidationNote(`${validKeys.length} key valid diterima, ${invalidCount} key ditolak Google.`);
      } else if (validKeys.length > 0) {
        setValidationNote(`Semua ${validKeys.length} key valid & berhasil disimpan!`);
      } else {
        setValidationNote('Semua key yang dimasukkan tidak valid / ditolak Google.');
      }
    } catch (err: any) {
      setValidationNote(err.message || 'Gagal memverifikasi API key. Coba lagi.');
    } finally {
      setChecking(false);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    const tail = key.slice(-4);
    return `••••••••••••${tail}`;
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
                Masukkan satu atau beberapa API key Gemini sekaligus (1 key per baris)
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Tempelkan API Key Gemini milik Anda di bawah ini untuk mengaktifkan kuota pribadi atau cadangan berantai.
              </p>

              {/* Textarea Multi-Key Input */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 font-bold">
                  API Key Gemini Anda (satu per baris)
                </label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder={'AIzaSy...\nAIzaSy...\nAIzaSy...'}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs font-mono outline-none focus:bg-white focus:border-[#fe4c6f] resize-y"
                />
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleCheckAndSave}
                disabled={!rawInput.trim() || checking}
                className="w-full py-2.5 rounded-xl bg-[#fe4c6f] hover:bg-[#e03b5b] disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memeriksa & Verifikasi Key...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cek & Simpan Key</span>
                  </>
                )}
              </button>

              {validationNote && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#fe4c6f] shrink-0" />
                  <span>{validationNote}</span>
                </div>
              )}

              {/* Active Keys List */}
              {visitorApiKeys.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">
                      Key Pribadi Aktif ({visitorApiKeys.length})
                    </p>
                    <button
                      type="button"
                      onClick={onClearVisitorApiKeys}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Semua</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {visitorApiKeys.map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                      >
                        <span className="font-mono text-xs text-slate-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{maskKey(key)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveVisitorApiKey(key)}
                          className="text-xs text-slate-400 hover:text-red-600 font-bold px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
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
