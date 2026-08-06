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
  ChevronRight,
  ExternalLink,
  Layers,
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

  // Extract Master Prompt from Section 13
  const extractMasterPrompt = (): string => {
    const match = markdown.match(/```markdown([\s\S]*?)```/);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Fallback if no block match
    const sectionIndex = markdown.indexOf('## 13. Final Instruction');
    if (sectionIndex !== -1) {
      return markdown.substring(sectionIndex).trim();
    }
    return markdown;
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>PRD MULTI-HALAMAN HASIL GENERATE</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {formState.projectName || 'PRD Website Multi-Halaman'}
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {pageCount} Halaman Terdefinisi
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                Google AI Studio Build Mode
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {formState.websiteType}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onEdit}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span>Edit Form</span>
            </button>

            <button
              type="button"
              onClick={onSaveToHistory}
              disabled={isSaved}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isSaved
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 cursor-default'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-amber-400" />
                  <span>Simpan ke Riwayat</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Unduh .md</span>
            </button>
          </div>
        </div>

        {/* Master Prompt Call-To-Action Box */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>MASTER PROMPT UNTUK GOOGLE AI STUDIO</span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Salin Master Prompt ini dan tempelkan langsung ke <strong>Google AI Studio (mode Build)</strong> untuk membuat seluruh file React+Vite multi-halaman secara fisik!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyMasterPrompt}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              {copiedMasterPrompt ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Master Prompt Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Master Prompt (Sekali Klik)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyFullPRD}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Salin Seluruh PRD Lengkap"
            >
              {copiedFull ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <FileText className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden md:inline">{copiedFull ? 'Tersalin' : 'Copy PRD Utuh'}</span>
            </button>
          </div>
        </div>

        {/* Readiness Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <span className="text-xs font-semibold text-slate-400">Skor Kesiapan Build (AI Studio)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{readyScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  readyScore >= 80 ? 'bg-emerald-500' : readyScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${readyScore}%` }}
              />
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block">Evaluasi Kelengkapan Struktur:</span>
            <div className="space-y-1.5">
              {scoreReasons.passed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
              {scoreReasons.warnings.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRD Document Content */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl overflow-x-auto">
        <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-100 prose-h1:text-2xl prose-h1:border-b prose-h1:border-slate-800 prose-h1:pb-3 prose-h2:text-xl prose-h2:text-indigo-300 prose-h2:border-b prose-h2:border-slate-800/60 prose-h2:pb-2 prose-h3:text-lg prose-h3:text-cyan-300 prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-table:border-collapse prose-th:bg-slate-950 prose-th:p-3 prose-th:border prose-th:border-slate-800 prose-td:p-3 prose-td:border prose-td:border-slate-800 prose-code:text-cyan-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
