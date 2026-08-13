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
  buildFinalDocumentQAUserPrompt,
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
  parseFinalQAChunkToLock,
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

  // Helper executor for foundation chunks with Validation & Retry
  const runValidatedFoundationChunk = async (
    chunkKey: string,
    stageNumber: number,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> => {
    let output = await runChunkGeneration(chunkKey, systemPrompt, userPrompt);
    let valResult = validateFoundationChunk(chunkKey, output);
    let attempt = 1;

    if (!valResult.isValid) {
      const feedbackPrompt = `${userPrompt}

PREVIOUS ATTEMPT FAILED VALIDATION REASONS:
${valResult.issues.map((i) => `- ${i.message}`).join('\n')}

PLEASE REPAIR AND RETURN THE COMPLETE CORRECTED SECTION.`;

      const retryOutput = await runChunkGeneration(chunkKey, systemPrompt, feedbackPrompt);
      const retryVal = validateFoundationChunk(chunkKey, retryOutput);
      attempt = 2;
      if (retryVal.isValid || retryOutput.length > output.length) {
        output = retryOutput;
        valResult = retryVal;
      }
    }

    contextState.generatedChunks[chunkKey] = {
      chunkKey,
      stageNumber,
      markdown: output,
      summary: output.slice(0, 150),
      status: valResult.isValid ? 'VALIDATED' : 'FAILED',
      attempt,
      validation: valResult,
    };

    return output;
  };

  // STAGE 1: BUSINESS STRATEGY
  const sysPrompt1 = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_1_BUSINESS);
  const userPrompt1 = buildFoundationChunkUserPrompt(PRD_CHUNK_KEYS.CHUNK_1_BUSINESS, formState, contextState);
  const out1 = await runValidatedFoundationChunk(PRD_CHUNK_KEYS.CHUNK_1_BUSINESS, 1, sysPrompt1, userPrompt1);
  contextState.strategy = parseBusinessChunkToLock(out1);
  contextState.completedStages.push('Business Strategy Lock');

  // STAGE 2: ARCHITECTURE & UX
  const sysPrompt2 = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE);
  const userPrompt2 = buildFoundationChunkUserPrompt(PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE, formState, contextState);
  const out2 = await runValidatedFoundationChunk(PRD_CHUNK_KEYS.CHUNK_2_ARCHITECTURE, 2, sysPrompt2, userPrompt2);
  contextState.architecture = parseArchitectureChunkToLock(out2, sanitizedPages);
  contextState.completedStages.push('Information Architecture Lock');

  // STAGE 3: DESIGN SYSTEM
  const sysPrompt3 = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM);
  const userPrompt3 = buildFoundationChunkUserPrompt(PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM, formState, contextState);
  const out3 = await runValidatedFoundationChunk(PRD_CHUNK_KEYS.CHUNK_3_DESIGN_SYSTEM, 3, sysPrompt3, userPrompt3);
  contextState.design = parseDesignChunkToLock(out3, selectedTheme);
  contextState.completedStages.push('Design System Lock');

  // STAGE 4: SHARED LAYOUT
  const sysPrompt4 = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT);
  const userPrompt4 = buildFoundationChunkUserPrompt(PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT, formState, contextState);
  const out4 = await runValidatedFoundationChunk(PRD_CHUNK_KEYS.CHUNK_4_SHARED_LAYOUT, 4, sysPrompt4, userPrompt4);
  contextState.sharedLayout = parseSharedLayoutChunkToLock(out4, formState);
  contextState.completedStages.push('Shared Layout Lock');

  // STAGE 5: SEO STRATEGY PASS
  const sysPromptSEO = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_SEO_STRATEGY);
  const userPromptSEO = buildSEOStrategyUserPrompt(contextState);
  const outSEO = await runValidatedFoundationChunk(PRD_CHUNK_KEYS.CHUNK_SEO_STRATEGY, 5, sysPromptSEO, userPromptSEO);
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

    // Targeted recovery for any page where extraction or validation failed
    for (const page of batch.pages) {
      if (!extractedPages[page.id] || !extractedPages[page.id].markdown || !extractedPages[page.id].validation?.isValid) {
        const singleSysPrompt = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_PAGE_BATCH);
        const singleUserPrompt = `Generasikan breakdown PRD mendalam untuk halaman tunggal "${page.pageName}" (\`${page.pageSlug}\`).
${formatCompactContextLock(contextState)}

WAJIB GUNAKAN MARKER:
<!-- PAGE_START: ${page.id} -->
PAGE_ID: ${page.id}
PAGE_NAME: ${page.pageName}
SLUG: ${page.pageSlug}

### Halaman: ${page.pageName} (\`${page.pageSlug}\`)
Purpose: ${page.pagePurpose}
Key Sections: ${(page.keySections || []).join(', ')}

### Section Breakdown:
(Tuliskan breakdown section secara mendalam dengan content hierarchy, layout, interactive elements, responsive behavior, accessibility)
<!-- PAGE_END: ${page.id} -->`;

        const singleOutput = await runChunkGeneration(`SINGLE_PAGE_${page.id}`, singleSysPrompt, singleUserPrompt);
        const reExtracted = extractPagesFromChunkMarkdown(singleOutput, [page]);
        if (reExtracted[page.id] && reExtracted[page.id].markdown) {
          extractedPages[page.id] = reExtracted[page.id];
        }
      }
    }

    Object.assign(contextState.generatedPages, extractedPages);
    contextState.completedStages.push(`Page Batch ${batch.batchIndex}/${pageBatches.length}`);
  }

  // STAGE 7: LEGAL & TECHNICAL CHUNK
  const legalSysPrompt = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_6_LEGAL_TECHNICAL);
  const legalUserPrompt = buildLegalAndTechnicalUserPrompt(formState, contextState);
  const legalOutput = await runValidatedFoundationChunk(PRD_CHUNK_KEYS.CHUNK_6_LEGAL_TECHNICAL, 7, legalSysPrompt, legalUserPrompt);
  contextState.completedStages.push('Legal & Technical Lock');

  // STAGE 8: CROSS-PAGE QA CHUNK
  const qaSysPrompt = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_CROSS_PAGE_QA);
  const qaUserPrompt = buildCrossPageQAUserPrompt(contextState);
  const qaOutput = await runValidatedFoundationChunk(PRD_CHUNK_KEYS.CHUNK_CROSS_PAGE_QA, 8, qaSysPrompt, qaUserPrompt);
  contextState.crossPageQA = parseCrossPageQAChunkToLock(qaOutput);
  contextState.completedStages.push('Cross-Page QA Lock');

  // STAGE 9: MASTER PROMPT CHUNK (SECTION 18)
  const masterSysPrompt = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_MASTER_PROMPT);
  const masterUserPrompt = buildMasterPromptChunkUserPrompt(formState, contextState);
  const masterOutput = await runValidatedFoundationChunk(PRD_CHUNK_KEYS.CHUNK_MASTER_PROMPT, 9, masterSysPrompt, masterUserPrompt);
  contextState.completedStages.push('Master Prompt Lock');

  // STAGE 10: FINAL ASSEMBLY & QUALITY SCORING
  let finalMarkdown = assembleFinalPRDDocument(contextState);

  // STAGE 10.5: FINAL DOCUMENT QA PASS
  const finalQASysPrompt = getSystemPromptForChunk(PRD_CHUNK_KEYS.CHUNK_FINAL_DOCUMENT_QA);
  const finalQAUserPrompt = buildFinalDocumentQAUserPrompt(finalMarkdown, contextState);
  const finalQAOutput = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_FINAL_DOCUMENT_QA, finalQASysPrompt, finalQAUserPrompt);
  contextState.finalQA = parseFinalQAChunkToLock(finalQAOutput);
  contextState.completedStages.push('Final Document QA Audit');

  let qualityResult = calculatePRDQualityScore(finalMarkdown, contextState);

  // STAGE 11: SURGICAL REPAIR PASS WITH STATE RETENTION RULE (NO slice(0, 8000)!)
  if (!qualityResult.isBuildReady || (contextState.finalQA && contextState.finalQA.status !== 'PASS')) {
    const invalidPageIds = Object.keys(contextState.generatedPages).filter(
      (pId) => !contextState.generatedPages[pId].validation?.isValid || !contextState.generatedPages[pId].markdown
    );

    for (const pageId of invalidPageIds) {
      const pageDef = sanitizedPages.find((p) => p.id === pageId);
      if (pageDef) {
        const repairSys = `You are a PRD Page Repair Specialist. Fix and return complete markdown for page "${pageDef.pageName}".`;
        const repairUser = `Re-generate full specification for page "${pageDef.pageName}" (${pageDef.pageSlug}).
${formatCompactContextLock(contextState)}

MARKER PROTOCOL:
<!-- PAGE_START: ${pageId} -->
PAGE_ID: ${pageId}
PAGE_NAME: ${pageDef.pageName}
SLUG: ${pageDef.pageSlug}

### Halaman: ${pageDef.pageName} (\`${pageDef.pageSlug}\`)
Purpose: ${pageDef.pagePurpose}
Key Sections: ${(pageDef.keySections || []).join(', ')}

### Section Breakdown:
(Tuliskan breakdown section secara mendalam)
<!-- PAGE_END: ${pageId} -->`;

        const repairedSingle = await runChunkGeneration(`REPAIR_PAGE_${pageId}`, repairSys, repairUser);
        const reExtracted = extractPagesFromChunkMarkdown(repairedSingle, [pageDef]);
        const repairedLock = reExtracted[pageId];

        // STATE RETENTION RULE: Only commit replacement if repaired result is valid
        if (repairedLock && repairedLock.markdown && repairedLock.validation?.isValid !== false) {
          contextState.generatedPages[pageId] = repairedLock;
        }
      }
    }

    // Reassemble and rerun Final QA & Quality Score
    finalMarkdown = assembleFinalPRDDocument(contextState);

    const reQAUserPrompt = buildFinalDocumentQAUserPrompt(finalMarkdown, contextState);
    const reQAOutput = await runChunkGeneration(PRD_CHUNK_KEYS.CHUNK_FINAL_DOCUMENT_QA, finalQASysPrompt, reQAUserPrompt);
    contextState.finalQA = parseFinalQAChunkToLock(reQAOutput);

    qualityResult = calculatePRDQualityScore(finalMarkdown, contextState);
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

