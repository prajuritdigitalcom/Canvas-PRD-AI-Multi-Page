import { PRDContextState, BusinessStrategyLock, ArchitectureLock, DesignSystemLock, SharedLayoutLock, SEOLock, SEOLockItem } from './types.js';
import { PageDefinition } from '../../src/types.js';

export function extractMarkdownSection(markdown: string, headerPattern: string): string {
  if (!markdown) return '';
  const regex = new RegExp(`(?:#+|\\*\\*|###)\\s*${headerPattern}[^\\n]*\\n([\\s\\S]*?)(?=\\n(?:#+|\\*\\*|###)|$)`, 'i');
  const match = markdown.match(regex);
  return match ? match[1].trim() : '';
}

export function parseBusinessChunkToLock(markdown: string): BusinessStrategyLock {
  return {
    executiveSummary: extractMarkdownSection(markdown, 'Executive Summary') || extractMarkdownSection(markdown, '1\\.'),
    positioning: extractMarkdownSection(markdown, 'Brand Positioning') || extractMarkdownSection(markdown, 'Positioning'),
    valueProposition: extractMarkdownSection(markdown, 'Value Proposition'),
    personas: extractMarkdownSection(markdown, 'Target Audience') || extractMarkdownSection(markdown, 'Personas'),
    goals: extractMarkdownSection(markdown, 'Objectives') || extractMarkdownSection(markdown, 'Goals'),
    metrics: extractMarkdownSection(markdown, 'Success Metrics') || extractMarkdownSection(markdown, 'KPI'),
    competitorAssumptions: extractMarkdownSection(markdown, 'Competitor'),
    rawMarkdown: markdown,
  };
}

export function parseArchitectureChunkToLock(markdown: string, pages: PageDefinition[]): ArchitectureLock {
  return {
    sitemap: extractMarkdownSection(markdown, 'Sitemap') || extractMarkdownSection(markdown, 'Navigation Structure'),
    navigation: extractMarkdownSection(markdown, 'Navigation'),
    userFlow: extractMarkdownSection(markdown, 'User Flow') || extractMarkdownSection(markdown, 'Information Architecture'),
    responsiveStrategy: extractMarkdownSection(markdown, 'Responsive Strategy'),
    pages: pages,
    rawMarkdown: markdown,
  };
}

export function parseDesignChunkToLock(markdown: string, theme: any): DesignSystemLock {
  return {
    themeId: theme?.id || 'modern-minimalist',
    themeName: theme?.name || 'Modern Minimalist',
    layoutPattern: theme?.rules?.layoutPattern || 'Clean Grid',
    borderRadius: theme?.rules?.borderRadius || '8px / 12px',
    shadow: theme?.rules?.shadow || 'Subtle Drop Shadow',
    colorApproach: theme?.rules?.colorApproach || 'Structured Primary + Neutral Canvas',
    typography: theme?.rules?.typography || 'Plus Jakarta Sans',
    spacing: theme?.rules?.spacing || 'Systematic spacing',
    imagery: theme?.rules?.imagery || 'High quality imagery',
    forbidden: theme?.rules?.forbidden || [],
    typographyScale: theme?.rules?.typographyScale || {},
    colorContrastPairs: theme?.rules?.colorContrastPairs || [],
    rawMarkdown: markdown,
  };
}

export function parseSharedLayoutChunkToLock(markdown: string): SharedLayoutLock {
  return {
    navbarStyle: extractMarkdownSection(markdown, 'Shared Header') || 'Standard',
    footerColumns: 4,
    hasWhatsAppFloatButton: true,
    hasStickyCTABar: true,
    hasNewsletterForm: true,
    sharedComponentsContract: extractMarkdownSection(markdown, 'Reusable Component Contract') || extractMarkdownSection(markdown, 'Shared Component Contract'),
    rawMarkdown: markdown,
  };
}

