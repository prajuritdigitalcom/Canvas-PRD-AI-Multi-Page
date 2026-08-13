import { ValidationIssue, ValidationResult, PRDContextState, GeneratedPageLock, CrossPageQALock, FinalQALock } from './types.js';
import { PageDefinition } from '../../src/types.js';
import { calculatePageComplexity } from './pageChunkPlanner.js';

export function extractPagesFromChunkMarkdown(
  markdown: string,
  batchPages: PageDefinition[]
): Record<string, GeneratedPageLock> {
  const result: Record<string, GeneratedPageLock> = {};

  for (const page of batchPages) {
    const pageId = page.id;
    let pageMarkdown = '';
    let extractionFailed = false;

    // 1. Primary Strategy: Marker Extraction <!-- PAGE_START: pageId -->
    const startMarker = `<!-- PAGE_START: ${pageId} -->`;
    const endMarker = `<!-- PAGE_END: ${pageId} -->`;

    if (markdown.includes(startMarker) && markdown.includes(endMarker)) {
      const parts = markdown.split(startMarker);
      if (parts.length > 1) {
        pageMarkdown = parts[1].split(endMarker)[0].trim();
      }
    }

    // 2. Fallback Strategy: Regex Matching if markers were dropped by LLM
    if (!pageMarkdown) {
      const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedName = escapeRegExp(page.pageName.trim());
      const escapedSlug = page.pageSlug !== '/' ? escapeRegExp(page.pageSlug) : '(?<![a-zA-Z0-9])\\/(?![a-zA-Z0-9])';
      const pageRegex = new RegExp(`(?:###|##)\\s*.*(?:${escapedName}|${escapedSlug}|${page.id})[\\s\\S]*?(?=(?:###|##)\\s*.*(?:Halaman|PAGE_START)|$)`, 'i');
      const match = markdown.match(pageRegex);
      if (match) {
        pageMarkdown = match[0].trim();
      }
    }

    // CRITICAL (P0.3): NEVER assign full batch markdown to a single page when extraction fails!
    if (!pageMarkdown) {
      extractionFailed = true;
      pageMarkdown = '';
    }

    // Extract Section Names
    const sectionNames: string[] = [];
    if (pageMarkdown) {
      const sectionMatches = pageMarkdown.matchAll(/(?:####|###|\*\*)\s*(?:Section|\d+\.)\s*(.+?)(?:\n|\*|$)/gi);
      for (const match of sectionMatches) {
        const name = match[1].replace(/[\*\_]/g, '').trim();
        if (name && !sectionNames.includes(name)) {
          sectionNames.push(name);
        }
      }
    }
    if (sectionNames.length === 0 && page.keySections) {
      sectionNames.push(...page.keySections);
    }

    // Extract Meta Title & Description
    let metaTitle = page.metaTitle || `${page.pageName} - ${page.pageSlug}`;
    let metaDescription = page.metaDescription || `Halaman ${page.pageName}`;

    if (pageMarkdown) {
      const titleMatch = pageMarkdown.match(/SEO Meta Title Target:\s*(.+)/i) || pageMarkdown.match(/Meta Title:\s*(.+)/i);
      if (titleMatch) metaTitle = titleMatch[1].trim();

      const descMatch = pageMarkdown.match(/SEO Meta Description Target:\s*(.+)/i) || pageMarkdown.match(/Meta Description:\s*(.+)/i);
      if (descMatch) metaDescription = descMatch[1].trim();
    }

    // Extract Internal Links
    const internalLinks: string[] = [];
    if (pageMarkdown) {
      const linkMatches = pageMarkdown.matchAll(/`(\/[a-z0-9\-\_]*)`/gi);
      for (const match of linkMatches) {
        const link = match[1];
        if (link && link !== page.pageSlug && !internalLinks.includes(link)) {
          internalLinks.push(link);
        }
      }
    }

    const comp = calculatePageComplexity(page);
    let validation = validateMarkdownIntegrity(pageMarkdown);

    if (extractionFailed) {
      validation = {
        isValid: false,
        issues: [
          {
            type: 'CRITICAL',
            category: 'PAGE',
            message: `Page extraction failed: content/markers missing for page "${page.pageName}" (\`${page.id}\`).`,
            target: pageId,
          },
        ],
        warnings: ['Page content was empty after extraction from batch output.'],
      };
    }

    result[pageId] = {
      pageId,
      pageName: page.pageName,
      slug: page.pageSlug,
      pageType: page.pageType,
      purpose: page.pagePurpose,
      complexityScore: comp.score,
      complexityTier: comp.tier,
      markdown: pageMarkdown,
      sectionNames,
      metaTitle,
      metaDescription,
      internalLinks,
      validation,
    };
  }

  return result;
}

export function validateFoundationChunk(chunkKey: string, markdown: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  if (!markdown || markdown.trim().length < 100) {
    issues.push({
      type: 'CRITICAL',
      category: 'STRUCTURE',
      message: `Foundation chunk "${chunkKey}" is empty or too short.`,
    });
    return { isValid: false, issues, warnings };
  }

  const markVal = validateMarkdownIntegrity(markdown);
  if (!markVal.isValid) {
    issues.push(...markVal.issues);
  }
  warnings.push(...markVal.warnings);

  // Specific key checks
  if (chunkKey.includes('business')) {
    if (!/Executive Summary/i.test(markdown)) issues.push({ type: 'CRITICAL', category: 'STRUCTURE', message: 'Business chunk missing "Executive Summary".' });
    if (!/Problem Statement/i.test(markdown)) issues.push({ type: 'CRITICAL', category: 'STRUCTURE', message: 'Business chunk missing "Problem Statement".' });
    if (!/Target Audience/i.test(markdown)) issues.push({ type: 'CRITICAL', category: 'STRUCTURE', message: 'Business chunk missing "Target Audience".' });
  } else if (chunkKey.includes('architecture')) {
    if (!/Sitemap/i.test(markdown)) issues.push({ type: 'CRITICAL', category: 'STRUCTURE', message: 'Architecture chunk missing "Sitemap".' });
    if (!/User Flow/i.test(markdown)) issues.push({ type: 'CRITICAL', category: 'STRUCTURE', message: 'Architecture chunk missing "User Flow".' });
  } else if (chunkKey.includes('design')) {
    if (!/Skala Tipografi|Typography/i.test(markdown)) warnings.push('Design System chunk missing explicit typography scale.');
  }

  const isValid = issues.filter((i) => i.type === 'CRITICAL').length === 0;
  return { isValid, issues, warnings };
}

export function parseCrossPageQAChunkToLock(markdown: string): CrossPageQALock {
  let nav = 'FAIL';
  let term = 'FAIL';
  let cta = 'FAIL';
  let design = 'FAIL';
  let shared = 'FAIL';
  let links = 'FAIL';
  let dups = 'FAIL';
  let role = 'FAIL';
  let seo = 'FAIL';
  let resp = 'FAIL';
  let conv = 'FAIL';
  let routing = 'FAIL';

  let parseValid = true;
  const criticalFindings: string[] = [];
  const findings: string[] = [];
  const repairs: string[] = [];

  const startMarker = '<!-- CROSS_PAGE_QA_START -->';
  const endMarker = '<!-- CROSS_PAGE_QA_END -->';

  if (markdown && markdown.includes(startMarker) && markdown.includes(endMarker)) {
    const block = markdown.split(startMarker)[1].split(endMarker)[0];

    const getVal = (key: string): string | null => {
      const match = block.match(new RegExp(`${key}:\\s*(PASS|WARNING|FAIL)`, 'i'));
      return match ? match[1].toUpperCase() : null;
    };

    const requiredKeys: Array<{ key: string; assign: (v: string) => void }> = [
      { key: 'NAVIGATION', assign: (v) => (nav = v) },
      { key: 'TERMINOLOGY', assign: (v) => (term = v) },
      { key: 'CTA', assign: (v) => (cta = v) },
      { key: 'DESIGN_TOKENS', assign: (v) => (design = v) },
      { key: 'SHARED_COMPONENTS', assign: (v) => (shared = v) },
      { key: 'INTERNAL_LINKS', assign: (v) => (links = v) },
      { key: 'DUPLICATION', assign: (v) => (dups = v) },
      { key: 'PAGE_ROLE_SEPARATION', assign: (v) => (role = v) },
      { key: 'SEO', assign: (v) => (seo = v) },
      { key: 'RESPONSIVE', assign: (v) => (resp = v) },
      { key: 'CONVERSION_FLOW', assign: (v) => (conv = v) },
      { key: 'ROUTING', assign: (v) => (routing = v) },
    ];

    for (const item of requiredKeys) {
      const val = getVal(item.key);
      if (val) {
        item.assign(val);
      } else {
        parseValid = false;
      }
    }

    const critMatch = block.match(/CRITICAL_FINDINGS:\s*([\s\S]*?)(?=(?:FINDINGS|REPAIRS):|$)/i);
    if (critMatch) {
      critMatch[1].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-')).forEach((l) => {
        const item = l.slice(1).trim();
        if (item && !['none', 'tidak ada', 'nil', '-'].includes(item.toLowerCase())) {
          criticalFindings.push(item);
        }
      });
    }

    const findingsMatch = block.match(/FINDINGS:\s*([\s\S]*?)(?=(?:REPAIRS|CRITICAL_FINDINGS):|$)/i);
    if (findingsMatch) {
      findingsMatch[1].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-')).forEach((l) => {
        const item = l.slice(1).trim();
        if (item && !['none', 'tidak ada', 'nil', '-'].includes(item.toLowerCase())) {
          findings.push(item);
        }
      });
    }

    const repairsMatch = block.match(/REPAIRS:\s*([\s\S]*?)$/i);
    if (repairsMatch) {
      repairsMatch[1].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-')).forEach((l) => {
        const item = l.slice(1).trim();
        if (item && !['none', 'tidak ada', 'nil', '-'].includes(item.toLowerCase())) {
          repairs.push(item);
        }
      });
    }
  } else {
    parseValid = false;
  }

  return {
    navigationConsistency: nav,
    terminologyConsistency: term,
    CTAConsistency: cta,
    designTokenConsistency: design,
    sharedComponentsConsistency: shared,
    internalLinkConsistency: links,
    sectionDuplicationCheck: dups,
    pageRoleSeparation: role,
    seoConsistency: seo,
    responsiveConsistency: resp,
    conversionFlowConsistency: conv,
    routingConsistency: routing,
    criticalFindings,
    findings,
    requiredRepairs: repairs,
    rawMarkdown: markdown,
    parseValid,
  };
}

