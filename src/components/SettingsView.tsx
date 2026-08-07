import React, { useState } from 'react';
import { Settings, CheckCircle2, KeyRound, Sparkles, Info, Trash2, Loader2 } from 'lucide-react';

interface SettingsViewProps {
  visitorApiKeys: string[];
  onSaveVisitorApiKeys: (keys: string[]) => void;
  onClearVisitorApiKeys: () => void;
  onRemoveVisitorApiKey: (key: string) => void;
  hasSystemApiKey?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  visitorApiKeys,
  onSaveVisitorApiKeys,
  onClearVisitorApiKeys,
  onRemoveVisitorApiKey,
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
          Kelola API Gemini pribadi sebagai kuota utama atau cadangan.
        </p>
      </div>

      {/* Visitor Custom API Key */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
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

          <div className="pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-start gap-2 text-slate-500 text-[11px] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                API Key hanya disimpan di browser Anda dan digunakan saat diperlukan.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
};
