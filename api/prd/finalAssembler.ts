import { PRDContextState } from './types.js';
import { PRD_CHUNK_KEYS } from './chunkDefinitions.js';

export function assembleFinalPRDDocument(state: PRDContextState): string {
  const proj = state.project;
  const chunks = state.generatedChunks;

  const headerTitle = `# ${proj.projectName.toUpperCase()} - Multi-Page Product Requirement Document (PRD)\n\n`;

  // Canonical Chunk Ordering
  const chunk1 = chunks[PRD_CHUNK_KEYS.CHUNK_1_BUSINESS]?.markdown || '';
  const chunk2 = chunks[PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE]?.markdown || '';
  const chunk3 = chunks[PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM]?.markdown || '';
  const chunk4 = chunks[PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT]?.markdown || '';
  const chunkSEO = chunks[PRD_CHUNK_KEYS.CHUNK_SEO_STRATEGY]?.markdown || '';

  // Assemble Page Breakdowns in Canonical Order
  const pages = state.architecture?.pages || [];
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  const pagesMarkdown = sortedPages
    .map((p) => {
      const pageLock = state.generatedPages[p.id];
      return pageLock ? pageLock.markdown : '';
    })
    .filter(Boolean)
    .join('\n\n---\n\n');

  const pageBreakdownSection = `## 10. Page-by-Page & Section-by-Section Breakdown\n\n${pagesMarkdown}`;

  const chunkLegalTech = chunks[PRD_CHUNK_KEYS.CHUNK_6_LEGAL_TECHNICAL]?.markdown || '';
  const chunkCrossQA = chunks[PRD_CHUNK_KEYS.CHUNK_CROSS_PAGE_QA]?.markdown || '';
  const chunkMasterPrompt = chunks[PRD_CHUNK_KEYS.CHUNK_MASTER_PROMPT]?.markdown || '';

  let assembled = [
    headerTitle,
    chunk1,
    '\n\n',
    chunk2,
    '\n\n',
    chunk3,
    '\n\n',
    chunk4,
    '\n\n',
    chunkSEO ? `${chunkSEO}\n\n` : '',
    pageBreakdownSection,
    '\n\n',
    chunkLegalTech,
    '\n\n',
    chunkCrossQA ? `${chunkCrossQA}\n\n` : '',
    chunkMasterPrompt,
  ].join('');

  // Sanitize double header titles or duplicate project titles at top
  assembled = assembled.replace(/(#\s*[^\n]+\n+)\1+/gi, '$1');

  // Trim preamble text before `# `
  const firstH1 = assembled.indexOf('# ');
  if (firstH1 !== -1 && firstH1 < 300) {
    assembled = assembled.substring(firstH1);
  }

  return assembled.trim();
}