export function parseFinalQAChunkToLock(markdown: string): FinalQALock {
  let status: 'PASS' | 'REPAIR_REQUIRED' | 'FAIL' = 'FAIL';
  let structural: 'PASS' | 'FAIL' = 'FAIL';
  let semantic: 'PASS' | 'FAIL' = 'FAIL';
  let seo: 'PASS' | 'FAIL' = 'FAIL';
  let legal: 'PASS' | 'FAIL' = 'FAIL';
  let technical: 'PASS' | 'FAIL' = 'FAIL';
  let implementationReady: 'PASS' | 'FAIL' = 'FAIL';

  let parseValid = true;
  const criticalFindings: string[] = [];
  const findings: string[] = [];
  const requiredRepairs: string[] = [];

  const startMarker = '<!-- FINAL_QA_START -->';
  const endMarker = '<!-- FINAL_QA_END -->';

  if (markdown && markdown.includes(startMarker) && markdown.includes(endMarker)) {
    const block = markdown.split(startMarker)[1].split(endMarker)[0];

    const getVal = (key: string): 'PASS' | 'FAIL' | null => {
      const match = block.match(new RegExp(`${key}:\\s*(PASS|FAIL)`, 'i'));
      if (!match) return null;
      return match[1].toUpperCase() as 'PASS' | 'FAIL';
    };

    const statusMatch = block.match(/STATUS:\s*(PASS|REPAIR_REQUIRED|FAIL)/i);
    if (statusMatch) {
      status = statusMatch[1].toUpperCase() as any;
    } else {
      parseValid = false;
      status = 'REPAIR_REQUIRED';
    }

    const requiredKeys: Array<{ key: string; assign: (v: 'PASS' | 'FAIL') => void }> = [
      { key: 'STRUCTURAL', assign: (v) => (structural = v) },
      { key: 'SEMANTIC', assign: (v) => (semantic = v) },
      { key: 'SEO', assign: (v) => (seo = v) },
      { key: 'LEGAL', assign: (v) => (legal = v) },
      { key: 'TECHNICAL', assign: (v) => (technical = v) },
      { key: 'IMPLEMENTATION_READY', assign: (v) => (implementationReady = v) },
    ];

    for (const item of requiredKeys) {
      const v = getVal(item.key);
      if (v) {
        item.assign(v);
      } else {
        parseValid = false;
      }
    }

    const critMatch = block.match(/CRITICAL_FINDINGS:\s*([\s\S]*?)(?=(?:FINDINGS|REPAIRS):|$)/i);
    if (critMatch) {
      critMatch[1].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-')).forEach((l) => {
        const item = l.slice(1).trim();
        if (item && !['none', 'tidak ada', 'nil', '-'].includes(item.toLowerCase())) {
          criticalFindings.push(item);
        }
      });
    }

    const findingsMatch = block.match(/FINDINGS:\s*([\s\S]*?)(?=(?:REPAIRS|CRITICAL_FINDINGS):|$)/i);
    if (findingsMatch) {
      findingsMatch[1].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-')).forEach((l) => {
        const item = l.slice(1).trim();
        if (item && !['none', 'tidak ada', 'nil', '-'].includes(item.toLowerCase())) {
          findings.push(item);
        }
      });
    }

    const repairsMatch = block.match(/REPAIRS:\s*([\s\S]*?)$/i);
    if (repairsMatch) {
      repairsMatch[1].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-')).forEach((l) => {
        const item = l.slice(1).trim();
        if (item && !['none', 'tidak ada', 'nil', '-'].includes(item.toLowerCase())) {
          requiredRepairs.push(item);
        }
      });
    }

    if (!parseValid && status === 'PASS') {
      status = 'REPAIR_REQUIRED';
    }

    if (criticalFindings.length > 0 && status === 'PASS') {
      status = 'REPAIR_REQUIRED';
    }
  } else {
    parseValid = false;
    status = 'REPAIR_REQUIRED';
    findings.push('Final QA marker block was missing from output.');
  }

  return {
    status,
    structural,
    semantic,
    seo,
    legal,
    technical,
    implementationReady,
    criticalFindings,
    findings,
    requiredRepairs,
    rawMarkdown: markdown,
    parseValid,
  };
}

