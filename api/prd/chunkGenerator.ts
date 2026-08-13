import express from 'express';
import { ProjectFormState, PRDGenerateResponse } from '../../src/types.js';
import { PRDContextState, PageBatch, GeneratedChunkRecord } from './types.js';
import { PRD_CHUNK_KEYS, FOUNDATION_CHUNKS } from './chunkDefinitions.js';
import {
  getSystemPromptForChunk,
  buildFoundationChunkUserPrompt,
  buildSEOStrategyUserPrompt,
  buildPageBatchChunkUserPrompt,
  buildCrossPageQAUserPrompt,
  buildLegalAndTechnicalUserPrompt,
  buildMasterPromptChunkUserPrompt,
} from './chunkPrompts.js';
import {
  formatCompactContextLock,
  parseBusinessChunkToLock,
  parseArchitectureChunkToLock,
  parseDesignChunkToLock,
  parseSharedLayoutChunkToLock,
  parseSEOStrategyToLock,
} from './contextSummary.js';
import { lockAndSanitizePagePlan, planAdaptivePageBatches } from './pageChunkPlanner.js';
import { assembleFinalPRDDocument } from './finalAssembler.js';
import { calculatePRDQualityScore } from './qualityScorer.js';
import {
  validateMarkdownIntegrity,
  validatePageCompleteness,
  validateFoundationChunk,
  extractPagesFromChunkMarkdown,
  parseCrossPageQAChunkToLock,
} from './validators.js';
import { getModelFallbackChain } from '../../src/config/aiModel.js';
import { runGeminiWithVisitorKeys } from '../../src/services/gemini/geminiRequestRunner.js';
import { DESIGN_THEMES } from '../../src/data/designThemes.js';

