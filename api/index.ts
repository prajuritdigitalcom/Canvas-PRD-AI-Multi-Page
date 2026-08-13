import express from 'express';
import path from 'path';
import { randomUUID } from 'node:crypto';
import { Type } from '@google/genai';
import { buildSystemPrompt, buildUserPrompt, buildAnalysisPrompt } from '../src/prompts/promptTemplates.js';
import { ProjectFormState, PRDGenerateResponse, BriefAnalysisResponse } from '../src/types.js';
import { getModelFallbackChain } from '../src/config/aiModel.js';
import {
  getVisitorKeysFromRequest,
  getVisitorPoolIdFromRequest,
  getVisitorRequestSequenceFromRequest,
  isValidVisitorPoolId,
  maskApiKey,
} from '../src/services/gemini/visitorKeyParser.js';
import { runGeminiWithVisitorKeys } from '../src/services/gemini/geminiRequestRunner.js';
import { generateMultiPagePRDPipeline } from './prd/chunkGenerator.js';

// Vercel serverless function timeout (set to 300 seconds as required)
export const maxDuration = 300;

const app = express();
app.use(express.json({ limit: '10mb' }));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Status Check
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Password Lock Configuration
const EXPECTED_PASSWORD = process.env.PASSWORD;

interface LockoutState {
  failedAttempts: number;
  lockedUntil: number;
}
const ipLockoutMap = new Map<string, LockoutState>();

const getClientIp = (req: express.Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

// API: Check Lock Status
app.get('/api/check-lock', (req, res) => {
  const clientIp = getClientIp(req);
  const state = ipLockoutMap.get(clientIp);
  const now = Date.now();

  if (state && state.lockedUntil > now) {
    return res.json({
      isLocked: true,
      lockedUntil: state.lockedUntil,
      remainingAttempts: 0,
    });
  }

  const remaining = state ? Math.max(0, 3 - state.failedAttempts) : 3;
  return res.json({
    isLocked: false,
    remainingAttempts: remaining,
  });
});

// API: Verify Password
app.post('/api/verify-password', (req, res) => {
  if (!EXPECTED_PASSWORD) {
    return res.status(400).json({
      success: false,
      isLocked: false,
      message: 'Sistem penguncian password belum dikonfigurasi di server (variabel PASSWORD belum diisi).',
    });
  }

  const { password } = req.body || {};
  const clientIp = getClientIp(req);
  const now = Date.now();

  let state = ipLockoutMap.get(clientIp) || { failedAttempts: 0, lockedUntil: 0 };

  if (state.lockedUntil > now) {
    return res.status(429).json({
      success: false,
      isLocked: true,
      lockedUntil: state.lockedUntil,
      attemptsLeft: 0,
      message: 'Akses dikunci selama 12 jam karena 3x gagal.',
    });
  }

  if (state.lockedUntil > 0 && now >= state.lockedUntil) {
    state = { failedAttempts: 0, lockedUntil: 0 };
  }

  if (typeof password === 'string' && password.trim() === EXPECTED_PASSWORD) {
    ipLockoutMap.delete(clientIp);
    const sessionToken = `auth_${randomUUID()}`;
    return res.json({
      success: true,
      message: 'Password benar! Website dibuka.',
      token: sessionToken,
    });
  } else {
    state.failedAttempts += 1;
    const attemptsLeft = Math.max(0, 3 - state.failedAttempts);

    if (state.failedAttempts >= 3) {
      const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
      state.lockedUntil = now + TWELVE_HOURS_MS;
      ipLockoutMap.set(clientIp, state);

      return res.status(403).json({
        success: false,
        isLocked: true,
        lockedUntil: state.lockedUntil,
        attemptsLeft: 0,
        message: 'Password salah 3x berturut-turut! Akses dikunci selama 12 jam.',
      });
    } else {
      ipLockoutMap.set(clientIp, state);

      return res.status(401).json({
        success: false,
        isLocked: false,
        attemptsLeft,
        message: `Password salah! Sisa percobaan: ${attemptsLeft}x lagi.`,
      });
    }
  }
});

const verifyKeyWithGoogle = async (
  key: string
): Promise<{ valid: boolean; reason?: string }> => {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models',
      {
        headers: {
          'x-goog-api-key': key,
          'User-Agent': 'aistudio-build',
        },
      }
    );

    if (response.ok) {
      return { valid: true };
    }

    const body = await response.json().catch(() => null);
    const reason =
      body?.error?.status || body?.error?.message || `Ditolak Google (HTTP ${response.status})`;
    return { valid: false, reason };
  } catch (err: any) {
    return {
      valid: false,
      reason: 'Gagal menghubungi server Google: ' + (err?.message || 'unknown error'),
    };
  }
};

// API: Validate visitor Gemini API keys
app.post('/api/validate-keys', async (req, res) => {
  try {
    const { keys } = req.body as { keys?: string[] };
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: 'Tidak ada key yang dikirim.' });
    }

    // Limit to max 20 keys
    const candidates = keys
      .slice(0, 20)
      .map((k) => (typeof k === 'string' ? k.trim() : ''))
      .filter(Boolean);

    const results = await Promise.all(
      candidates.map(async (key, index) => {
        const result = await verifyKeyWithGoogle(key);
        return {
          index,
          maskedKey: maskApiKey(key),
          valid: result.valid,
          reason: result.reason,
        };
      })
    );

    return res.json({ results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Gagal memverifikasi API key.' });
  }
});

