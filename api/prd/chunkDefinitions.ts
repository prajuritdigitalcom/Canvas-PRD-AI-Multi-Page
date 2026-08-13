export const PRD_CHUNK_KEYS = {
  CHUNK_1_BUSINESS: 'CHUNK_1_BUSINESS',
  CHUNK_2_ARCHITECTURE: 'CHUNK_2_ARCHITECTURE',
  CHUNK_3_DESIGN_SYSTEM: 'CHUNK_3_DESIGN_SYSTEM',
  CHUNK_4_SHARED_LAYOUT: 'CHUNK_4_SHARED_LAYOUT',
  CHUNK_SEO_STRATEGY: 'CHUNK_SEO_STRATEGY',
  CHUNK_PAGE_BATCH: 'CHUNK_PAGE_BATCH',
  CHUNK_CROSS_PAGE_QA: 'CHUNK_CROSS_PAGE_QA',
  CHUNK_6_LEGAL_TECHNICAL: 'CHUNK_6_LEGAL_TECHNICAL',
  CHUNK_MASTER_PROMPT: 'CHUNK_MASTER_PROMPT',
  CHUNK_FINAL_DOCUMENT_QA: 'CHUNK_FINAL_DOCUMENT_QA',
} as const;

export interface ChunkDefinition {
  key: string;
  name: string;
  stageNumber: number;
  description: string;
  requiredHeaders: string[];
}

export const FOUNDATION_CHUNKS: ChunkDefinition[] = [
  {
    key: PRD_CHUNK_KEYS.CHUNK_1_BUSINESS,
    name: 'Business Strategy & Objectives',
    stageNumber: 1,
    description: 'Executive Summary, Business Overview, Problem Statement, Objectives, Target Audience & Personas, Brand Positioning, Competitor Assumptions, Goals & Success Metrics.',
    requiredHeaders: [
      'Executive Summary',
      'Business Overview',
      'Problem Statement',
      'Project Objectives',
      'Target Audience',
      'Brand Positioning',
      'Goals & Success Metrics',
    ],
  },
  {
    key: PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE,
    name: 'Information Architecture & User Experience',
    stageNumber: 2,
    description: 'Sitemap & Navigation Structure, Information Architecture, User Flow, Responsive Strategy.',
    requiredHeaders: [
      'Sitemap',
      'Information Architecture',
      'User Flow',
      'Responsive Strategy',
    ],
  },
  {
    key: PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM,
    name: 'Global Design System Lock',
    stageNumber: 3,
    description: 'Design Direction, Color Palette & Contrast Pairs, Typography Scale, Iconography, Imagery Style, UI Components Specs.',
    requiredHeaders: [
      'Design Direction',
      'Color Palette',
      'Typography',
      'UI Components Specifications',
    ],
  },
  {
    key: PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT,
    name: 'Shared Layout & Component Contract',
    stageNumber: 4,
    description: 'Shared Header/Navbar, Shared Footer, Global CTA System, Floating Action System, Shared Component Contract, Global Mobile Navigation.',
    requiredHeaders: [
      'Shared Header',
      'Shared Footer',
      'Global CTA System',
      'Shared Component Contract',
    ],
  },
];