export async function generateMultiPagePRDPipeline(
  formState: ProjectFormState,
  visitorKeys: string[],
  visitorPoolId: string,
  visitorRequestSequence?: number
): Promise<PRDGenerateResponse> {
  const candidateModels = getModelFallbackChain();

  // STAGE 0: INPUT NORMALIZATION & LOCK INITIALIZATION
  const sanitizedPages = lockAndSanitizePagePlan(formState.pages);

  const selectedTheme =
    DESIGN_THEMES.find((t) => t.id === formState.designThemeId) || DESIGN_THEMES[0];

  const contextState: PRDContextState = {
    project: {
      projectName: formState.projectName || 'Belum Ditentukan',
      businessType: formState.businessType || 'General Business',
      websiteType: formState.websiteType || 'Company Profile',
      targetAudience: formState.targetAudience || 'Pengguna umum & calon klien',
      goalWebsite: formState.goalWebsite || 'Meningkatkan konversi & kepercayaan',
      primaryCTA: formState.primaryCTA || 'Hubungi Kami via WhatsApp',
      contentLanguage: formState.contentLanguage || 'Indonesian',
      logoUrl: formState.logoUrl,
      faviconUrl: formState.faviconUrl,
      specialRequirements: formState.specialRequirements,
      googleSiteVerification: formState.googleSiteVerification,
    },
    design: {
      themeId: selectedTheme.id,
      themeName: selectedTheme.name,
      layoutPattern: selectedTheme.rules.layoutPattern,
      borderRadius: selectedTheme.rules.borderRadius,
      shadow: selectedTheme.rules.shadow,
      colorApproach: selectedTheme.rules.colorApproach,
      typography: selectedTheme.rules.typography,
      spacing: selectedTheme.rules.spacing,
      imagery: selectedTheme.rules.imagery,
      forbidden: selectedTheme.rules.forbidden,
      typographyScale: selectedTheme.rules.typographyScale || {},
      colorContrastPairs: selectedTheme.rules.colorContrastPairs || [],
      rawMarkdown: '',
    },
    architecture: {
      sitemap: '',
      navigation: formState.sharedLayout?.navbarStyle || 'Standard',
      userFlow: '',
      responsiveStrategy: 'Desktop, Tablet, Mobile',
      pages: sanitizedPages,
      rawMarkdown: '',
    },
    sharedLayout: {
      navbarStyle: formState.sharedLayout?.navbarStyle || 'Standard',
      footerColumns: formState.sharedLayout?.footerColumns || 4,
      hasWhatsAppFloatButton: formState.sharedLayout?.hasWhatsAppFloatButton ?? true,
      hasStickyCTABar: formState.sharedLayout?.hasStickyCTABar ?? true,
      hasNewsletterForm: formState.sharedLayout?.hasNewsletterForm ?? true,
      sharedComponentsContract: '',
      rawMarkdown: '',
    },
    generatedPages: {},
    generatedChunks: {},
    completedStages: [],
  };

  let lastModelUsed = candidateModels[0];

  // Helper executor for running a chunk with Gemini Runner
  const runChunkGeneration = async (
    chunkKey: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> => {
    const runnerResult = await runGeminiWithVisitorKeys<string>({
      keys: visitorKeys,
      candidateModels,
      visitorPoolId,
      visitorRequestSequence,
      executor: async (ai, apiKey, modelCandidate) => {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
          },
        });
        return response.text || '';
      },
    });

    if (runnerResult.modelUsed) {
      lastModelUsed = runnerResult.modelUsed;
    }

    return runnerResult.data || '';
  };

  const saveChunkRecord = (key: string, stageNumber: number, markdown: string) => {
    contextState.generatedChunks[key] = {
      chunkKey: key,
      stageNumber,
      markdown,
      summary: markdown.slice(0, 150),
      status: 'GENERATED',
      attempt: 1,
      validation: validateMarkdownIntegrity(markdown),
    };
  };

  // STAGE 1: BUSINESS STRATEGY
  const sysPrompt1 = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_1_BUSINESS);
  const userPrompt1 = buildFoundationChunkUserPrompt(PRD_CHUNK_KEYS.CHUNK_1_BUSINESS, formState, contextState);
  const out1 = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_1_BUSINESS, sysPrompt1, userPrompt1);
  saveChunkRecord(PRD_CHUNK_KEYS.CHUNK_1_BUSINESS, 1, out1);
  contextState.strategy = parseBusinessChunkToLock(out1);
  contextState.completedStages.push('Business Strategy Lock');

  // STAGE 2: ARCHITECTURE & UX
  const sysPrompt2 = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE);
  const userPrompt2 = buildFoundationChunkUserPrompt(PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE, formState, contextState);
  const out2 = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE, sysPrompt2, userPrompt2);
  saveChunkRecord(PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE, 2, out2);
  contextState.architecture = parseArchitectureChunkToLock(out2, sanitizedPages);
  contextState.completedStages.push('Information Architecture Lock');

  // STAGE 3: DESIGN SYSTEM
  const sysPrompt3 = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM);
  const userPrompt3 = buildFoundationChunkUserPrompt(PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM, formState, contextState);
  const out3 = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM, sysPrompt3, userPrompt3);
  saveChunkRecord(PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM, 3, out3);
  contextState.design = parseDesignChunkToLock(out3, selectedTheme);
  contextState.completedStages.push('Design System Lock');

  // STAGE 4: SHARED LAYOUT
  const sysPrompt4 = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT);
  const userPrompt4 = buildFoundationChunkUserPrompt(PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT, formState, contextState);
  const out4 = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT, sysPrompt4, userPrompt4);
  saveChunkRecord(PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT, 4, out4);
  contextState.sharedLayout = parseSharedLayoutChunkToLock(out4, formState);
  contextState.completedStages.push('Shared Layout Lock');

  // STAGE 5: SEO STRATEGY PASS
  const sysPromptSEO = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_SEO_STRATEGY);
  const userPromptSEO = buildSEOStrategyUserPrompt(contextState);
  const outSEO = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_SEO_STRATEGY, sysPromptSEO, userPromptSEO);
  saveChunkRecord(PRD_CHUNK_KEYS.CHUNK_SEO_STRATEGY, 5, outSEO);
  contextState.seo = parseSEOStrategyToLock(outSEO, sanitizedPages);
  contextState.completedStages.push('SEO Strategy Lock');

  // STAGE 6: PAGE CHUNK GENERATION (ADAPTIVE BATCHING)
  const pageBatches = planAdaptivePageBatches(sanitizedPages);

  for (const batch of pageBatches) {
    const sysPromptBatch = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_PAGE_BATCH);
    const userPromptBatch = buildPageBatchChunkUserPrompt(batch, contextState);

    let batchOutput = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_PAGE_BATCH, sysPromptBatch, userPromptBatch);

    // PAGE CHUNK VALIDATION & RETRY
    let markIntegrity = validateMarkdownIntegrity(batchOutput);
    let pageComp = validatePageCompleteness(batchOutput, batch.pages);

    if (!markIntegrity.isValid || !pageComp.isValid) {
      const feedbackPrompt = `${userPromptBatch}

PREVIOUS ATTEMPT FAILED VALIDATION REASONS:
${pageComp.issues.map((i) => `- ${i.message}`).join('\n')}
${markIntegrity.issues.map((i) => `- ${i.message}`).join('\n')}

PLEASE REPAIR ONLY THE MISSING/INCOMPLETE SECTIONS AND RETURN THE COMPLETE CORRECTED PAGE BREAKDOWN.`;

      const repairedOutput = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_PAGE_BATCH, sysPromptBatch, feedbackPrompt);
      if (repairedOutput && repairedOutput.length > 200) {
        batchOutput = repairedOutput;
      }
    }

    // Extract pages using deterministic marker/regex extractor
    const extractedPages = extractPagesFromChunkMarkdown(batchOutput, batch.pages);
    Object.assign(contextState.generatedPages, extractedPages);

    contextState.completedStages.push(`Page Batch ${batch.batchIndex}/${pageBatches.length}`);
  }

  // STAGE 7: LEGAL & TECHNICAL CHUNK
  const legalSysPrompt = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_6_LEGAL_TECHNICAL);
  const legalUserPrompt = buildLegalAndTechnicalUserPrompt(formState, contextState);
  const legalOutput = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_6_LEGAL_TECHNICAL, legalSysPrompt, legalUserPrompt);
  saveChunkRecord(PRD_CHUNK_KEYS.CHUNK_6_LEGAL_TECHNICAL, 7, legalOutput);
  contextState.completedStages.push('Legal & Technical Lock');

  // STAGE 8: CROSS-PAGE QA CHUNK
  const qaSysPrompt = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_CROSS_PAGE_QA);
  const qaUserPrompt = buildCrossPageQAUserPrompt(contextState);
  const qaOutput = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_CROSS_PAGE_QA, qaSysPrompt, qaUserPrompt);
  saveChunkRecord(PRD_CHUNK_KEYS.CHUNK_CROSS_PAGE_QA, 8, qaOutput);
  contextState.crossPageQA = parseCrossPageQAChunkToLock(qaOutput);
  contextState.completedStages.push('Cross-Page QA Lock');

  // STAGE 9: MASTER PROMPT CHUNK (SECTION 15)
  const masterSysPrompt = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_MASTER_PROMPT);
  const masterUserPrompt = buildMasterPromptChunkUserPrompt(formState, contextState);
  const masterOutput = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_MASTER_PROMPT, masterSysPrompt, masterUserPrompt);
  saveChunkRecord(PRD_CHUNK_KEYS.CHUNK_MASTER_PROMPT, 9, masterOutput);
  contextState.completedStages.push('Master Prompt Lock');

  // STAGE 10: FINAL ASSEMBLY & QUALITY SCORING
  let finalMarkdown = assembleFinalPRDDocument(contextState);
  let qualityResult = calculatePRDQualityScore(finalMarkdown, contextState);

  // STAGE 11: SURGICAL REPAIR PASS IF NEEDED
  if (!qualityResult.isBuildReady && qualityResult.warnings.length > 0) {
    const repairSysPrompt = `You are an expert PRD Quality Repair Specialist. Fix specific PRD warnings without altering valid content.`;
    const repairUserPrompt = `The following PRD document has minor quality warnings:
${qualityResult.warnings.map((w) => `- ${w}`).join('\n')}

DOCUMENT CONTENT TO REPAIR:
${finalMarkdown.slice(0, 8000)}...

Please return the corrected PRD markdown repairing the issues above.`;

    try {
      const repairedMarkdown = await runChunkGeneration('QA_REPAIR_PASS', repairSysPrompt, repairUserPrompt);
      if (repairedMarkdown && repairedMarkdown.length > finalMarkdown.length * 0.7) {
        finalMarkdown = repairedMarkdown;
        qualityResult = calculatePRDQualityScore(finalMarkdown, contextState);
      }
    } catch (e) {
      console.warn('QA Repair Pass skipped due to runner error:', e);
    }
  }

  return {
    markdown: finalMarkdown,
    readyScore: qualityResult.readyScore,
    scoreReasons: {
      passed: qualityResult.passed,
      warnings: qualityResult.warnings,
    },
    modelUsed: lastModelUsed,
  };
}