export function validateMarkdownIntegrity(markdown: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  if (!markdown || markdown.trim().length === 0) {
    issues.push({
      type: 'CRITICAL',
      category: 'MARKDOWN',
      message: 'Markdown content is empty.',
    });
    return { isValid: false, issues, warnings };
  }

  // 1. Code Fence Balance
  const fenceMatches = markdown.match(/```/g) || [];
  if (fenceMatches.length % 2 !== 0) {
    issues.push({
      type: 'CRITICAL',
      category: 'MARKDOWN',
      message: 'Unbalanced code fences detected (odd number of ``` blocks). Output might be truncated.',
    });
  }

  // 2. Truncation Heuristics at Document End
  const trimmed = markdown.trim();
  const lastLine = trimmed.split('\n').pop() || '';
  if (
    lastLine.endsWith('...') ||
    lastLine.match(/^#+\s*$/) ||
    lastLine.match(/\|\s*$/) ||
    (trimmed.length > 500 && !lastLine.match(/[.!?`"'\n:]$/))
  ) {
    warnings.push('Document appears to end abruptly or mid-sentence. Potential output truncation.');
  }

  // 3. Unclosed Tables
  const lines = trimmed.split('\n');
  let inTable = false;
  let tableHeaderCols = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const cols = line.split('|').length;
      if (!inTable) {
        inTable = true;
        tableHeaderCols = cols;
      } else {
        if (Math.abs(cols - tableHeaderCols) > 1 && !line.includes('---')) {
          warnings.push(`Markdown table row at line ${i + 1} has mismatched column count.`);
        }
      }
    } else {
      inTable = false;
    }
  }

  const isValid = issues.filter((i) => i.type === 'CRITICAL').length === 0;
  return { isValid, issues, warnings };
}

export function validateStructuralCompleteness(markdown: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  const requiredSections = [
    'Executive Summary',
    'Business Overview',
    'Sitemap',
    'Global Design Direction',
    'Shared Layout',
    'Syarat & Ketentuan',
    'Kebijakan Privasi',
    'Technical Notes',
    'Final Instruction For Google AI Studio',
  ];

  for (const reqSec of requiredSections) {
    const regex = new RegExp(`#+\\s*.*${reqSec}`, 'i');
    if (!regex.test(markdown)) {
      issues.push({
        type: 'CRITICAL',
        category: 'STRUCTURE',
        message: `Required section header missing or incomplete: "${reqSec}".`,
      });
    }
  }

  const isValid = issues.filter((i) => i.type === 'CRITICAL').length === 0;
  return { isValid, issues, warnings };
}

export function validatePageCompleteness(
  markdown: string,
  expectedPages: PageDefinition[]
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  for (const page of expectedPages) {
    const pageRegex = new RegExp(`(###|##)\\s*.*${page.pageName.replace(/[^a-zA-Z0-9]/g, '.*')}`, 'i');
    if (!pageRegex.test(markdown)) {
      issues.push({
        type: 'CRITICAL',
        category: 'PAGE',
        message: `Page breakdown section is missing for page "${page.pageName}" (\`${page.pageSlug}\`).`,
        target: page.id,
      });
    } else {
      // Check Meta Title & Description for this page
      const pageChunkIndex = markdown.search(pageRegex);
      const pageChunkText = markdown.slice(pageChunkIndex, pageChunkIndex + 3000);

      if (!/Meta Title/i.test(pageChunkText)) {
        warnings.push(`Page "${page.pageName}" missing explicit SEO Meta Title in breakdown.`);
      }
      if (!/Meta Description/i.test(pageChunkText)) {
        warnings.push(`Page "${page.pageName}" missing explicit SEO Meta Description in breakdown.`);
      }
    }
  }

  const isValid = issues.filter((i) => i.type === 'CRITICAL').length === 0;
  return { isValid, issues, warnings };
}

export function validateSEOAndLegalQuality(
  markdown: string,
  pages: PageDefinition[]
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  // Legal checks
  if (!/Syarat & Ketentuan|Terms & Conditions/i.test(markdown)) {
    issues.push({
      type: 'CRITICAL',
      category: 'LEGAL',
      message: 'Terms & Conditions section is missing.',
    });
  }

  if (!/Kebijakan Privasi|Privacy Policy/i.test(markdown)) {
    issues.push({
      type: 'CRITICAL',
      category: 'LEGAL',
      message: 'Privacy Policy section is missing.',
    });
  }

  if (/Lorem ipsum|\[Isi teks di sini\]|\[Isi di sini\]/i.test(markdown)) {
    warnings.push('Placeholder text ("Lorem ipsum" or "[Isi di sini]") detected in document. Replace with concrete text.');
  }

  // SEO Duplicate checks
  const metaTitles: string[] = [];
  const metaDescMatches = markdown.matchAll(/Meta Title:\s*(.+)/gi);
  for (const match of metaDescMatches) {
    const title = match[1].trim();
    if (metaTitles.includes(title)) {
      warnings.push(`Duplicate Meta Title found: "${title}". Each page should have a unique SEO title.`);
    } else {
      metaTitles.push(title);
    }
  }

  const isValid = issues.filter((i) => i.type === 'CRITICAL').length === 0;
  return { isValid, issues, warnings };
}

export function validateCrossPageConsistency(
  state: PRDContextState,
  allPagesMarkdown: string
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  const projectName = state.project.projectName;

  if (projectName && projectName !== 'Belum Ditentukan') {
    const nameMentioned = new RegExp(projectName.replace(/[^a-zA-Z0-9]/g, '.*'), 'i').test(allPagesMarkdown);
    if (!nameMentioned) {
      warnings.push(`Project name "${projectName}" was not explicitly mentioned in the generated page breakdowns.`);
    }
  }

  // Check Master Prompt
  if (!/Final Instruction For Google AI Studio/i.test(allPagesMarkdown)) {
    issues.push({
      type: 'CRITICAL',
      category: 'TECHNICAL',
      message: 'Section "Final Instruction For Google AI Studio" (Master Prompt) is missing.',
    });
  }

  const isValid = issues.filter((i) => i.type === 'CRITICAL').length === 0;
  return { isValid, issues, warnings };
}

