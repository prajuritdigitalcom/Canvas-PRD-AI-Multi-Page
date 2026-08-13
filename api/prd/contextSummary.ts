import {
  PRDContextState,
  BusinessStrategyLock,
  ArchitectureLock,
  DesignSystemLock,
  SharedLayoutLock,
  SEOLock,
  SEOLockItem,
  LockMeta,
  LockSource,
  LockQuality,
} from './types.js';
import { PageDefinition, ProjectFormState } from '../../src/types.js';

export function extractMarkdownSection(markdown: string, headerPattern: string): string {
  if (!markdown) return '';
  const regex = new RegExp(`(?:#+|\\*\\*|###)\\s*${headerPattern}[^\\n]*\\n([\\s\\S]*?)(?=\\n(?:#+|\\*\\*|###)|$)`, 'i');
  const match = markdown.match(regex);
  return match ? match[1].trim() : '';
}

export function parseBusinessChunkToLock(markdown: string): BusinessStrategyLock {
  const execSummary = extractMarkdownSection(markdown, 'Executive Summary') || extractMarkdownSection(markdown, '1\\.');
  const positioning = extractMarkdownSection(markdown, 'Brand Positioning') || extractMarkdownSection(markdown, 'Positioning');
  const valueProp = extractMarkdownSection(markdown, 'Value Proposition');
  const personas = extractMarkdownSection(markdown, 'Target Audience') || extractMarkdownSection(markdown, 'Personas');
  const goals = extractMarkdownSection(markdown, 'Objectives') || extractMarkdownSection(markdown, 'Goals');
  const metrics = extractMarkdownSection(markdown, 'Success Metrics') || extractMarkdownSection(markdown, 'KPI');
  const competitorAssumptions = extractMarkdownSection(markdown, 'Competitor');

  const issues: string[] = [];
  if (!execSummary) issues.push('Executive Summary missing');
  if (!positioning) issues.push('Brand Positioning missing');
  if (!valueProp) issues.push('Value Proposition missing');

  const quality: LockQuality = issues.length === 0 ? 'VALID' : issues.length <= 2 ? 'WARNING' : 'INVALID';

  return {
    executiveSummary: execSummary,
    positioning,
    valueProposition: valueProp,
    personas,
    goals,
    metrics,
    competitorAssumptions,
    rawMarkdown: markdown,
    meta: {
      source: 'AI_LOCK',
      quality,
      required: true,
      validationIssues: issues,
    },
  };
}

export function parseArchitectureChunkToLock(markdown: string, pages: PageDefinition[]): ArchitectureLock {
  const sitemap = extractMarkdownSection(markdown, 'Sitemap') || extractMarkdownSection(markdown, 'Navigation Structure');
  const navigation = extractMarkdownSection(markdown, 'Navigation');
  const userFlow = extractMarkdownSection(markdown, 'User Flow') || extractMarkdownSection(markdown, 'Information Architecture');
  const responsiveStrategy = extractMarkdownSection(markdown, 'Responsive Strategy');

  const issues: string[] = [];
  if (!sitemap) issues.push('Sitemap missing');
  if (!userFlow) issues.push('User flow missing');

  const quality: LockQuality = issues.length === 0 ? 'VALID' : 'WARNING';

  return {
    sitemap,
    navigation,
    userFlow,
    responsiveStrategy,
    pages,
    rawMarkdown: markdown,
    meta: {
      source: 'AI_LOCK',
      quality,
      required: true,
      validationIssues: issues,
    },
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
    meta: {
      source: 'USER_LOCK',
      quality: 'VALID',
      required: true,
      validationIssues: [],
    },
  };
}