export function parseSEOStrategyToLock(markdown: string, pages: PageDefinition[]): SEOLock {
  const seoItems: Record<string, SEOLockItem> = {};

  pages.forEach((page) => {
    // Look for meta title & description for this page in markdown
    const pageRegex = new RegExp(`(?:${page.pageName}|${page.pageSlug})[\\s\\S]*?Meta Title:\\s*(.+?)\\n[\\s\\S]*?Meta Description:\\s*(.+?)(?=\\n|$)`, 'i');
    const match = markdown.match(pageRegex);

    seoItems[page.id] = {
      slug: page.pageSlug,
      pageName: page.pageName,
      metaTitle: match ? match[1].trim() : page.metaTitle || `${page.pageName} - ${page.pageSlug}`,
      metaDescription: match ? match[2].trim() : page.metaDescription || `Halaman ${page.pageName}`,
    };
  });

  return {
    globalRules: extractMarkdownSection(markdown, 'Global Rules') || 'Gunakan Meta Title ≤60 karakter & Meta Description 120-160 karakter.',
    pages: seoItems,
  };
}

export function formatCompactContextLock(
  state: PRDContextState,
  currentPageId?: string
): string {
  const proj = state.project;
  const design = state.design;
  const layout = state.sharedLayout;
  const arch = state.architecture;
  const strat = state.strategy;
  const seo = state.seo;

  // Format Pages Sitemap List
  const pageList = arch?.pages || [];
  const sitemapSummary = pageList
    .map(
      (p) =>
        `- **${p.pageName}** (\`${p.pageSlug}\`) [${p.pageType}] — ${
          p.isInMainNav ? 'Nav Utama' : 'Sub-page'
        }`
    )
    .join('\n');

  // Format Business Reasoning Summary
  let strategySummary = '';
  if (strat?.positioning || strat?.valueProposition) {
    strategySummary = `
- **Positioning**: ${strat.positioning.slice(0, 180)}...
- **Value Proposition**: ${strat.valueProposition.slice(0, 180)}...
- **Goals & Metrics**: ${strat.goals ? strat.goals.slice(0, 150) : proj.goalWebsite}`;
  }

  // Format Theme Typography Scale
  let typographyScaleText = '';
  if (design?.typographyScale) {
    const scale = design.typographyScale;
    typographyScaleText = `
- **SKALA TIPOGRAFI TERKUNCI (WAJIB DIPAKAI IDENTIK SEBAGAI DESIGN TOKENS)**:
  - H1: Desktop ${scale.h1?.desktop || '48px'} / Tablet ${scale.h1?.tablet || '38px'} / Mobile ${scale.h1?.mobile || '30px'}
  - H2: Desktop ${scale.h2?.desktop || '36px'} / Tablet ${scale.h2?.tablet || '30px'} / Mobile ${scale.h2?.mobile || '24px'}
  - H3: Desktop ${scale.h3?.desktop || '24px'} / Tablet ${scale.h3?.tablet || '20px'} / Mobile ${scale.h3?.mobile || '18px'}
  - H4: Desktop ${scale.h4?.desktop || '20px'} / Tablet ${scale.h4?.tablet || '18px'} / Mobile ${scale.h4?.mobile || '16px'}
  - Body Large: Desktop ${scale.bodyLarge?.desktop || '18px'} / Tablet ${scale.bodyLarge?.tablet || '16px'} / Mobile ${scale.bodyLarge?.mobile || '15px'}
  - Body: Desktop ${scale.body?.desktop || '16px'} / Tablet ${scale.body?.tablet || '15px'} / Mobile ${scale.body?.mobile || '14px'}
  - Caption: Desktop ${scale.caption?.desktop || '13px'} / Tablet ${scale.caption?.tablet || '12px'} / Mobile ${scale.caption?.mobile || '11px'}`;
  }

  // Format Color Contrast Pairs
  let colorPairsText = '';
  if (design?.colorContrastPairs && design.colorContrastPairs.length > 0) {
    colorPairsText = `
- **PASANGAN KONTRAS WARNA TERKUNCI**:
${design.colorContrastPairs
  .map(
    (p) =>
      `  - Latar ${p.backgroundToken} -> Teks ${p.textToken} (${p.usage})`
  )
  .join('\n')}`;
  }

  // Format Forbidden Rules
  let forbiddenText = '';
  if (design?.forbidden && design.forbidden.length > 0) {
    forbiddenText = `
- **ATURAN LARANGAN TEMA (DILARANG LANGGAR)**:
${design.forbidden.map((f) => `  - ${f}`).join('\n')}`;
  }

  // Current page lock highlight
  let currentPageHighlight = '';
  if (currentPageId) {
    const cp = pageList.find((p) => p.id === currentPageId);
    const seoItem = seo?.pages[currentPageId];
    if (cp) {
      currentPageHighlight = `
### 🎯 TARGET HALAMAN SAAT INI (CURRENT PAGE CONTRACT):
- **Page ID**: \`${cp.id}\`
- **Nama Halaman**: ${cp.pageName}
- **URL Path / Slug**: \`${cp.pageSlug}\`
- **Tipe Halaman**: ${cp.pageType} ${cp.customPageType ? `(${cp.customPageType})` : ''}
- **Nav Utama**: ${cp.isInMainNav ? 'Ya' : 'Tidak'}
- **Tujuan Halaman**: ${cp.pagePurpose}
- **Section Kunci Wajib**: ${cp.keySections.join(', ')}
- **SEO Meta Title Target**: ${seoItem?.metaTitle || cp.metaTitle || `(Buatkan rekomendasi ≤60 karakter)`}
- **SEO Meta Description Target**: ${seoItem?.metaDescription || cp.metaDescription || `(Buatkan rekomendasi 120-160 karakter)`}
`;
    }
  }

  return `
===================== LOCKED GLOBAL CONTEXT =====================
### 🔒 1. BUSINESS & BRAND LOCK
- **Nama Proyek**: ${proj.projectName}
- **Industri / Jenis Bisnis**: ${proj.businessType}
- **Kategori Website**: ${proj.websiteType}
- **Target Audiens**: ${proj.targetAudience}
- **Goal Utama**: ${proj.goalWebsite}
- **Primary CTA**: ${proj.primaryCTA}
- **Bahasa Konten**: ${proj.contentLanguage}
${strategySummary}

### 🔒 2. SITEMAP & NAVIGATION LOCK
${sitemapSummary}

### 🔒 3. DESIGN THEME & TOKENS LOCK
- **Tema Terpilih**: ${design?.themeName || 'Modern Minimalist'} (\`${design?.themeId || 'modern-minimalist'}\`)
- **Layout Pattern**: ${design?.layoutPattern || 'Clean Grid'}
- **Border Radius**: ${design?.borderRadius || '8px / 12px'}
- **Shadow**: ${design?.shadow || 'Subtle Drop Shadow'}
- **Pendekatan Warna**: ${design?.colorApproach || 'Structured Primary + Neutral Canvas'}
${typographyScaleText}
${colorPairsText}
${forbiddenText}

### 🔒 4. SHARED LAYOUT & COMPONENT CONTRACT LOCK
- **Navbar Style**: ${layout?.navbarStyle || 'Standard'}
- **Footer Columns**: ${layout?.footerColumns || 4} Kolom
- **WhatsApp Floating Button**: ${layout?.hasWhatsAppFloatButton ? 'Wajib Ada' : 'Tidak Ada'}
- **Sticky CTA Bar Mobile**: ${layout?.hasStickyCTABar ? 'Wajib Ada' : 'Tidak Ada'}
- **Form Newsletter**: ${layout?.hasNewsletterForm ? 'Wajib Ada' : 'Tidak Ada'}
${layout?.sharedComponentsContract ? `- **Shared Components Contract**: ${layout.sharedComponentsContract.slice(0, 200)}...` : ''}
=================================================================
${currentPageHighlight}`;
}

