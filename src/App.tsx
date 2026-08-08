import React, { useState, useEffect } from 'react';
import { ProjectFormState, PRDGenerateResponse, SavedPRD, PageDefinition } from './types';
import { PAGE_PRESETS } from './data/pagePresets';
import { SAMPLE_PROJECTS } from './data/sampleProject';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GeneratorForm } from './components/GeneratorForm';
import { OutputView } from './components/OutputView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { Toast, ToastType } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { PasswordLockModal } from './components/PasswordLockModal';
import { Wand2 } from 'lucide-react';

const DEFAULT_PAGES: PageDefinition[] = PAGE_PRESETS[0].pages.map((p, idx) => ({
  ...p,
  id: 'page-default-' + idx,
  order: idx + 1,
}));

const DEFAULT_FORM_STATE: ProjectFormState = {
  projectName: '',
  businessType: '',
  websiteType: 'Company Profile',
  targetAudience: '',
  rawBrief: '',
  goalWebsite: '',
  primaryCTA: 'Hubungi Kami via WhatsApp',
  logoUrl: '',
  faviconUrl: '',
  pages: DEFAULT_PAGES,
  sharedLayout: {
    navbarStyle: 'Sticky',
    footerColumns: 3,
    hasWhatsAppFloatButton: true,
    hasStickyCTABar: true,
    hasNewsletterForm: true,
  },
  targetPlatform: 'Google AI Studio',
  primaryColor: 'Corporate Blue & Accent Gold',
  colorTone: 'Clean & Bright (Light theme)',
  typographyPairing: 'Plus Jakarta Sans (Body) + Playfair Display (Heading)',
  designThemeId: 'modern-minimalist',
  contentLanguage: 'Indonesian',
  specialRequirements: 'Responsif penuh, ramah mobile, dan cepat diakses',
  aiMode: 'auto',
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('prd_auth_token'));
  });
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'settings'>('generator');
  const [formState, setFormState] = useState<ProjectFormState>(DEFAULT_FORM_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prdResult, setPrdResult] = useState<PRDGenerateResponse | null>(null);
  const [savedPRDs, setSavedPRDs] = useState<SavedPRD[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isPRDSaved, setIsPRDSaved] = useState(false);

  // Toast & Modal State
  const [toast, setToast] = useState<{ message: string; type: ToastType; onRetry?: () => void } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'primary' | 'warning';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (message: string, type: ToastType = 'info', onRetry?: () => void) => {
    setToast({ message, type, onRetry });
  };

  const [visitorApiKeys, setVisitorApiKeys] = useState<string[]>(() => {
    try {
      const storedArray = sessionStorage.getItem('canvas_prd_visitor_api_keys');
      if (storedArray) {
        const parsed = JSON.parse(storedArray);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      }
      const legacySingle = sessionStorage.getItem('canvas_prd_visitor_api_key');
      return legacySingle ? [legacySingle.trim()] : [];
    } catch {
      return [];
    }
  });
  const [hasSystemApiKey, setHasSystemApiKey] = useState(true);
  const [serverKeyCount, setServerKeyCount] = useState<number>(0);
  const [backupKeyCount, setBackupKeyCount] = useState<number>(0);
  const [apiStatusError, setApiStatusError] = useState<string | null>(null);

  // Check server API key status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => {
        if (!res.ok) throw new Error('Status endpoint returned non-200');
        return res.json();
      })
      .then((data) => {
        if (typeof data.hasSystemApiKey === 'boolean') {
          setHasSystemApiKey(data.hasSystemApiKey);
        }
        if (typeof data.serverKeyCount === 'number') {
          setServerKeyCount(data.serverKeyCount);
        }
        if (typeof data.backupKeyCount === 'number') {
          setBackupKeyCount(data.backupKeyCount);
        }
        setApiStatusError(null);
      })
      .catch((err) => {
        console.warn('Gagal terhubung ke endpoint status server:', err);
        setApiStatusError('Gagal memeriksa status koneksi server');
      });
  }, []);

  const handleSaveVisitorApiKeys = (keys: string[]) => {
    try {
      sessionStorage.setItem('canvas_prd_visitor_api_keys', JSON.stringify(keys));
      setVisitorApiKeys(keys);
      showToast('API Key pribadi berhasil disimpan untuk sesi ini.', 'success');
    } catch (e) {
      showToast('Gagal menyimpan API key ke browser storage.', 'error');
    }
  };

  const handleClearVisitorApiKeys = () => {
    try {
      sessionStorage.removeItem('canvas_prd_visitor_api_keys');
      sessionStorage.removeItem('canvas_prd_visitor_api_key');
      setVisitorApiKeys([]);
      showToast('API Key pribadi berhasil dihapus.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveVisitorApiKey = (keyToRemove: string) => {
    try {
      const updated = visitorApiKeys.filter((k) => k !== keyToRemove);
      sessionStorage.setItem('canvas_prd_visitor_api_keys', JSON.stringify(updated));
      setVisitorApiKeys(updated);
      showToast('API Key berhasil dihapus.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Load saved PRDs and Draft on initial mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('ai_studio_prd_history');
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) {
          setSavedPRDs(parsed.slice(0, 10));
        }
      }
    } catch (e) {
      console.error('Failed to parse PRD history', e);
    }

    try {
      const savedForm = localStorage.getItem('canvas_prd_form_draft');
      if (savedForm) {
        const parsed = JSON.parse(savedForm);
        const mergedPages =
          parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length > 0
            ? parsed.pages
            : DEFAULT_PAGES;
        const mergedShared = parsed.sharedLayout || DEFAULT_FORM_STATE.sharedLayout;

        setFormState({
          ...DEFAULT_FORM_STATE,
          ...parsed,
          pages: mergedPages,
          sharedLayout: mergedShared,
          targetPlatform: 'Google AI Studio',
        });
      }
    } catch (e) {
      console.error('Failed to parse draft', e);
    }
  }, []);

  // Auto-save form draft on change safely
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('canvas_prd_form_draft', JSON.stringify(formState));
        const now = new Date();
        setLastSavedAt(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      } catch (e) {
        console.warn('Quota exceeded or error saving draft to localStorage:', e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formState]);

  const handleGeneratePRD = async () => {
    setIsGenerating(true);
    setIsPRDSaved(false);

    try {
      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(visitorApiKeys.length > 0 ? { 'x-user-api-keys': JSON.stringify(visitorApiKeys) } : {}),
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghasilkan PRD.');
      }

      setPrdResult(data);

      // Auto-save ke Riwayat begitu PRD berhasil digenerate
      const newSaved: SavedPRD = {
        id: 'prd-' + Date.now(),
        title: formState.projectName || 'PRD Website Multi-Halaman',
        createdAt: new Date().toISOString(),
        readyScore: data.readyScore,
        pageCount: formState.pages.length,
        formState: { ...formState },
        markdown: data.markdown,
      };

      setSavedPRDs((prev) => {
        const updatedHistory = [newSaved, ...prev].slice(0, 10);
        try {
          localStorage.setItem('ai_studio_prd_history', JSON.stringify(updatedHistory));
        } catch (e) {
          showToast('Riwayat PRD tidak dapat disimpan — penyimpanan browser penuh.', 'warning');
        }
        return updatedHistory;
      });
      setIsPRDSaved(true);
      showToast('PRD Multi-Halaman berhasil disusun!', 'success');
    } catch (err: any) {
      showToast(
        err.message || 'Terjadi kesalahan saat memproses PRD.',
        'error',
        handleGeneratePRD
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!prdResult) return;

    const newSaved: SavedPRD = {
      id: 'prd-' + Date.now(),
      title: formState.projectName || 'PRD Website Multi-Halaman',
      createdAt: new Date().toISOString(),
      readyScore: prdResult.readyScore,
      pageCount: formState.pages.length,
      formState: { ...formState },
      markdown: prdResult.markdown,
    };

    const updated = [newSaved, ...savedPRDs.filter((item) => item.id !== newSaved.id)].slice(0, 10);
    setSavedPRDs(updated);
    try {
      localStorage.setItem('ai_studio_prd_history', JSON.stringify(updated));
      setIsPRDSaved(true);
      showToast('PRD berhasil disimpan ke Riwayat.', 'success');
    } catch (e) {
      showToast('Gagal menyimpan ke Riwayat — penyimpanan browser penuh.', 'error');
    }
  };

  const handleDeleteSavedPRD = (id: string) => {
    const updated = savedPRDs.filter((item) => item.id !== id);
    setSavedPRDs(updated);
    try {
      localStorage.setItem('ai_studio_prd_history', JSON.stringify(updated));
      showToast('PRD dihapus dari Riwayat.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPRD = (saved: SavedPRD) => {
    setFormState(saved.formState);
    setPrdResult({
      markdown: saved.markdown,
      readyScore: saved.readyScore,
      scoreReasons: {
        passed: [`PRD tersimpan (${saved.pageCount} halaman)`],
        warnings: [],
      },
    });
    setIsPRDSaved(true);
    setActiveTab('generator');
    showToast(`Memuat PRD: "${saved.title}"`, 'info');
  };

  const handleNewPRD = () => {
    const isUnsaved = prdResult && !isPRDSaved;
    setConfirmModal({
      isOpen: true,
      title: 'Buat PRD Baru?',
      message: isUnsaved
        ? 'PRD saat ini belum tersimpan di Riwayat dan akan hilang jika Anda melanjutkan. Yakin ingin membuat PRD baru?'
        : 'Formulir akan dikosongkan untuk membuat PRD baru. Lanjutkan?',
      confirmText: 'Buat Baru',
      variant: isUnsaved ? 'warning' : 'primary',
      onConfirm: () => {
        setFormState(DEFAULT_FORM_STATE);
        setPrdResult(null);
        setIsPRDSaved(false);
        setActiveTab('generator');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('Form PRD baru telah disiapkan.', 'info');
      },
    });
  };

  const handleFillSampleData = (sampleId?: string) => {
    const targetId = typeof sampleId === 'string' ? sampleId : 'company-profile';
    const sample = SAMPLE_PROJECTS.find((s) => s.id === targetId) || SAMPLE_PROJECTS[0];

    const applySample = () => {
      setFormState({
        ...sample.data,
        pages: sample.data.pages.map((p) => ({ ...p })),
      });
      showToast(`Contoh data "${sample.label}" berhasil diisikan ke form!`, 'success');
    };

    if (formState.projectName || formState.rawBrief) {
      setConfirmModal({
        isOpen: true,
        title: 'Isi Contoh Data Otomatis?',
        message: `Form akan diisi dengan data contoh kategori "${sample.label}" (${sample.shortDescription}) dan menimpa isian yang sudah Anda tulis. Lanjutkan?`,
        confirmText: 'Isi Contoh Data',
        variant: 'primary',
        onConfirm: () => {
          applySample();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }

    applySample();
  };

  const handleLockSite = () => {
    localStorage.removeItem('prd_auth_token');
    setIsAuthenticated(false);
    showToast('Akses website berhasil dikunci.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#fe4c6f] selection:text-white">
      {/* Password Lock Modal */}
      {!isAuthenticated && (
        <PasswordLockModal
          onSuccess={() => {
            setIsAuthenticated(true);
            showToast('Akses berhasil dibuka! Selamat datang.', 'success');
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onRetry={toast.onRetry}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Top Header */}
      <Header
        onNewPRD={handleNewPRD}
        lastSavedAt={lastSavedAt}
        aiMode={formState.aiMode}
        onToggleAiMode={(mode) => setFormState({ ...formState, aiMode: mode })}
        onLockSite={handleLockSite}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          savedPRDCount={savedPRDs.length}
          serverKeyCount={serverKeyCount}
          backupKeyCount={backupKeyCount}
          visitorKeyCount={visitorApiKeys.length}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {apiStatusError && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
              <span>⚠️ Status koneksi server: {apiStatusError}</span>
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="space-y-8">
              {/* Hero Banner when no PRD generated yet */}
              {!prdResult && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 text-center max-w-5xl mx-auto space-y-4 shadow-xs">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Ubah Brief Mentah Menjadi PRD Multi-Halaman
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-3xl mx-auto">
                    Aplikasi ini membantu Anda membuat rancangan website multi-halaman, lengkap dengan PRD profesional yang siap digunakan untuk membangun website dengan lebih cepat dan terstruktur.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    {SAMPLE_PROJECTS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleFillSampleData(sample.id)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-[#fe4c6f]" />
                        <span>Coba: {sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Result or Form */}
              {prdResult ? (
                <OutputView
                  prdResult={prdResult}
                  formState={formState}
                  onEdit={() => setPrdResult(null)}
                  onSaveToHistory={handleSaveToHistory}
                  isSaved={isPRDSaved}
                />
              ) : (
                <GeneratorForm
                  formState={formState}
                  onChangeForm={setFormState}
                  onSubmitGenerate={handleGeneratePRD}
                  isGenerating={isGenerating}
                  visitorApiKeys={visitorApiKeys}
                  onFillSample={handleFillSampleData}
                  onResetForm={handleNewPRD}
                  onShowToast={showToast}
                />
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView
              savedPRDs={savedPRDs}
              onSelectPRD={handleSelectPRD}
              onDeletePRD={handleDeleteSavedPRD}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              visitorApiKeys={visitorApiKeys}
              onSaveVisitorApiKeys={handleSaveVisitorApiKeys}
              onClearVisitorApiKeys={handleClearVisitorApiKeys}
              onRemoveVisitorApiKey={handleRemoveVisitorApiKey}
              hasSystemApiKey={hasSystemApiKey}
            />
          )}
        </main>
      </div>
    </div>
  );
}
