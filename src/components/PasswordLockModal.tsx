import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, Loader2, KeyRound, AlertTriangle } from 'lucide-react';

interface PasswordLockModalProps {
  onSuccess: (token: string) => void;
}

export const PasswordLockModal: React.FC<PasswordLockModalProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [timeRemainingStr, setTimeRemainingStr] = useState<string>('');

  // Sync initial lock status from localStorage & backend
  useEffect(() => {
    const checkStatus = async () => {
      // Local check
      const localLockedUntilStr = localStorage.getItem('prd_auth_locked_until');
      if (localLockedUntilStr) {
        const until = parseInt(localLockedUntilStr, 10);
        if (until > Date.now()) {
          setIsLocked(true);
          setLockedUntil(until);
          setAttemptsLeft(0);
        } else {
          localStorage.removeItem('prd_auth_locked_until');
          localStorage.removeItem('prd_auth_failed_attempts');
        }
      }

      // Sync with server
      try {
        const res = await fetch('/api/check-lock');
        if (res.ok) {
          const data = await res.json();
          if (data.isLocked && data.lockedUntil) {
            setIsLocked(true);
            setLockedUntil(data.lockedUntil);
            setAttemptsLeft(0);
            localStorage.setItem('prd_auth_locked_until', data.lockedUntil.toString());
          } else if (typeof data.remainingAttempts === 'number') {
            setAttemptsLeft(data.remainingAttempts);
          }
        }
      } catch (err) {
        console.error('Failed to check server lock status:', err);
      }
    };

    checkStatus();
  }, []);

  // Countdown timer when locked
  useEffect(() => {
    if (!isLocked || !lockedUntil) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = lockedUntil - now;

      if (diff <= 0) {
        setIsLocked(false);
        setLockedUntil(null);
        setAttemptsLeft(3);
        setErrorMsg(null);
        localStorage.removeItem('prd_auth_locked_until');
        localStorage.removeItem('prd_auth_failed_attempts');
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        const sStr = String(seconds).padStart(2, '0');

        setTimeRemainingStr(`${hStr} Jam : ${mStr} Menit : ${sStr} Detik`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading || isLocked) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Correct Password!
        localStorage.removeItem('prd_auth_locked_until');
        localStorage.removeItem('prd_auth_failed_attempts');
        localStorage.setItem('prd_auth_token', data.token || 'authenticated');
        onSuccess(data.token || 'authenticated');
      } else {
        // Failed
        if (data.isLocked || data.attemptsLeft === 0) {
          setIsLocked(true);
          const until = data.lockedUntil || Date.now() + 12 * 60 * 60 * 1000;
          setLockedUntil(until);
          setAttemptsLeft(0);
          localStorage.setItem('prd_auth_locked_until', until.toString());
          setErrorMsg('Gagal 3 kali! Akses terkunci selama 12 jam.');
        } else {
          const remaining = typeof data.attemptsLeft === 'number' ? data.attemptsLeft : attemptsLeft - 1;
          setAttemptsLeft(remaining);
          localStorage.setItem('prd_auth_failed_attempts', (3 - remaining).toString());
          setErrorMsg(data.message || `Password salah! Sisa percobaan: ${remaining}x lagi.`);
        }
      }
    } catch (err) {
      console.error('Password verification error:', err);
      setErrorMsg('Gagal terhubung ke server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header decoration */}
        <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#fe4c6f]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
            {isLocked ? (
              <ShieldAlert className="w-7 h-7 text-red-400 animate-pulse" />
            ) : (
              <KeyRound className="w-7 h-7 text-[#fe4c6f]" />
            )}
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {isLocked ? 'Akses Terkunci 12 Jam' : 'Akses Website Terkunci'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
            {isLocked
              ? 'Anda telah mencapai batas 3x percobaan gagal.'
              : 'Masukkan password resmi untuk mengakses Canvas PRD AI Generator.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isLocked ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>SISTEM TERKUNCI SEMENTARA</span>
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  Input password dikunci selama 12 jam untuk keamanan sistem. Silakan tunggu hingga waktu kunci berakhir.
                </p>
              </div>

              {/* Countdown box */}
              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono shadow-inner">
                <div className="text-[11px] text-slate-400 font-sans uppercase tracking-wider mb-1">
                  WAKTU TERSISA SEBELUM BISA MENCOBA LAGI:
                </div>
                <div className="text-lg md:text-xl font-black text-amber-300 tracking-wider">
                  {timeRemainingStr || '12:00:00'}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Remaining attempts indicator */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500 font-medium">Batas percobaan:</span>
                <span className={`font-bold ${attemptsLeft <= 1 ? 'text-red-600' : 'text-slate-700'}`}>
                  {attemptsLeft} / 3 Kesempatan
                </span>
              </div>

              {/* Input field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password Akses:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda..."
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#fe4c6f] focus:ring-2 focus:ring-[#fe4c6f]/20 text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top-1 duration-150">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#fe4c6f] hover:bg-[#e03b5b] disabled:bg-slate-300 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Buka Akses Website</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
