export type PageType =
  | 'Home'
  | 'About'
  | 'Services'
  | 'Service Detail'
  | 'Portfolio'
  | 'Blog List'
  | 'Blog Detail'
  | 'Team'
  | 'Pricing'
  | 'FAQ'
  | 'Testimonials'
  | 'Contact'
  | 'Custom';

export interface PageDefinition {
  id: string;
  pageName: string;
  pageSlug: string;
  pageType: PageType;
  customPageType?: string;
  pagePurpose: string;
  keySections: string[];
  isInMainNav: boolean;
  order: number;
  metaTitle?: string;        // Target Meta Title SEO (ideal ≤ 60 karakter)
  metaDescription?: string;  // Target Meta Description SEO (ideal 120–160 karakter)
}

export interface SharedLayoutConfig {
  navbarStyle: 'Standard' | 'Sticky' | 'Transparent-on-Hero' | 'Mega Menu';
  footerColumns: number;
  hasWhatsAppFloatButton: boolean;
  hasStickyCTABar: boolean;
  hasNewsletterForm: boolean;
}

export interface ProjectFormState {
  projectName: string;
  businessType: string;
  websiteType: 'Company Profile' | 'E-Commerce / Catalog' | 'SaaS / Service App' | 'Agency / Portfolio' | 'Educational / Community' | 'Custom';
  targetAudience: string;
  rawBrief: string;
  goalWebsite: string;
  primaryCTA: string;
  logoUrl?: string;     // Link/URL logo website (bisa link gambar atau deskripsi teks logo)
  faviconUrl?: string;  // Link/URL favicon website
  
  // Multi-Page Architecture
  pages: PageDefinition[];
  sharedLayout: SharedLayoutConfig;
  
  // Target Platform
  targetPlatform: 'Google AI Studio';

  // Design & Branding Preferences
  primaryColor: string;
  colorTone: string;
  typographyPairing: string;
  designThemeId: string;
  contentLanguage: 'Indonesian' | 'English' | 'Bilingual';
  specialRequirements: string;
  
  // Form Mode
  aiMode: 'auto' | 'manual';
}

export interface PRDScoreBreakdown {
  passed: string[];
  warnings: string[];
}

export interface PRDGenerateResponse {
  markdown: string;
  readyScore: number;
  scoreReasons: PRDScoreBreakdown;
  modelUsed?: string;
}

export interface BriefAnalysisResponse {
  projectName?: string;
  businessType?: string;
  websiteType?: ProjectFormState['websiteType'];
  targetAudience?: string;
  goalWebsite?: string;
  primaryCTA?: string;
  primaryColor?: string;
  colorTone?: string;
  typographyPairing?: string;
  designThemeId?: string;
  contentLanguage?: ProjectFormState['contentLanguage'];
  specialRequirements?: string;
  suggestedPages?: PageDefinition[];
  modelUsed?: string;
}

export interface SavedPRD {
  id: string;
  title: string;
  createdAt: string;
  readyScore: number;
  pageCount: number;
  formState: ProjectFormState;
  markdown: string;
}

export interface PagePreset {
  id: string;
  name: string;
  websiteType: ProjectFormState['websiteType'];
  description: string;
  pages: Omit<PageDefinition, 'id' | 'order'>[];
}
