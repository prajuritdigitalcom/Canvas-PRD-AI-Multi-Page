import { PRDContextState, PRDQualityScoreResult, QualityScoreBreakdown } from './types.js';
import {
  validateStructuralCompleteness,
  validateMarkdownIntegrity,
  validatePageCompleteness,
  validateSEOAndLegalQuality,
  validateCrossPageConsistency,
} from './validators.js';

export function calculatePRDQualityScore(
  markdown: string,
  state: PRDContextState
): PRDQualityScoreResult {
  const pages = state.architecture?.pages || [];
  const totalPages = pages.length;

  const structVal = validateStructuralCompleteness(markdown);
  const markVal = validateMarkdownIntegrity(markdown);
  const pageVal = validatePageCompleteness(markdown, pages);
  const seoLegalVal = validateSEOAndLegalQuality(markdown, pages);
  const crossVal = validateCrossPageConsistency(state, markdown);

  // 1. Structural Completeness (10%)
  let structuralScore = 10;
  if (!structVal.isValid) structuralScore -= 6;
  if (!markVal.isValid) structuralScore -= 4;

  // 2. Business / Strategy Quality (10%)
  let businessScore = 10;
  if (!/Executive Summary/i.test(markdown)) businessScore -= 3;
  if (!/Problem Statement/i.test(markdown)) businessScore -= 3;
  if (!/Target Audience/i.test(markdown)) businessScore -= 4;

  // 3. Information Architecture & Sitemap (10%)
  let architectureScore = 10;
  if (!/Sitemap/i.test(markdown)) architectureScore -= 5;
  if (!/User Flow/i.test(markdown)) architectureScore -= 5;

  // 4. Design System Consistency (15%)
  let designScore = 15;
  if (!/Skala Tipografi|typographyScale/i.test(markdown)) designScore -= 5;
  if (!/Pasangan Kontras Warna|colorContrastPairs/i.test(markdown)) designScore -= 5;
  if (!/Aturan Larangan|forbidden/i.test(markdown)) designScore -= 5;

  // 5. Page Specification Completeness (20%)
  let pageDetailScore = 20;
  const generatedPageLocks = Object.values(state.generatedPages);
  if (totalPages > 0) {
    const validPagesCount = generatedPageLocks.filter((p) => p.markdown && p.sectionNames.length > 0).length;
    const ratio = validPagesCount / totalPages;
    pageDetailScore = Math.round(20 * ratio);
  }

  // 6. Cross-Page Consistency (15%)
  let crossPageScore = 15;
  if (state.crossPageQA?.rawMarkdown) {
    crossPageScore = 15;
  } else {
    if (!crossVal.isValid) crossPageScore -= 8;
  }

  // 7. SEO Completeness (10%)
  let seoScore = 10;
  const pageWithMetaTitle = generatedPageLocks.filter((p) => p.metaTitle && p.metaTitle.length > 5).length;
  if (totalPages > 0) {
    seoScore = Math.round(10 * (pageWithMetaTitle / totalPages));
  }

  // 8. Accessibility (5%)
  let accessibilityScore = 5;
  if (!/WCAG|Accessibility|Alt text/i.test(markdown)) accessibilityScore -= 3;

  // 9. Technical / Deployment Readiness (5%)
  let technicalScore = 5;
  if (!/Technical Notes|Vercel|GitHub/i.test(markdown)) technicalScore -= 3;
  if (!/Final Instruction For Google AI Studio/i.test(markdown)) technicalScore -= 2;

  const breakdown: QualityScoreBreakdown = {
    structuralScore: Math.max(0, structuralScore),
    businessScore: Math.max(0, businessScore),
    architectureScore: Math.max(0, architectureScore),
    designScore: Math.max(0, designScore),
    pageDetailScore: Math.max(0, pageDetailScore),
    crossPageScore: Math.max(0, crossPageScore),
    seoScore: Math.max(0, seoScore),
    accessibilityScore: Math.max(0, accessibilityScore),
    technicalScore: Math.max(0, technicalScore),
  };

  const totalRaw =
    breakdown.structuralScore +
    breakdown.businessScore +
    breakdown.architectureScore +
    breakdown.designScore +
    breakdown.pageDetailScore +
    breakdown.crossPageScore +
    breakdown.seoScore +
    breakdown.accessibilityScore +
    breakdown.technicalScore;

  const readyScore = Math.min(100, Math.max(50, Math.round(totalRaw)));

  // Collect passed reasons and warnings
  const passed: string[] = [];
  const warnings: string[] = [];

  if (breakdown.structuralScore >= 8) passed.push('Struktur dokumen PRD multi-halaman utuh dan lengkap.');
  if (breakdown.businessScore >= 8) passed.push('Konteks bisnis, tujuan, dan persona terdefinisi kuat.');
  if (breakdown.architectureScore >= 8) passed.push(`Sitemap dan routing map (${totalPages} halaman) terstruktur rapi.`);
  if (breakdown.designScore >= 12) passed.push(`Design tokens dan aturan tema (${state.design?.themeName || 'Theme'}) terkunci.`);
  if (breakdown.pageDetailScore >= 16) passed.push(`Setiap halaman (${totalPages} halaman) memiliki breakdown section mendalam.`);
  if (breakdown.crossPageScore >= 12) passed.push('Cross-Page QA & consistency check berhasil dikunci.');
  if (breakdown.seoScore >= 8) passed.push('Rekomendasi SEO Meta Title & Meta Description per halaman siap pakai.');
  if (breakdown.technicalScore >= 4) passed.push('Technical notes & Master Prompt siap tempel untuk Google AI Studio Build.');

  // Collect warnings from validators
  structVal.warnings.forEach((w) => warnings.push(w));
  markVal.warnings.forEach((w) => warnings.push(w));
  pageVal.warnings.forEach((w) => warnings.push(w));
  seoLegalVal.warnings.forEach((w) => warnings.push(w));
  crossVal.warnings.forEach((w) => warnings.push(w));

  const isBuildReady = readyScore >= 80 && structVal.isValid;

  return {
    readyScore,
    breakdown,
    passed,
    warnings,
    isBuildReady,
  };
}