// API: Analyze Brief (Auto Mode)
app.post('/api/analyze-brief', async (req, res) => {
  try {
    const { rawBrief, visitorPoolId: customPoolId } = req.body;
    if (!rawBrief || typeof rawBrief !== 'string') {
      return res.status(400).json({ error: 'Brief mentah wajib diisi.' });
    }

    if (rawBrief.length > 10000) {
      return res.status(400).json({ error: 'Brief mentah terlalu panjang (maksimal 10000 karakter). Mohon persingkat brief Anda.' });
    }

    if (customPoolId && !isValidVisitorPoolId(customPoolId)) {
      return res.status(400).json({ error: 'Format visitorPoolId tidak valid.' });
    }

    const visitorKeys = getVisitorKeysFromRequest(req);
    if (visitorKeys.length === 0) {
      return res.status(400).json({
        error: 'Tidak ada API Key yang tersedia. Masukkan API Key Gemini Anda di menu Gemini API Key.',
      });
    }

    const visitorPoolId = getVisitorPoolIdFromRequest(req, visitorKeys);
    const visitorRequestSequence = getVisitorRequestSequenceFromRequest(req);
    const candidateModels = getModelFallbackChain();
    const prompt = buildAnalysisPrompt(rawBrief);

    const runnerResult = await runGeminiWithVisitorKeys<string>({
      keys: visitorKeys,
      candidateModels,
      visitorPoolId,
      visitorRequestSequence,
      executor: async (ai, apiKey, modelCandidate) => {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                projectName: { type: Type.STRING, description: 'Nama proyek atau bisnis' },
                businessType: { type: Type.STRING, description: 'Bidang usaha atau industri' },
                websiteType: {
                  type: Type.STRING,
                  description: 'Kategori website (Company Profile, E-Commerce / Catalog, SaaS / Service App, Agency / Portfolio, Educational / Community)',
                },
                targetAudience: { type: Type.STRING, description: 'Target pengguna / calon klien' },
                goalWebsite: { type: Type.STRING, description: 'Tujuan utama website' },
                primaryCTA: { type: Type.STRING, description: 'Call to Action utama (misal: WhatsApp)' },
                primaryColor: { type: Type.STRING, description: 'Rekomendasi warna utama' },
                colorTone: { type: Type.STRING, description: 'Tone warna canvas' },
                typographyPairing: { type: Type.STRING, description: 'Pasangan font' },
                designThemeId: { type: Type.STRING, description: 'ID Tema Desain terpilih (modern-minimalist, neo-brutalism, bento-grid, editorial-elegant, playful-organic, dark-luxury)' },
                contentLanguage: { type: Type.STRING, description: 'Indonesian, English, atau Bilingual' },
                specialRequirements: { type: Type.STRING, description: 'Kebutuhan khusus' },
                suggestedPages: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      pageName: { type: Type.STRING },
                      pageSlug: { type: Type.STRING },
                      pageType: { type: Type.STRING },
                      pagePurpose: { type: Type.STRING },
                      keySections: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      isInMainNav: { type: Type.BOOLEAN },
                      metaTitle: { type: Type.STRING, description: 'Rekomendasi Meta Title SEO (≤60 karakter)' },
                      metaDescription: { type: Type.STRING, description: 'Rekomendasi Meta Description SEO (120–160 karakter)' },
                    },
                    required: ['pageName', 'pageSlug', 'pageType', 'pagePurpose', 'isInMainNav'],
                  },
                },
              },
            },
          },
        });
        return response.text || '{}';
      },
    });

    const parsed: BriefAnalysisResponse = JSON.parse(runnerResult.data || '{}');
    parsed.modelUsed = runnerResult.modelUsed;

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.error('Error analyzing brief:', err?.message || 'terjadi kesalahan');
    return res.status(500).json({ error: err.message || 'Gagal menganalisis brief mentah.' });
  }
});

// API: Generate PRD
app.post('/api/generate-prd', async (req, res) => {
  try {
    const formState: ProjectFormState = req.body;

    if (!formState) {
      return res.status(400).json({ error: 'Data form PRD tidak ditemukan.' });
    }

    if (formState.pages && formState.pages.length > 20) {
      return res.status(400).json({ error: 'Jumlah halaman melebihi batas maksimum (maksimal 20 halaman).' });
    }

    if (formState.rawBrief && formState.rawBrief.length > 10000) {
      return res.status(400).json({ error: 'Brief mentah terlalu panjang (maksimal 10000 karakter).' });
    }

    if (req.body?.visitorPoolId && !isValidVisitorPoolId(req.body.visitorPoolId)) {
      return res.status(400).json({ error: 'Format visitorPoolId tidak valid.' });
    }

    const visitorKeys = getVisitorKeysFromRequest(req);
    if (visitorKeys.length === 0) {
      return res.status(400).json({
        error: 'Tidak ada API Key yang tersedia. Masukkan API Key Gemini Anda di menu Gemini API Key.',
      });
    }

    const visitorPoolId = getVisitorPoolIdFromRequest(req, visitorKeys);
    const visitorRequestSequence = getVisitorRequestSequenceFromRequest(req);

    const pipelineResult = await generateMultiPagePRDPipeline(
      formState,
      visitorKeys,
      visitorPoolId,
      visitorRequestSequence
    );

    return res.json(pipelineResult);
  } catch (err: any) {
    console.error('Error generating PRD:', err?.message || 'terjadi kesalahan');
    return res.status(500).json({ error: err.message || 'Gagal menghasilkan PRD.' });
  }
});

// Serve static assets or mount Vite dev server (ONLY if not running on Vercel as a serverless function)
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;

  const startLocalServer = async () => {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server berjalan di port ${PORT}`);
    });
  };

  startLocalServer().catch((err) => {
    console.error('Gagal menjalankan server lokal:', err);
  });
}

export { app };
export default app;
