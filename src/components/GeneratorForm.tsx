import React, { useState } from 'react';
import { ProjectFormState } from '../types';
import { PageBuilder } from './PageBuilder';
import { SharedLayoutForm } from './SharedLayoutForm';
import { ThemeFoundationSelector } from './ThemeFoundationSelector';
import {
  Sparkles,
  Building2,
  Palette,
  FileText,
  Loader2,
  Wand2,
  ArrowRight,
} from 'lucide-react';
import { ToastType } from './Toast';

interface GeneratorFormProps {
  formState: ProjectFormState;
  onChangeForm: (form: ProjectFormState) => void;
  onSubmitGenerate: () => void;
  isGenerating: boolean;
  visitorApiKeys: string[];
  onFillSample?: () => void;
  onShowToast?: (message: string, type: ToastType, onRetry?: () => void) => void;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  formState,
  onChangeForm,
  onSubmitGenerate,
  isGenerating,
  visitorApiKeys,
  onFillSample,
  onShowToast,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeSuccess, setAnalyzeSuccess] = useState(false);

  const updateForm = (updates: Partial<ProjectFormState>) => {
    onChangeForm({ ...formState, ...updates });
  };

  const handleAnalyzeBrief = async () => {
    if (!formState.rawBrief || formState.rawBrief.trim().length < 10) {
      onShowToast?.('Tolong masukkan deskripsi brief mentah bisnis Anda terlebih dahulu (minimal 10 karakter).', 'warning');
      return;
    }

    if (formState.rawBrief.length > 10000) {
      onShowToast?.('Brief mentah terlalu panjang (maksimal 10000 karakter). Mohon persingkat brief Anda.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeSuccess(false);

    try {
      const response = await fetch('/api/analyze-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(visitorApiKeys.length > 0 ? { 'x-user-api-keys': JSON.stringify(visitorApiKeys) } : {}),
        },
        body: JSON.stringify({ rawBrief: formState.rawBrief }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Gagal menganalisis brief.');
      }

      const data = resData.data;

      // Merge analyzed fields safely
      const nextPages =
        data.suggestedPages && data.suggestedPages.length > 0
          ? data.suggestedPages.map((p: any, idx: number) => ({
              ...p,
              id: 'page-auto-' + idx + '-' + Date.now(),
              order: idx + 1,
            }))
          : formState.pages;

      onChangeForm({
        ...formState,
        projectName: data.projectName || formState.projectName,
        businessType: data.businessType || formState.businessType,
        websiteType: data.websiteType || formState.websiteType,
        targetAudience: data.targetAudience || formState.targetAudience,
        goalWebsite: data.goalWebsite || formState.goalWebsite,
        primaryCTA: data.primaryCTA || formState.primaryCTA,
        primaryColor: data.primaryColor || formState.primaryColor,
        colorTone: data.colorTone || formState.colorTone,
        typographyPairing: data.typographyPairing || formState.typographyPairing,
        designThemeId: data.designThemeId || formState.designThemeId,
        contentLanguage: data.contentLanguage || formState.contentLanguage,
        specialRequirements: data.specialRequirements || formState.specialRequirements,
        pages: nextPages,
      });

      setAnalyzeSuccess(true);
      onShowToast?.('Berhasil menganalisis brief! Profil bisnis & halaman telah diperbarui.', 'success');
      setTimeout(() => setAnalyzeSuccess(false), 4000);
    } catch (err: any) {
      onShowToast?.(
        err.message || 'Terjadi kesalahan saat menganalisis brief.',
        'error',
        handleAnalyzeBrief
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const WEBSITE_TYPES: Array<ProjectFormState['websiteType']> = [
    'Company Profile',
    'E-Commerce / Catalog',
    'SaaS / Service App',
    'Agency / Portfolio',
    'Educational / Community',
    'Custom',
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitGenerate();
      }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* SECTION 0: Fondasi Tema Desain — WAJIB dipilih paling awal sebelum section lain */}
      <ThemeFoundationSelector
        selectedThemeId={formState.designThemeId}
        onSelectTheme={(id) => updateForm({ designThemeId: id })}
      />

      {/* SECTION 1: Brief & Informasi Proyek */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#fe4c6f] font-bold text-xs uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-[#fe4c6f]" />
              <span>INFORMASI UTAMA & BRIEF</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Profil Bisnis & Deskripsi Brief Mentah</h2>
            <p className="text-sm text-slate-500 mt-1">
              Masukkan ide bisnis atau brief. AI akan menyusun halaman website secara otomatis.
            </p>
          </div>
          {onFillSample && (
            <button
              type="button"
              onClick={onFillSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#fe4c6f]" />
              <span>Isi Contoh Otomatis</span>
            </button>
          )}
        </div>

        {/* Brief Textarea & Auto Analyze Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-slate-800 font-bold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#fe4c6f]" />
              <span>Deskripsi Brief Mentah</span>
            </label>

            {formState.aiMode === 'auto' && (
              <button
                type="button"
                onClick={handleAnalyzeBrief}
                disabled={isAnalyzing}
                className="px-3.5 py-1.5 rounded-xl bg-[#fe4c6f] hover:bg-[#e03b5b] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menganalisis Brief...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Auto-Ekstrak & Susun Halaman</span>
                  </>
                )}
              </button>
            )}
          </div>

          <textarea
            rows={4}
            value={formState.rawBrief}
            onChange={(e) => updateForm({ rawBrief: e.target.value })}
            placeholder="Contoh: Kami adalah perusahaan jasa konsultasi pajak & akuntansi di Jakarta 'KonsultanPajakKu'. Kami butuh website profesional multi-halaman untuk calon klien korporat. Halaman yang dibutuhkan: Home, Profil Perusahaan, Layanan Pajak, Studi Kasus, Blog Artikel, dan Kontak Kami dengan form konsultasi gratis..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#fe4c6f] focus:ring-1 focus:ring-[#fe4c6f] transition-all resize-y"
          />

          {analyzeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>
                Berhasil menganalisis brief! Profil bisnis dan struktur {formState.pages.length} halaman otomatis disesuaikan.
              </span>
            </div>
          )}
        </div>

        {/* Project Profile Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Nama Proyek / Merek</label>
            <input
              type="text"
              value={formState.projectName}
              onChange={(e) => updateForm({ projectName: e.target.value })}
              placeholder="Contoh: KonsultanPajakKu"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Jenis Bisnis / Industri</label>
            <input
              type="text"
              value={formState.businessType}
              onChange={(e) => updateForm({ businessType: e.target.value })}
              placeholder="Contoh: Jasa Konsultan Keuangan & Pajak"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Kategori Website</label>
            <select
              value={formState.websiteType}
              onChange={(e) => updateForm({ websiteType: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            >
              {WEBSITE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Target Audiens</label>
            <input
              type="text"
              value={formState.targetAudience}
              onChange={(e) => updateForm({ targetAudience: e.target.value })}
              placeholder="Contoh: Pemilik UMKM, Direktur Perusahaan, Tim Finance"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Goal Utama Website</label>
            <input
              type="text"
              value={formState.goalWebsite}
              onChange={(e) => updateForm({ goalWebsite: e.target.value })}
              placeholder="Contoh: Mendapatkan leads konsultasi gratis & membangun reputasi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Call To Action (CTA) Utama</label>
            <input
              type="text"
              value={formState.primaryCTA}
              onChange={(e) => updateForm({ primaryCTA: e.target.value })}
              placeholder="Contoh: Konsultasi Gratis via WhatsApp"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Link Logo Website</label>
            <input
              type="text"
              value={formState.logoUrl || ''}
              onChange={(e) => updateForm({ logoUrl: e.target.value })}
              placeholder="Contoh: https://cdn.contoh.com/logo.png (opsional)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Link Favicon Website</label>
            <input
              type="text"
              value={formState.faviconUrl || ''}
              onChange={(e) => updateForm({ faviconUrl: e.target.value })}
              placeholder="Contoh: https://cdn.contoh.com/favicon.ico (opsional)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Page Builder */}
      <PageBuilder
        pages={formState.pages}
        onChangePages={(pages) => updateForm({ pages })}
        websiteType={formState.websiteType}
      />

      {/* SECTION 3: Shared Layout Components */}
      <SharedLayoutForm
        config={formState.sharedLayout}
        onChange={(sharedLayout) => updateForm({ sharedLayout })}
      />

      {/* SECTION 4: Design & Branding Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-[#fe4c6f] font-bold text-xs uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4 text-[#fe4c6f]" />
            <span>IDENTITAS VISUAL & BRANDING</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Gaya Desain, Warna & Tipografi</h3>
          <p className="text-sm text-slate-500 mt-1">
            Menentukan detail warna & tipografi sebagai penyesuaian dari Tema Desain yang sudah Anda pilih di atas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Warna Aksen Utama</label>
            <input
              type="text"
              value={formState.primaryColor}
              onChange={(e) => updateForm({ primaryColor: e.target.value })}
              placeholder="Contoh: Primary Pink (#fe4c6f) & Soft Cream"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Tone Warna Canvas</label>
            <select
              value={formState.colorTone}
              onChange={(e) => updateForm({ colorTone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            >
              <option value="Clean & Bright (Light theme)">Clean & Bright (Light theme)</option>
              <option value="Modern Dark Theme">Modern Dark Theme</option>
              <option value="Warm Neutral / Soft Cream">Warm Neutral / Soft Cream</option>
              <option value="Corporate Professional">Corporate Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Pasangan Tipografi (Font)</label>
            <select
              value={formState.typographyPairing}
              onChange={(e) => updateForm({ typographyPairing: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            >
              <option value="Plus Jakarta Sans (Body) + Playfair Display (Heading)">
                Plus Jakarta Sans + Playfair Display (Elegan)
              </option>
              <option value="Inter (Body) + Outfit (Heading)">Inter + Outfit (Modern Tech)</option>
              <option value="Poppins (Body) + Montserrat (Heading)">Poppins + Montserrat (Bersih)</option>
              <option value="System UI Sans-Serif">System UI Sans-Serif (Standar)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Bahasa Konten Utama</label>
            <select
              value={formState.contentLanguage}
              onChange={(e) => updateForm({ contentLanguage: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            >
              <option value="Indonesian">Bahasa Indonesia</option>
              <option value="English">English</option>
              <option value="Bilingual">Bilingual (Indonesia & English)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1.5">Persyaratan Khusus</label>
            <input
              type="text"
              value={formState.specialRequirements}
              onChange={(e) => updateForm({ specialRequirements: e.target.value })}
              placeholder="Contoh: Integrasi WhatsApp pendaftaran, desain ramah mobile, animasi halus..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#fe4c6f]"
            />
          </div>
        </div>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 px-6 rounded-2xl bg-[#fe4c6f] hover:bg-[#e03b5b] text-white font-black text-base shadow-xl shadow-[#fe4c6f]/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Menyusun Multi-Page PRD dengan Gemini 3.6 Flash...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Generate PRD Multi-Halaman untuk Google AI Studio</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
