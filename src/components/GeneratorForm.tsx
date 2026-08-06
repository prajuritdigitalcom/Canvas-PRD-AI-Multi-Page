import React, { useState } from 'react';
import { ProjectFormState } from '../types';
import { PageBuilder } from './PageBuilder';
import { SharedLayoutForm } from './SharedLayoutForm';
import {
  Sparkles,
  Building2,
  Target,
  Palette,
  Type,
  FileText,
  Loader2,
  Wand2,
  Globe2,
  Layers,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';

interface GeneratorFormProps {
  formState: ProjectFormState;
  onChangeForm: (form: ProjectFormState) => void;
  onSubmitGenerate: () => void;
  isGenerating: boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  formState,
  onChangeForm,
  onSubmitGenerate,
  isGenerating,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeSuccess, setAnalyzeSuccess] = useState(false);

  const updateForm = (updates: Partial<ProjectFormState>) => {
    onChangeForm({ ...formState, ...updates });
  };

  const handleAnalyzeBrief = async () => {
    if (!formState.rawBrief || formState.rawBrief.trim().length < 10) {
      alert('Tolong masukkan deskripsi brief mentah bisnis Anda terlebih dahulu (minimal 10 karakter).');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeSuccess(false);

    try {
      const response = await fetch('/api/analyze-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        visualStyle: data.visualStyle || formState.visualStyle,
        contentLanguage: data.contentLanguage || formState.contentLanguage,
        specialRequirements: data.specialRequirements || formState.specialRequirements,
        pages: nextPages,
      });

      setAnalyzeSuccess(true);
      setTimeout(() => setAnalyzeSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menganalisis brief.');
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
      {/* SECTION 1: Brief & Informasi Proyek */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
            <Building2 className="w-4 h-4" />
            <span>INFORMASI UTAMA & BRIEF</span>
          </div>
          <h2 className="text-xl font-bold text-white">Profil Bisnis & Deskripsi Brief Mentah</h2>
          <p className="text-sm text-slate-400 mt-1">
            Tuliskan ide bisnis atau salin brief dari klien. Mode Auto AI dapat membantu mengekstrak informasi dan mengusulkan halaman secara otomatis.
          </p>
        </div>

        {/* Brief Textarea & Auto Analyze Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-slate-200 font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Deskripsi Brief Mentah</span>
            </label>

            {formState.aiMode === 'auto' && (
              <button
                type="button"
                onClick={handleAnalyzeBrief}
                disabled={isAnalyzing}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-y"
          />

          {analyzeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                Berhasil menganalisis brief! Profil bisnis dan struktur {formState.pages.length} halaman otomatis disesuaikan.
              </span>
            </div>
          )}
        </div>

        {/* Project Profile Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Nama Proyek / Merek</label>
            <input
              type="text"
              value={formState.projectName}
              onChange={(e) => updateForm({ projectName: e.target.value })}
              placeholder="Contoh: KonsultanPajakKu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Jenis Bisnis / Industri</label>
            <input
              type="text"
              value={formState.businessType}
              onChange={(e) => updateForm({ businessType: e.target.value })}
              placeholder="Contoh: Jasa Konsultan Keuangan & Pajak"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Kategori Website</label>
            <select
              value={formState.websiteType}
              onChange={(e) => updateForm({ websiteType: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {WEBSITE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Target Audiens</label>
            <input
              type="text"
              value={formState.targetAudience}
              onChange={(e) => updateForm({ targetAudience: e.target.value })}
              placeholder="Contoh: Pemilik UMKM, Direktur Perusahaan, Tim Finance"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Goal Utama Website</label>
            <input
              type="text"
              value={formState.goalWebsite}
              onChange={(e) => updateForm({ goalWebsite: e.target.value })}
              placeholder="Contoh: Mendapatkan leads konsultasi gratis & membangun reputasi"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Call To Action (CTA) Utama</label>
            <input
              type="text"
              value={formState.primaryCTA}
              onChange={(e) => updateForm({ primaryCTA: e.target.value })}
              placeholder="Contoh: Konsultasi Gratis via WhatsApp"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
            <Palette className="w-4 h-4" />
            <span>IDENTITAS VISUAL & BRANDING</span>
          </div>
          <h3 className="text-xl font-bold text-white">Gaya Desain, Warna & Tipografi</h3>
          <p className="text-sm text-slate-400 mt-1">
            Menentukan aturan visual agar konsisten di seluruh halaman website multi-page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Warna Aksen Utama</label>
            <input
              type="text"
              value={formState.primaryColor}
              onChange={(e) => updateForm({ primaryColor: e.target.value })}
              placeholder="Contoh: Navy Blue & Gold Accent"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Tone Warna Canvas</label>
            <select
              value={formState.colorTone}
              onChange={(e) => updateForm({ colorTone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Clean & Bright (Light theme)">Clean & Bright (Light theme)</option>
              <option value="Modern Dark Theme">Modern Dark Theme</option>
              <option value="Warm Neutral / Soft Cream">Warm Neutral / Soft Cream</option>
              <option value="Corporate Professional">Corporate Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Pasangan Tipografi (Font)</label>
            <select
              value={formState.typographyPairing}
              onChange={(e) => updateForm({ typographyPairing: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
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
            <label className="block text-slate-300 font-medium mb-1.5">Bahasa Konten Utama</label>
            <select
              value={formState.contentLanguage}
              onChange={(e) => updateForm({ contentLanguage: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Indonesian">Bahasa Indonesia</option>
              <option value="English">English</option>
              <option value="Bilingual">Bilingual (Indonesia & English)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 font-medium mb-1.5">Persyaratan Khusus</label>
            <input
              type="text"
              value={formState.specialRequirements}
              onChange={(e) => updateForm({ specialRequirements: e.target.value })}
              placeholder="Contoh: Integrasi WhatsApp pendaftaran, desain ramah mobile, animasi halus..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-base shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-cyan-200" />
              <span>Menyusun Multi-Page PRD dengan Gemini 3.6 Flash...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate PRD Multi-Halaman untuk Google AI Studio</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
