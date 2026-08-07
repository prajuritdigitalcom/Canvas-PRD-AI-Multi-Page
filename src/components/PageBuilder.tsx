import React from 'react';
import { PageDefinition, PageType, ProjectFormState } from '../types';
import { PAGE_PRESETS } from '../data/pagePresets';
import { Plus, Trash2, ArrowUp, ArrowDown, Layout, Globe, Sparkles, Info } from 'lucide-react';

interface PageBuilderProps {
  pages: PageDefinition[];
  onChangePages: (pages: PageDefinition[]) => void;
  websiteType: ProjectFormState['websiteType'];
}

export const PageBuilder: React.FC<PageBuilderProps> = ({
  pages,
  onChangePages,
  websiteType,
}) => {
  const addPage = () => {
    const newPageNumber = pages.length + 1;
    const newPage: PageDefinition = {
      id: 'page-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      pageName: `Halaman Baru ${newPageNumber}`,
      pageSlug: `/halaman-${newPageNumber}`,
      pageType: 'Custom',
      pagePurpose: 'Penjelasan tujuan dan fungsi halaman ini.',
      keySections: ['Hero Banner', 'Konten Utama', 'CTA Banner'],
      isInMainNav: true,
      order: pages.length + 1,
    };
    onChangePages([...pages, newPage]);
  };

  const removePage = (id: string) => {
    if (pages.length <= 1) {
      alert('Website multi-halaman membutuhkan minimal 1 halaman dasar.');
      return;
    }
    const filtered = pages.filter((p) => p.id !== id).map((p, idx) => ({ ...p, order: idx + 1 }));
    onChangePages(filtered);
  };

  const updatePage = (id: string, updates: Partial<PageDefinition>) => {
    const updated = pages.map((p) => {
      if (p.id === id) {
        const next = { ...p, ...updates };
        if (updates.pageName && (!p.pageSlug || p.pageSlug === '/' || p.pageSlug === `/${slugify(p.pageName)}`)) {
          next.pageSlug = updates.pageName.toLowerCase() === 'home' || updates.pageName.toLowerCase() === 'beranda' 
            ? '/' 
            : `/${slugify(updates.pageName)}`;
        }
        return next;
      }
      return p;
    });
    onChangePages(updated);
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === pages.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...pages];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    const reordered = copy.map((p, idx) => ({ ...p, order: idx + 1 }));
    onChangePages(reordered);
  };

  const applyPreset = (presetId: string) => {
    const preset = PAGE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    
    if (pages.length > 0 && !confirm(`Ganti ${pages.length} halaman saat ini dengan template preset "${preset.name}"?`)) {
      return;
    }

    const newPages: PageDefinition[] = preset.pages.map((p, idx) => ({
      ...p,
      id: 'page-preset-' + idx + '-' + Date.now(),
      order: idx + 1,
    }));
    onChangePages(newPages);
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const PAGE_TYPES: PageType[] = [
    'Home',
    'About',
    'Services',
    'Service Detail',
    'Portfolio',
    'Blog List',
    'Blog Detail',
    'Team',
    'Pricing',
    'FAQ',
    'Testimonials',
    'Contact',
    'Custom',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#fe4c6f] font-bold text-xs uppercase tracking-wider mb-1">
            <Layout className="w-4 h-4 text-[#fe4c6f]" />
            <span>ARSIREKTUR MULTI-HALAMAN</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Page Builder & Routing Map
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] font-bold border border-[#fe4c6f]/20">
              {pages.length} Halaman
            </span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Susun daftar halaman yang akan dibuat dalam website Anda.
          </p>
        </div>

        {/* Preset quick loader */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-2 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fe4c6f]" />
              <span>Gunakan Preset Halaman</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 hidden group-hover:block z-50">
              <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 border-b border-slate-100 uppercase tracking-wider">
                Pilih Preset Sesuai Kebutuhan
              </div>
              <div className="py-1 space-y-1">
                {PAGE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#fe4c6f]/10 hover:text-[#fe4c6f] text-slate-700 text-xs flex flex-col gap-0.5 transition-colors"
                  >
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{p.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addPage}
            className="px-4 py-2 rounded-xl bg-[#fe4c6f] hover:bg-[#e03b5b] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Halaman</span>
          </button>
        </div>
      </div>

      {pages.length < 2 && (
        <div className="flex items-center gap-3 bg-pink-50 border border-pink-200 text-slate-800 p-3.5 rounded-xl text-xs font-medium">
          <Info className="w-4 h-4 text-[#fe4c6f] shrink-0" />
          <span>
            Website bisnis idealnya memiliki minimal 2-5 halaman (misal: Home, Tentang Kami, Layanan, Kontak) agar memberikan impresi profesional di Google AI Studio.
          </span>
        </div>
      )}

      {/* Page List */}
      <div className="space-y-4">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className="bg-slate-50/70 border border-slate-200 hover:border-pink-300 rounded-xl p-4.5 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#fe4c6f]/10 text-[#fe4c6f] text-xs font-black flex items-center justify-center border border-[#fe4c6f]/20">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={page.pageName}
                  onChange={(e) => updatePage(page.id, { pageName: e.target.value })}
                  placeholder="Nama Halaman (cth: Tentang Kami)"
                  className="bg-white font-extrabold text-slate-900 text-base focus:outline-none focus:ring-1 focus:ring-[#fe4c6f] rounded px-2 py-0.5 border border-slate-200"
                />
                <span className="text-xs text-slate-500 font-mono hidden md:inline">
                  {page.pageSlug}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:border-pink-300">
                  <input
                    type="checkbox"
                    checked={page.isInMainNav}
                    onChange={(e) => updatePage(page.id, { isInMainNav: e.target.checked })}
                    className="rounded border-slate-300 text-[#fe4c6f] focus:ring-[#fe4c6f]"
                  />
                  <span>Tampil di Nav Utama</span>
                </label>

                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => movePage(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                    title="Naikkan urutan"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(index, 'down')}
                    disabled={index === pages.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                    title="Turunkan urutan"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removePage(page.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus Halaman"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">URL Path / Slug</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={page.pageSlug}
                    onChange={(e) => updatePage(page.id, { pageSlug: e.target.value })}
                    placeholder="/layanan"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#fe4c6f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tipe Halaman</label>
                <select
                  value={page.pageType}
                  onChange={(e) => updatePage(page.id, { pageType: e.target.value as PageType })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#fe4c6f]"
                >
                  {PAGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-slate-600 font-semibold mb-1">Section Kunci (Dipisah koma)</label>
                <input
                  type="text"
                  value={page.keySections.join(', ')}
                  onChange={(e) =>
                    updatePage(page.id, {
                      keySections: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Hero, Grid Layanan, Testimoni, CTA"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#fe4c6f]"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-slate-600 font-semibold mb-1">Tujuan & Fungsi Halaman Ini</label>
                <textarea
                  rows={2}
                  value={page.pagePurpose}
                  onChange={(e) => updatePage(page.id, { pagePurpose: e.target.value })}
                  placeholder="Jelaskan peran halaman ini untuk pengunjung (cth: Menampilkan seluruh katalog produk lengkap dengan filter)..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#fe4c6f] resize-none"
                />
              </div>

              {/* Meta Title SEO & Meta Description SEO */}
              <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-semibold">Meta Title SEO</label>
                    <span className={`text-[10px] font-mono ${ (page.metaTitle?.length || 0) > 60 ? 'text-red-500 font-bold' : 'text-slate-400' }`}>
                      {page.metaTitle?.length || 0}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={page.metaTitle || ''}
                    onChange={(e) => updatePage(page.id, { metaTitle: e.target.value })}
                    placeholder="Nama Bisnis - Layanan Utama | Kota"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#fe4c6f] ${
                      (page.metaTitle?.length || 0) > 60 ? 'border-red-400 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-semibold">Meta Description SEO</label>
                    <span className={`text-[10px] font-mono ${ (page.metaDescription?.length || 0) > 160 ? 'text-red-500 font-bold' : 'text-slate-400' }`}>
                      {page.metaDescription?.length || 0}/160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={page.metaDescription || ''}
                    onChange={(e) => updatePage(page.id, { metaDescription: e.target.value })}
                    placeholder="Deskripsi singkat yang menarik, mengandung keyword utama & CTA, maksimal 160 karakter."
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#fe4c6f] resize-none ${
                      (page.metaDescription?.length || 0) > 160 ? 'border-red-400 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

