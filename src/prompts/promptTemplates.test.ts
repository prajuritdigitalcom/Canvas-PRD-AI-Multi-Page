import { buildSystemPrompt, buildUserPrompt, buildAnalysisPrompt } from './promptTemplates';
import { ProjectFormState } from '../types';

// Simple unit tests for prompt generation
export function testPromptTemplates() {
  console.log('Running Prompt Templates Unit Tests...');

  // 1. Test System Prompt
  const sysPrompt = buildSystemPrompt();
  if (!sysPrompt.includes('# [NAMA PROJECT] - Multi-Page Product Requirement Document (PRD)')) {
    throw new Error('Test Failed: System prompt missing H1 heading starting structure.');
  }
  if (!sysPrompt.includes('FONDASI TEMA DESAIN ADALAH ATURAN TERTINGGI')) {
    throw new Error('Test Failed: System prompt missing Theme Foundation priority rule.');
  }
  if (!sysPrompt.includes('TANPA PREAMBLE ATAU BASA-BASI')) {
    throw new Error('Test Failed: System prompt missing preamble rule.');
  }
  console.log('✓ System Prompt Test Passed');

  // 2. Test User Prompt with custom theme
  const mockForm: ProjectFormState = {
    projectName: 'Test App',
    businessType: 'Testing',
    websiteType: 'Company Profile',
    targetAudience: 'Testers',
    rawBrief: 'Short brief',
    goalWebsite: 'Testing PRD',
    primaryCTA: 'Contact',
    pages: [
      {
        id: '1',
        pageName: 'Home',
        pageSlug: '/',
        pageType: 'Home',
        pagePurpose: 'Main entry',
        keySections: ['Hero'],
        isInMainNav: true,
        order: 1,
      },
    ],
    sharedLayout: {
      navbarStyle: 'Sticky',
      footerColumns: 3,
      hasWhatsAppFloatButton: true,
      hasStickyCTABar: false,
      hasNewsletterForm: false,
    },
    targetPlatform: 'Google AI Studio',
    primaryColor: '#000',
    colorTone: 'Light',
    typographyPairing: 'Inter + Outfit',
    designThemeId: 'neo-brutalism',
    contentLanguage: 'Indonesian',
    specialRequirements: 'None',
    aiMode: 'auto',
  };

  const userPrompt = buildUserPrompt(mockForm);
  if (!userPrompt.includes('Neo-Brutalism')) {
    throw new Error('Test Failed: User prompt missing selected theme rule block.');
  }
  if (!userPrompt.includes('Test App')) {
    throw new Error('Test Failed: User prompt missing project name.');
  }
  console.log('✓ User Prompt Test Passed');

  // 3. Test Analysis Prompt
  const analysisPrompt = buildAnalysisPrompt('Sample raw brief for test');
  if (!analysisPrompt.includes('Sample raw brief for test')) {
    throw new Error('Test Failed: Analysis prompt missing brief content.');
  }
  console.log('✓ Analysis Prompt Test Passed');

  console.log('ALL PROMPT TEMPLATE TESTS PASSED SUCCESSFULLY!');
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('promptTemplates.test')) {
  testPromptTemplates();
}
