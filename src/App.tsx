import React, { useState, useEffect } from 'react';
import { ProjectFormState, PRDGenerateResponse, SavedPRD, PageDefinition } from './types';
import { PAGE_PRESETS } from './data/pagePresets';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GeneratorForm } from './components/GeneratorForm';
import { OutputView } from './components/OutputView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';

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
  visualStyle: 'Modern, Clean & Professional',
  contentLanguage: 'Indonesian',
  specialRequirements: 'Responsif penuh, ramah mobile, dan cepat diakses',
  aiMode: 'auto',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'settings'>('generator');
  const [formState, setFormState] = useState<ProjectFormState>(DEFAULT_FORM_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prdResult, setPrdResult] = useState<PRDGenerateResponse | null>(null);
  const [savedPRDs, setSavedPRDs] = useState<SavedPRD[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isPRDSaved, setIsPRDSaved] = useState(false);

  const [visitorApiKeys, setVisitorApiKeys] = useState<string[]>(() => {
    const storedArray = sessionStorage.getItem('canvas_prd_visitor_api_keys');
    if (storedArray) {
      try {
        const parsed = JSON.parse(storedArray);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {
        console.error('Failed to parse visitor keys array', e);
      }
    }
    // Migration fallback from single string key
    const legacySingle = sessionStorage.getItem('canvas_prd_visitor_api_key');
    return legacySingle ? [legacySingle.trim()] : [];
  });
  const [hasSystemApiKey, setHasSystemApiKey] = useState(true);
  const [serverKeyCount, setServerKeyCount] = useState<number>(0);
  const [backupKeyCount, setBackupKeyCount] = useState<number>(0);

  // Check server API key status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
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
      })
      .catch(() => {});
  }, []);

  const handleSaveVisitorApiKeys = (keys: string[]) => {
    sessionStorage.setItem('canvas_prd_visitor_api_keys', JSON.stringify(keys));
    setVisitorApiKeys(keys);
  };

  const handleClearVisitorApiKeys = () => {
    sessionStorage.removeItem('canvas_prd_visitor_api_keys');
    sessionStorage.removeItem('canvas_prd_visitor_api_key');
    setVisitorApiKeys([]);
  };

  const handleRemoveVisitorApiKey = (keyToRemove: string) => {
    const updated = visitorApiKeys.filter((k) => k !== keyToRemove);
    sessionStorage.setItem('canvas_prd_visitor_api_keys', JSON.stringify(updated));
    setVisitorApiKeys(updated);
  };

  // Load saved PRDs and Draft on initial mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('ai_studio_prd_history');
    if (storedHistory) {
      try {
        setSavedPRDs(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Failed to parse PRD history', e);
      }
    }

    const savedForm = localStorage.getItem('canvas_prd_form_draft');
    if (savedForm) {
      try {
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
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Auto-save form draft on change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('canvas_prd_form_draft', JSON.stringify(formState));
      const now = new Date();
      setLastSavedAt(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
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
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memproses PRD.');
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

    const updated = [newSaved, ...savedPRDs];
    setSavedPRDs(updated);
    localStorage.setItem('ai_studio_prd_history', JSON.stringify(updated));
    setIsPRDSaved(true);
  };

  const handleDeleteSavedPRD = (id: string) => {
    const updated = savedPRDs.filter((item) => item.id !== id);
    setSavedPRDs(updated);
    localStorage.setItem('ai_studio_prd_history', JSON.stringify(updated));
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
  };

  const handleNewPRD = () => {
    if (confirm('Buat formulir PRD baru? Draft sebelumnya dapat ditimpa.')) {
      setFormState(DEFAULT_FORM_STATE);
      setPrdResult(null);
      setIsPRDSaved(false);
      setActiveTab('generator');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#fe4c6f] selection:text-white">
      {/* Top Header */}
      <Header
        onNewPRD={handleNewPRD}
        lastSavedAt={lastSavedAt}
        aiMode={formState.aiMode}
        onToggleAiMode={(mode) => setFormState({ ...formState, aiMode: mode })}
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
          {activeTab === 'generator' && (
            <div className="space-y-8">
              {/* Hero Banner when no PRD generated yet */}
              {!prdResult && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 text-center max-w-5xl mx-auto space-y-3 shadow-xs">
                  <span className="px-3.5 py-1 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] border border-[#fe4c6f]/20 text-xs font-bold uppercase tracking-wider inline-block">
                    PRODUK V2.0 — MULTI-PAGE GENERATOR
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Ubah Brief Mentah Menjadi PRD Multi-Halaman untuk Google AI Studio
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-3xl mx-auto">
                    Aplikasi ini membantu Anda merancang arsitektur website multi-halaman (Home, About, Services, Blog, Contact, dll.) dan menghasilkan PRD bertaraf profesional yang dapat dicopy-paste langsung ke <strong className="text-slate-900">Google AI Studio (mode Build)</strong>.
                  </p>
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