export function parseSharedLayoutChunkToLock(
  markdown: string,
  formState?: ProjectFormState
): SharedLayoutLock {
  // USER EXPLICIT INPUT is HIGHEST AUTHORITY
  let navbarStyle = formState?.sharedLayout?.navbarStyle || 'Standard';
  let footerColumns = formState?.sharedLayout?.footerColumns ?? 4;
  let hasWhatsAppFloatButton = formState?.sharedLayout?.hasWhatsAppFloatButton ?? true;
  let hasStickyCTABar = formState?.sharedLayout?.hasStickyCTABar ?? true;
  let hasNewsletterForm = formState?.sharedLayout?.hasNewsletterForm ?? true;
  let source: LockSource = formState?.sharedLayout ? 'USER_LOCK' : 'AI_LOCK';

  // Check machine-readable marker in AI output
  const startMarker = '<!-- SHARED_LAYOUT_LOCK_START -->';
  const endMarker = '<!-- SHARED_LAYOUT_LOCK_END -->';

  let sharedContract = extractMarkdownSection(markdown, 'Reusable Component Contract') || extractMarkdownSection(markdown, 'Shared Component Contract');

  if (markdown.includes(startMarker) && markdown.includes(endMarker)) {
    const block = markdown.split(startMarker)[1].split(endMarker)[0];
    
    // Parse AI marker recommendations ONLY if user didn't explicitly override
    if (!formState?.sharedLayout) {
      const navMatch = block.match(/NAVBAR_STYLE:\s*(.+)/i);
      if (navMatch) navbarStyle = navMatch[1].trim() as any;

      const colMatch = block.match(/FOOTER_COLUMNS:\s*(\d+)/i);
      if (colMatch) footerColumns = parseInt(colMatch[1], 10);

      const waMatch = block.match(/WHATSAPP_FLOAT:\s*(ON|OFF|true|false)/i);
      if (waMatch) hasWhatsAppFloatButton = /ON|true/i.test(waMatch[1]);

      const ctaMatch = block.match(/STICKY_CTA:\s*(ON|OFF|true|false)/i);
      if (ctaMatch) hasStickyCTABar = /ON|true/i.test(ctaMatch[1]);

      const newsMatch = block.match(/NEWSLETTER:\s*(ON|OFF|true|false)/i);
      if (newsMatch) hasNewsletterForm = /ON|true/i.test(newsMatch[1]);
    }

    const contractMatch = block.match(/SHARED_COMPONENTS_CONTRACT:\s*([\s\S]+)/i);
    if (contractMatch) {
      sharedContract = contractMatch[1].trim();
    }
  }

  return {
    navbarStyle,
    footerColumns,
    hasWhatsAppFloatButton,
    hasStickyCTABar,
    hasNewsletterForm,
    sharedComponentsContract: sharedContract || 'Shared components contract locked.',
    rawMarkdown: markdown,
    meta: {
      source,
      quality: 'VALID',
      required: true,
      validationIssues: [],
    },
  };
}

export function parseSEOStrategyToLock(markdown: string, pages: PageDefinition[]): SEOLock {
  const seoItems: Record<string, SEOLockItem> = {};
  const issues: string[] = [];
  let foundAIMarkersCount = 0;

  pages.forEach((page) => {
    let metaTitle = '';
    let metaDescription = '';
    let searchIntent = page.pagePurpose;

    // 1. Primary Strategy: Machine readable marker <!-- SEO_LOCK_START: pageId -->
    const startMarker = `<!-- SEO_LOCK_START: ${page.id} -->`;
    const endMarker = `<!-- SEO_LOCK_END: ${page.id} -->`;

    if (markdown.includes(startMarker) && markdown.includes(endMarker)) {
      const block = markdown.split(startMarker)[1].split(endMarker)[0];
      foundAIMarkersCount++;

      const titleMatch = block.match(/META_TITLE:\s*(.+)/i);
      if (titleMatch) metaTitle = titleMatch[1].trim();

      const descMatch = block.match(/META_DESCRIPTION:\s*(.+)/i);
      if (descMatch) metaDescription = descMatch[1].trim();

      const intentMatch = block.match(/SEARCH_INTENT:\s*(.+)/i);
      if (intentMatch) searchIntent = intentMatch[1].trim();
    }

    // 2. Fallback Strategy: Regex matching
    if (!metaTitle) {
      const escapedName = page.pageName.replace(/[^a-zA-Z0-9]/g, '.*');
      const escapedSlug = page.pageSlug.replace(/[^a-zA-Z0-9]/g, '.*');
      const pageRegex = new RegExp(`(?:${escapedName}|${escapedSlug}|${page.id})[\\s\\S]*?Meta Title:\\s*(.+?)\\n[\\s\\S]*?Meta Description:\\s*(.+?)(?=\\n|$)`, 'i');
      const match = markdown.match(pageRegex);
      if (match) {
        metaTitle = match[1].trim();
        metaDescription = match[2].trim();
      }
    }

    // 3. Fallback to PageDefinition defaults if parsing failed
    if (!metaTitle) {
      metaTitle = page.metaTitle || `${page.pageName} - ${page.pageSlug}`;
      issues.push(`SEO Title fallback used for ${page.pageName}`);
    }
    if (!metaDescription) {
      metaDescription = page.metaDescription || `Halaman ${page.pageName}`;
      issues.push(`SEO Description fallback used for ${page.pageName}`);
    }

    seoItems[page.id] = {
      slug: page.pageSlug,
      pageName: page.pageName,
      metaTitle,
      metaDescription,
      searchIntent,
    };
  });

  const source: LockSource = foundAIMarkersCount === pages.length ? 'AI_LOCK' : 'FALLBACK';
  const quality: LockQuality = issues.length === 0 ? 'VALID' : 'WARNING';

  return {
    globalRules: extractMarkdownSection(markdown, 'Global Rules') || 'Gunakan Meta Title ≤60 karakter & Meta Description 120-160 karakter.',
    pages: seoItems,
    meta: {
      source,
      quality,
      required: true,
      validationIssues: issues,
    },
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

