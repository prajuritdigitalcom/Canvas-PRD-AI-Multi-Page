import { PageDefinition, ProjectFormState, SharedLayoutConfig } from '../../src/types.js';

export type LockSource = 'USER_LOCK' | 'AI_LOCK' | 'FALLBACK';
export type LockQuality = 'VALID' | 'WARNING' | 'INVALID';

export interface LockMeta {
  source: LockSource;
  quality: LockQuality;
  required: boolean;
  validationIssues: string[];
}

export interface ProjectInfoContext {
  projectName: string;
  businessType: string;
  websiteType: string;
  targetAudience: string;
  goalWebsite: string;
  primaryCTA: string;
  contentLanguage: string;
  logoUrl?: string;
  faviconUrl?: string;
  specialRequirements?: string;
  googleSiteVerification?: string;
}

export interface BusinessStrategyLock {
  executiveSummary: string;
  positioning: string;
  valueProposition: string;
  personas: string;
  goals: string;
  metrics: string;
  competitorAssumptions: string;
  rawMarkdown: string;
  meta?: LockMeta;
}

export interface ArchitectureLock {
  sitemap: string;
  navigation: string;
  userFlow: string;
  responsiveStrategy: string;
  pages: PageDefinition[];
  rawMarkdown: string;
  meta?: LockMeta;
}

export interface DesignSystemLock {
  themeId: string;
  themeName: string;
  layoutPattern: string;
  borderRadius: string;
  shadow: string;
  colorApproach: string;
  typography: string;
  spacing: string;
  imagery: string;
  forbidden: string[];
  typographyScale: Record<string, { desktop: string; tablet: string; mobile: string }>;
  colorContrastPairs: Array<{ backgroundToken: string; textToken: string; usage: string }>;
  rawMarkdown: string;
  meta?: LockMeta;
}

export interface SharedLayoutLock {
  navbarStyle: string;
  footerColumns: number;
  hasWhatsAppFloatButton: boolean;
  hasStickyCTABar: boolean;
  hasNewsletterForm: boolean;
  sharedComponentsContract: string;
  rawMarkdown: string;
  meta?: LockMeta;
}

export interface SEOLockItem {
  slug: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  searchIntent?: string;
}

export interface SEOLock {
  globalRules: string;
  pages: Record<string, SEOLockItem>;
  meta?: LockMeta;
}

export interface TechnicalLock {
  platform: string;
  stack: string;
  routing: string;
  deployment: string;
  rawMarkdown: string;
}

export interface ValidationIssue {
  type: 'CRITICAL' | 'WARNING';
  category: 'STRUCTURE' | 'MARKDOWN' | 'PAGE' | 'CROSS_PAGE' | 'SEO' | 'LEGAL' | 'TECHNICAL';
  message: string;
  target?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  warnings: string[];
}

export interface GeneratedPageLock {
  pageId: string;
  pageName: string;
  slug: string;
  pageType: string;
  purpose: string;
  complexityScore: number;
  complexityTier: 'SIMPLE' | 'MEDIUM' | 'HEAVY' | 'VERY_HEAVY';
  markdown: string;
  sectionNames: string[];
  metaTitle: string;
  metaDescription: string;
  internalLinks: string[];
  validation: ValidationResult;
}

export interface GeneratedChunkRecord {
  chunkKey: string;
  stageNumber: number;
  markdown: string;
  summary: string;
  status: 'GENERATED' | 'VALIDATED' | 'REPAIRED' | 'FAILED';
  attempt: number;
  validation: ValidationResult;
}

export interface CrossPageQALock {
  navigationConsistency: string;
  terminologyConsistency: string;
  CTAConsistency: string;
  designTokenConsistency: string;
  sharedComponentsConsistency: string;
  internalLinkConsistency: string;
  sectionDuplicationCheck: string;
  pageRoleSeparation: string;
  seoConsistency: string;
  responsiveConsistency: string;
  conversionFlowConsistency: string;
  routingConsistency: string;
  criticalFindings: string[];
  findings: string[];
  requiredRepairs: string[];
  rawMarkdown: string;
}

export interface FinalQALock {
  status: 'PASS' | 'REPAIR_REQUIRED' | 'FAIL';
  structural: 'PASS' | 'FAIL';
  semantic: 'PASS' | 'FAIL';
  seo: 'PASS' | 'FAIL';
  legal: 'PASS' | 'FAIL';
  technical: 'PASS' | 'FAIL';
  implementationReady: 'PASS' | 'FAIL';
  criticalFindings: string[];
  findings: string[];
  requiredRepairs: string[];
  rawMarkdown: string;
}

export interface PRDContextState {
  project: ProjectInfoContext;
  strategy?: BusinessStrategyLock;
  architecture?: ArchitectureLock;
  design?: DesignSystemLock;
  sharedLayout?: SharedLayoutLock;
  seo?: SEOLock;
  technical?: TechnicalLock;

  generatedPages: Record<string, GeneratedPageLock>; // CANONICAL KEY: pageId ONLY
  generatedChunks: Record<string, GeneratedChunkRecord>; // chunkKey -> GeneratedChunkRecord

  crossPageQA?: CrossPageQALock;
  finalQA?: FinalQALock;

  completedStages: string[];
}

export interface RepairTarget {
  id: string;
  scope: 'FOUNDATION' | 'PAGE' | 'SEO' | 'CROSS_PAGE' | 'LEGAL' | 'TECHNICAL' | 'MASTER_PROMPT';
  pageId?: string;
  section?: string;
  reason: string;
}

export interface QualityScoreBreakdown {
  structuralScore: number;       // 10%
  businessScore: number;         // 10%
  architectureScore: number;     // 10%
  designScore: number;           // 15%
  pageDetailScore: number;       // 20%
  crossPageScore: number;        // 15%
  seoScore: number;              // 10%
  accessibilityScore: number;    // 5%
  technicalScore: number;        // 5%
}

export interface PRDQualityScoreResult {
  readyScore: number;
  breakdown: QualityScoreBreakdown;
  passed: string[];
  warnings: string[];
  isBuildReady: boolean;
}

export interface PageBatch {
  batchIndex: number;
  pages: PageDefinition[];
  complexityTier: 'SIMPLE' | 'MEDIUM' | 'HEAVY' | 'VERY_HEAVY';
}

export interface PipelineProgressStage {
  stageId: string;
  stageName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  detail?: string;
}

