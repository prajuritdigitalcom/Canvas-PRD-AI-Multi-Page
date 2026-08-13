import { lockAndSanitizePagePlan, planAdaptivePageBatches } from './pageChunkPlanner.js';
import {
  formatCompactContextLock,
  parseSharedLayoutChunkToLock,
  parseSEOStrategyToLock,
} from './contextSummary.js';
import {
  validateMarkdownIntegrity,
  validateStructuralCompleteness,
  validatePageCompleteness,
  validateSEOAndLegalQuality,
  validateCrossPageConsistency,
  validateFoundationChunk,
  extractPagesFromChunkMarkdown,
  parseCrossPageQAChunkToLock,
} from './validators.js';
import { buildMasterPromptChunkUserPrompt } from './chunkPrompts.js';
import { calculatePRDQualityScore } from './qualityScorer.js';
import { assembleFinalPRDDocument } from './finalAssembler.js';
import { PRDContextState } from './types.js';
import { PRD_CHUNK_KEYS } from './chunkDefinitions.js';

export function testPRDEngine() {
  console.log('Running PRD Engine Unit Tests...');

  // 1. Test Page Plan Lock & Sanitization
  const rawPages = [
    {
      id: 'p1',
      pageName: 'Home ',
      pageSlug: '/',
      pageType: 'Home' as const,
      pagePurpose: 'Main landing page',
      keySections: ['Hero', 'Services'],
      isInMainNav: true,
      order: 1,
    },
    {
      id: 'p2',
      pageName: 'Tentang Kami',
      pageSlug: '/tentang-kami/',
      pageType: 'About' as const,
      pagePurpose: 'Company story',
      keySections: ['Story', 'Team'],
      isInMainNav: true,
      order: 2,
    },
    {
      id: 'p3',
      pageName: 'Layanan',
      pageSlug: '/tentang-kami', // duplicate slug test
      pageType: 'Services' as const,
      pagePurpose: 'List of services',
      keySections: ['Grid'],
      isInMainNav: true,
      order: 3,
    },
  ];

  const lockedPages = lockAndSanitizePagePlan(rawPages);
  if (lockedPages[1].pageSlug !== '/tentang-kami') {
    throw new Error(`Test Failed: Expected slug /tentang-kami, got ${lockedPages[1].pageSlug}`);
  }
  if (lockedPages[2].pageSlug !== '/tentang-kami-1') {
    throw new Error(`Test Failed: Duplicate slug should be resolved to /tentang-kami-1, got ${lockedPages[2].pageSlug}`);
  }
  console.log('✓ Page Plan Lock & Duplicate Slug Resolution Passed');

  // 2. Test Adaptive Page Batching
  const smallBatches = planAdaptivePageBatches(lockedPages); // 3 pages -> 1 page per call
  if (smallBatches.length !== 3) {
    throw new Error(`Test Failed: Small site (3 pages) expected 3 batches, got ${smallBatches.length}`);
  }

  // Large site batching test (8 pages -> 2 pages per batch)
  const manyPages = Array.from({ length: 8 }, (_, i) => ({
    id: `p_${i + 1}`,
    pageName: `Page ${i + 1}`,
    pageSlug: `/page-${i + 1}`,
    pageType: 'Custom' as const,
    pagePurpose: `Purpose ${i + 1}`,
    keySections: ['Section 1', 'Section 2'],
    isInMainNav: true,
    order: i + 1,
  }));

  const mediumBatches = planAdaptivePageBatches(manyPages);
  if (mediumBatches.length !== 4) {
    throw new Error(`Test Failed: 8 pages expected 4 batches of 2 pages, got ${mediumBatches.length}`);
  }
  console.log('✓ Adaptive Page Batching Strategy Passed');

  // 3. Test Markdown Integrity & Validators
  const validMd = `# PROYEK KITA - Multi-Page PRD

## Executive Summary
Ringkasan bisnis...

## Business Overview
Detail bisnis...

## Sitemap
Tabel sitemap...

## Global Design Direction
Design tokens...

## Shared Layout
Header & footer...

## Page-by-Page
### Halaman 1: Home
- Meta Title: Test Title
- Meta Description: Test Description

## Syarat & Ketentuan
Teks hukum T&C...

## Kebijakan Privasi
Teks hukum Privacy...

## Technical Notes
Vercel notes...

## Final Instruction For Google AI Studio
\`\`\`markdown
Master prompt content
\`\`\`
`;

  const markVal = validateMarkdownIntegrity(validMd);
  if (!markVal.isValid) {
    throw new Error(`Test Failed: Valid markdown reported as invalid: ${JSON.stringify(markVal.issues)}`);
  }

  const structVal = validateStructuralCompleteness(validMd);
  if (!structVal.isValid) {
    throw new Error(`Test Failed: Valid structural markdown reported missing headers: ${JSON.stringify(structVal.issues)}`);
  }
  console.log('✓ Markdown & Structural Validators Passed');

  // 4. Test Quality Scorer
  const mockState: PRDContextState = {
    project: {
      projectName: 'PROYEK KITA',
      businessType: 'Agency',
      websiteType: 'Company Profile',
      targetAudience: 'Clients & Target Audience',
      goalWebsite: 'Leads',
      primaryCTA: 'WhatsApp',
      contentLanguage: 'Indonesian',
    },
    architecture: {
      sitemap: 'Sitemap list',
      navigation: 'Standard',
      userFlow: 'User Flow diagram',
      responsiveStrategy: '',
      pages: lockedPages,
      rawMarkdown: '',
    },
    generatedPages: {
      p1: {
        pageId: 'p1',
        pageName: 'Home',
        slug: '/',
        pageType: 'Home',
        purpose: 'Main landing page',
        complexityScore: 5,
        complexityTier: 'MEDIUM',
        markdown: '### Halaman: Home (/)\nMeta Title: Home\nMeta Description: Desc\nSection 1: Hero\nWCAG Accessibility: Alt text provided.',
        sectionNames: ['Hero'],
        metaTitle: 'Home',
        metaDescription: 'Desc',
        internalLinks: ['/tentang-kami'],
        validation: { isValid: true, issues: [], warnings: [] },
      },
      p2: {
        pageId: 'p2',
        pageName: 'Tentang Kami',
        slug: '/tentang-kami',
        pageType: 'About',
        purpose: 'Company story',
        complexityScore: 4,
        complexityTier: 'SIMPLE',
        markdown: '### Halaman: Tentang Kami (/tentang-kami)\nMeta Title: About\nMeta Description: Desc\nSection 1: Story\nWCAG Accessibility: Alt text provided.',
        sectionNames: ['Story'],
        metaTitle: 'About',
        metaDescription: 'Desc',
        internalLinks: ['/layanan'],
        validation: { isValid: true, issues: [], warnings: [] },
      },
      p3: {
        pageId: 'p3',
        pageName: 'Layanan',
        slug: '/tentang-kami-1',
        pageType: 'Services',
        purpose: 'List of services',
        complexityScore: 4,
        complexityTier: 'SIMPLE',
        markdown: '### Halaman: Layanan (/tentang-kami-1)\nMeta Title: Services\nMeta Description: Desc\nSection 1: Grid\nWCAG Accessibility: Alt text provided.',
        sectionNames: ['Grid'],
        metaTitle: 'Services',
        metaDescription: 'Desc',
        internalLinks: ['/'],
        validation: { isValid: true, issues: [], warnings: [] },
      },
    },
    generatedChunks: {
      [PRD_CHUNK_KEYS.CHUNK_1_BUSINESS]: {
        chunkKey: PRD_CHUNK_KEYS.CHUNK_1_BUSINESS,
        stageNumber: 1,
        markdown: '## Executive Summary\nExecutive summary...\n## Problem Statement\nProblem statement...\n## Target Audience\nTarget audience...',
        summary: 'Business',
        status: 'GENERATED',
        attempt: 1,
        validation: { isValid: true, issues: [], warnings: [] },
      },
      [PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE]: {
        chunkKey: PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE,
        stageNumber: 2,
        markdown: '## Sitemap\nSitemap...\n## User Flow\nUser Flow...',
        summary: 'Arch',
        status: 'GENERATED',
        attempt: 1,
        validation: { isValid: true, issues: [], warnings: [] },
      },
      [PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM]: {
        chunkKey: PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM,
        stageNumber: 3,
        markdown: '## Global Design Direction\nSkala Tipografi...\nPasangan Kontras Warna...\nAturan Larangan...',
        summary: 'Design',
        status: 'GENERATED',
        attempt: 1,
        validation: { isValid: true, issues: [], warnings: [] },
      },
      [PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT]: {
        chunkKey: PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT,
        stageNumber: 4,
        markdown: '## Shared Layout\nNavbar & Footer...',
        summary: 'Layout',
        status: 'GENERATED',
        attempt: 1,
        validation: { isValid: true, issues: [], warnings: [] },
      },
      [PRD_CHUNK_KEYS.CHUNK_SEO_STRATEGY]: {
        chunkKey: PRD_CHUNK_KEYS.CHUNK_SEO_STRATEGY,
        stageNumber: 5,
        markdown: '## SEO Strategy\nGlobal SEO rules...',
        summary: 'SEO',
        status: 'GENERATED',
        attempt: 1,
        validation: { isValid: true, issues: [], warnings: [] },
      },
      [PRD_CHUNK_KEYS.CHUNK_6_LEGAL_TECHNICAL]: {
        chunkKey: PRD_CHUNK_KEYS.CHUNK_6_LEGAL_TECHNICAL,
        stageNumber: 7,
        markdown: '## Syarat & Ketentuan\nTerms...\n## Kebijakan Privasi\nPrivacy...\n## Technical Notes for Google AI Studio\nVercel GitHub...',
        summary: 'LegalTech',
        status: 'GENERATED',
        attempt: 1,
        validation: { isValid: true, issues: [], warnings: [] },
      },
      [PRD_CHUNK_KEYS.CHUNK_CROSS_PAGE_QA]: {
        chunkKey: PRD_CHUNK_KEYS.CHUNK_CROSS_PAGE_QA,
        stageNumber: 8,
        markdown: '## Cross-Page QA\nQA Audit Passed...',
        summary: 'QA',
        status: 'GENERATED',
        attempt: 1,
        validation: { isValid: true, issues: [], warnings: [] },
      },
      [PRD_CHUNK_KEYS.CHUNK_MASTER_PROMPT]: {
        chunkKey: PRD_CHUNK_KEYS.CHUNK_MASTER_PROMPT,
        stageNumber: 9,
        markdown: '## Final Instruction For Google AI Studio\nMaster Prompt...',
        summary: 'MasterPrompt',
        status: 'GENERATED',
        attempt: 1,
        validation: { isValid: true, issues: [], warnings: [] },
      },
    },
    completedStages: [],
  };

  const assembled = assembleFinalPRDDocument(mockState);
  if (!assembled.includes('PROYEK KITA')) {
    throw new Error('Test Failed: Assembled PRD missing project title.');
  }

  const scoreResult = calculatePRDQualityScore(assembled, mockState);
  if (scoreResult.readyScore < 70) {
    throw new Error(`Test Failed: Quality score too low for valid document: ${scoreResult.readyScore}`);
  }
  console.log(`✓ Quality Scorer Passed (Calculated Score: ${scoreResult.readyScore}/100)`);

  // 5. Test Foundation Chunk Validation
  const invalidBusinessMd = "Short text";
  const valFoundation = validateFoundationChunk(PRD_CHUNK_KEYS.CHUNK_1_BUSINESS, invalidBusinessMd);
  if (valFoundation.isValid) {
    throw new Error('Test Failed: Short text should fail foundation chunk validation.');
  }
  console.log('✓ Foundation Chunk Validation Test Passed');

  // 6. Test Shared Layout User Precedence
  const mockFormState = {
    sharedLayout: {
      navbarStyle: 'Minimalist' as const,
      footerColumns: 3,
      hasWhatsAppFloatButton: false,
      hasStickyCTABar: true,
      hasNewsletterForm: false,
    },
  } as any;
  const aiMarkdown = `
<!-- SHARED_LAYOUT_LOCK_START -->
NAVBAR_STYLE: MegaMenu
FOOTER_COLUMNS: 5
WHATSAPP_FLOAT: ON
STICKY_CTA: OFF
NEWSLETTER: ON
SHARED_COMPONENTS_CONTRACT: Button, Card
<!-- SHARED_LAYOUT_LOCK_END -->
`;
  const parsedShared = parseSharedLayoutChunkToLock(aiMarkdown, mockFormState);
  if (parsedShared.navbarStyle !== 'Minimalist' || parsedShared.hasWhatsAppFloatButton !== false) {
    throw new Error(`Test Failed: User explicit override not respected! Got navbar ${parsedShared.navbarStyle}`);
  }
  console.log('✓ Shared Layout User Precedence Test Passed');

  // 7. Test SEO Markers & Deterministic Lock
  const seoAiMarkdown = `
<!-- SEO_LOCK_START: p1 -->
META_TITLE: Home Page Title Target
META_DESCRIPTION: Home Page Description Target 120-160 chars
SEARCH_INTENT: Main landing intent
<!-- SEO_LOCK_END: p1 -->
`;
  const parsedSEO = parseSEOStrategyToLock(seoAiMarkdown, lockedPages);
  if (parsedSEO.pages['p1']?.metaTitle !== 'Home Page Title Target') {
    throw new Error(`Test Failed: SEO Lock marker parsing failed! Got ${parsedSEO.pages['p1']?.metaTitle}`);
  }
  console.log('✓ SEO Markers & Deterministic Lock Test Passed');

  // 8. Test Page Extraction Safety (No Whole-Batch Fallback)
  const malformedBatchMd = `
### Halaman: Unrelated Page
Purpose: Random purpose
`;
  const extracted = extractPagesFromChunkMarkdown(malformedBatchMd, [lockedPages[0]]);
  if (extracted['p1'].validation.isValid || extracted['p1'].markdown === malformedBatchMd) {
    throw new Error('Test Failed: Extraction failure should NOT assign full batch markdown as fallback!');
  }
  console.log('✓ Page Extraction Safety (No Whole-Batch Fallback) Test Passed');

  // 9. Test Master Prompt Full Page Specification (No 500-char truncation)
  const longPageMd = 'A'.repeat(2000);
  const mockStateForMasterPrompt: any = {
    project: { projectName: 'TEST' },
    design: { themeId: 'MODERN_CLEAN' },
    generatedPages: {
      p1: {
        pageId: 'p1',
        pageName: 'Home',
        slug: '/',
        purpose: 'Main',
        sectionNames: ['Hero'],
        metaTitle: 'Title',
        metaDescription: 'Desc',
        internalLinks: [],
        markdown: longPageMd,
      },
    },
  };
  const masterUserPrompt = buildMasterPromptChunkUserPrompt({ designThemeId: 'MODERN_CLEAN' } as any, mockStateForMasterPrompt);
  if (!masterUserPrompt.includes(longPageMd)) {
    throw new Error('Test Failed: Master Prompt prompt truncated full page specification!');
  }
  console.log('✓ Master Prompt Full Page Specification Test Passed');

  // 10. Test Cross-Page QA Parsing
  const qaMarkdown = `
<!-- CROSS_PAGE_QA_START -->
NAVIGATION: PASS
TERMINOLOGY: PASS
CTA: WARNING
DESIGN_TOKENS: PASS
INTERNAL_LINKS: PASS
DUPLICATION: PASS
PAGE_ROLE_SEPARATION: PASS
SEO: PASS
RESPONSIVE: PASS
FINDINGS:
- CTA button text slightly inconsistent between Home and Contact.
REPAIRS:
- Standardized CTA text to "Hubungi Kami".
<!-- CROSS_PAGE_QA_END -->
`;
  const parsedQA = parseCrossPageQAChunkToLock(qaMarkdown);
  if (parsedQA.CTAConsistency !== 'WARNING' || parsedQA.findings.length !== 1) {
    throw new Error('Test Failed: Cross-Page QA marker parsing failed!');
  }
  console.log('✓ Cross-Page QA Lock Parsing Test Passed');

  console.log('ALL PRD ENGINE TESTS PASSED SUCCESSFULLY!');
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('prdEngine.test')) {
  testPRDEngine();
}
