import { PageDefinition } from '../../src/types.js';
import { PageBatch } from './types.js';

export interface PageComplexity {
  score: number;
  tier: 'SIMPLE' | 'MEDIUM' | 'HEAVY' | 'VERY_HEAVY';
}

export function calculatePageComplexity(page: PageDefinition): PageComplexity {
  let score = page.keySections?.length || 3;

  const textToCheck = `${page.pageName} ${page.pageType} ${page.pagePurpose} ${(page.keySections || []).join(' ')}`.toLowerCase();

  if (page.pageType === 'Home' || (page.pageType as string) === 'Landing') {
    score += 3;
  }

  if (/(form|kontak|pendaftaran|checkout|sistem|kalkulator|filter|pencarian|search|pricing|harga|faq|galeri|gallery|portofolio|perbandingan|comparison)/i.test(textToCheck)) {
    score += 2;
  }

  if (/(cta|konversi|booking|reservasi|pesan|beli|order)/i.test(textToCheck)) {
    score += 2;
  }

  let tier: 'SIMPLE' | 'MEDIUM' | 'HEAVY' | 'VERY_HEAVY' = 'SIMPLE';
  if (score >= 11) {
    tier = 'VERY_HEAVY';
  } else if (score >= 8) {
    tier = 'HEAVY';
  } else if (score >= 5) {
    tier = 'MEDIUM';
  } else {
    tier = 'SIMPLE';
  }

  return { score, tier };
}

export function lockAndSanitizePagePlan(pages: PageDefinition[]): PageDefinition[] {
  if (!Array.isArray(pages) || pages.length === 0) {
    return [
      {
        id: 'page_home_default',
        pageName: 'Home',
        pageSlug: '/',
        pageType: 'Home',
        pagePurpose: 'Halaman utama landing page untuk konversi dan overview bisnis.',
        keySections: ['Hero', 'Value Proposition', 'Services Overview', 'Testimonials', 'CTA'],
        isInMainNav: true,
        order: 1,
      },
    ];
  }

  const seenSlugs = new Set<string>();
  const sanitized: PageDefinition[] = pages.map((p, index) => {
    let slug = p.pageSlug ? p.pageSlug.trim() : '/';
    if (!slug.startsWith('/')) slug = '/' + slug;
    
    // Format slug
    if (slug.length > 1 && slug.endsWith('/')) {
      slug = slug.slice(0, -1);
    }

    // Ensure slug uniqueness
    let baseSlug = slug;
    let counter = 1;
    while (seenSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    seenSlugs.add(slug);

    const safeId = p.id || `page_${index + 1}_${p.pageName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    return {
      ...p,
      id: safeId,
      pageName: p.pageName ? p.pageName.trim() : `Page ${index + 1}`,
      pageSlug: slug,
      order: typeof p.order === 'number' ? p.order : index + 1,
      keySections: Array.isArray(p.keySections) && p.keySections.length > 0 ? p.keySections : ['Overview', 'Content', 'CTA'],
    };
  });

  return sanitized.sort((a, b) => a.order - b.order);
}

export function planAdaptivePageBatches(pages: PageDefinition[]): PageBatch[] {
  const sanitizedPages = lockAndSanitizePagePlan(pages);
  const totalPages = sanitizedPages.length;

  const batches: PageBatch[] = [];

  // Strategy based on V2 document specs (Quality > Token Efficiency):
  // 1-6 pages: 1 page per call batch for maximum quality
  // 7-12 pages:
  //   - SIMPLE & MEDIUM pages can be paired (2 per batch)
  //   - HEAVY & VERY_HEAVY pages MUST be single-page batches
  // 13-20 pages:
  //   - SIMPLE & MEDIUM pages paired if combined score <= 10
  //   - HEAVY & VERY_HEAVY pages MUST be single-page batches

  if (totalPages <= 6) {
    sanitizedPages.forEach((page, idx) => {
      const complexity = calculatePageComplexity(page);
      batches.push({
        batchIndex: idx + 1,
        pages: [page],
        complexityTier: complexity.tier,
      });
    });
  } else {
    let currentBatch: PageDefinition[] = [];
    let currentScore = 0;

    for (const page of sanitizedPages) {
      const comp = calculatePageComplexity(page);

      if (comp.tier === 'HEAVY' || comp.tier === 'VERY_HEAVY') {
        // Heavy pages must be in their own batch
        if (currentBatch.length > 0) {
          batches.push({
            batchIndex: batches.length + 1,
            pages: [...currentBatch],
            complexityTier: 'MEDIUM',
          });
          currentBatch = [];
          currentScore = 0;
        }
        batches.push({
          batchIndex: batches.length + 1,
          pages: [page],
          complexityTier: comp.tier,
        });
      } else {
        // SIMPLE or MEDIUM page
        if (currentBatch.length === 0) {
          currentBatch.push(page);
          currentScore = comp.score;
        } else if (currentBatch.length < 2 && currentScore + comp.score <= 12) {
          currentBatch.push(page);
          currentScore += comp.score;
        } else {
          batches.push({
            batchIndex: batches.length + 1,
            pages: [...currentBatch],
            complexityTier: 'MEDIUM',
          });
          currentBatch = [page];
          currentScore = comp.score;
        }
      }
    }

    if (currentBatch.length > 0) {
      batches.push({
        batchIndex: batches.length + 1,
        pages: currentBatch,
        complexityTier: 'MEDIUM',
      });
    }
  }

  return batches;
}

