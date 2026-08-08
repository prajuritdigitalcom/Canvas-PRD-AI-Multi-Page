import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PRDGenerateResponse, ProjectFormState } from '../types';
import {
  Copy,
  Check,
  Download,
  Edit3,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileText,
  BookmarkPlus,
  BookmarkCheck,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface OutputViewProps {
  prdResult: PRDGenerateResponse;
  formState: ProjectFormState;
  onEdit: () => void;
  onSaveToHistory: () => void;
  isSaved: boolean;
}

export const OutputView: React.FC<OutputViewProps> = ({
  prdResult,
  formState,
  onEdit,
  onSaveToHistory,
  isSaved,
}) => {
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedMasterPrompt, setCopiedMasterPrompt] = useState(false);

  const { markdown, readyScore, scoreReasons } = prdResult;
  const pageCount = formState.pages.length;

  // Robust Master Prompt Extraction from Section 13 only
  const extractMasterPrompt = (): string => {
    // 1. Locate Section 13 heading
    const section13Regex = /##\s*13\.\s*Final Instruction[^\n]*/i;
    const match13 = markdown.match(section13Regex);

    let section13Text = '';
    if (match13 && match13.index !== undefined) {
      section13Text = markdown.substring(match13.index);
    } else {
      // Fallback if heading differs slightly
      const altIndex = markdown.toLowerCase().indexOf('final instruction');
      if (altIndex !== -1) {
        section13Text = markdown.substring(altIndex);
      } else {
        section13Text = markdown;
      }
    }

    // 2. Look for code fence strictly within Section 13
    const codeBlockMatch = section13Text.match(/```(?:markdown)?([\s\S]*?)```/i);
    let extracted = '';

    if (codeBlockMatch && codeBlockMatch[1]) {
      extracted = codeBlockMatch[1].trim();
    } else {
      // Strip section heading if no code fence found
      extracted = section13Text.replace(/^##\s*13\.[^\n]*\n?/, '').trim();
    }

    // Clean up any residual or nested fences at start or end
    extracted = extracted
      .replace(/^```markdown\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    // Safety fallback: Ensure we didn't extract Section 10/11 T&C by accident
    const forbiddenPhrases = ['syarat & ketentuan', 'kebijakan privasi', 'terms & conditions', 'privacy policy'];
    const lower = extracted.toLowerCase();
    const containsForbidden = forbiddenPhrases.some((phrase) => lower.includes(phrase));

    if (containsForbidden) {
      // Return cleaned section 13 text directly
      return section13Text
        .replace(/^##\s*13\.[^\n]*\n?/, '')
        .replace(/```markdown/gi, '')
        .replace(/```/g, '')
        .trim();
    }

    return extracted || markdown;
  };

  const handleCopyFullPRD = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2500);
    } catch (e) {
      alert('Gagal menyalin teks. Silakan salin secara manual.');
    }
  };

  const handleCopyMasterPrompt = async () => {
    try {
      const masterPrompt = extractMasterPrompt();
      await navigator.clipboard.writeText(masterPrompt);
      setCopiedMasterPrompt(true);
      setTimeout(() => setCopiedMasterPrompt(false), 2500);
    } catch (e) {
      alert('Gagal menyalin Master Prompt. Silakan salin secara manual.');
    }
  };

  const handleDownloadMarkdown = () => {
    const filename = `${(formState.projectName || 'PRD-Website').toLowerCase().replace(/\s+/g, '-')}-prd.md`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[#fe4c6f] font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[#fe4c6f]" />
              <span>PRD MULTI-HALAMAN HASIL GENERATE</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {formState.projectName || 'PRD Website Multi-Halaman'}
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] border border-[#fe4c6f]/20 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {pageCount} Halaman Terdefinisi
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                Google AI Studio Build Mode
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {formState.websiteType}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onEdit}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#fe4c6f]" />
              <span>Edit Form</span>
            </button>

            <button
              type="button"
              onClick={onSaveToHistory}
              disabled={isSaved}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 cursor-default'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 shadow-xs cursor-pointer'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-amber-500" />
                  <span>Simpan ke Riwayat</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#fe4c6f]" />
              <span>Unduh .md</span>
            </button>
          </div>
        </div>

        {/* Master Prompt Call-To-Action Box */}
        <div className="bg-gradient-to-r from-rose-500 to-[#fe4c6f] border border-[#fe4c6f] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm">
              <Code2 className="w-4 h-4 text-pink-100" />
              <span>MASTER PROMPT UNTUK GOOGLE AI STUDIO</span>
            </div>
            <p className="text-xs text-pink-100 max-w-2xl leading-relaxed">
              Salin Master Prompt ini dan tempelkan langsung ke <strong>Google AI Studio (mode Build)</strong> untuk membuat seluruh file React+Vite multi-halaman secara fisik!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyMasterPrompt}
              className="px-5 py-2.5 rounded-xl bg-white text-[#fe4c6f] hover:bg-pink-50 font-black text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              {copiedMasterPrompt ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Master Prompt Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#fe4c6f]" />
                  <span>Copy Master Prompt (Sekali Klik)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyFullPRD}
              className="px-3.5 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Salin Seluruh PRD Lengkap"
            >
              {copiedFull ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <FileText className="w-4 h-4 text-pink-200" />
              )}
              <span className="hidden md:inline">{copiedFull ? 'Tersalin' : 'Copy PRD Utuh'}</span>
            </button>
          </div>
        </div>

        {/* Readiness Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Skor Kelengkapan Input Form</span>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-1.5 w-56 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-xl hidden group-hover:block z-20 font-normal leading-relaxed">
                  Dihitung dari kelengkapan data form yang Anda isi (nama proyek, halaman, tema, SEO meta), bukan dari evaluasi kualitas output AI.
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{readyScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  readyScore >= 80 ? 'bg-emerald-500' : readyScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${readyScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Kelengkapan brief & konfigurasi untuk eksekusi AI Studio.
            </p>
          </div>

          <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block">Evaluasi Kelengkapan Brief & Konfigurasi:</span>
            <div className="space-y-1.5">
              {scoreReasons.passed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
              {scoreReasons.warnings.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-amber-800 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRD Document Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-xs overflow-x-auto">
        <div className="prose max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-h1:text-2xl prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-3 prose-h2:text-xl prose-h2:text-[#fe4c6f] prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h3:text-lg prose-h3:text-slate-800 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-table:border-collapse prose-th:bg-slate-100 prose-th:p-3 prose-th:border prose-th:border-slate-200 prose-td:p-3 prose-td:border prose-td:border-slate-200 prose-code:text-[#fe4c6f] prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
