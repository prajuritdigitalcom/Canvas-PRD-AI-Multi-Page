import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { buildSystemPrompt, buildUserPrompt, buildAnalysisPrompt } from '../src/prompts/promptTemplates.js';
import { ProjectFormState, PRDGenerateResponse, BriefAnalysisResponse } from '../src/types.js';
import { GEMINI_MODEL, getModelFallbackChain } from '../src/config/aiModel.js';

// Vercel serverless function timeout
export const maxDuration = 60;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper: pisah string multi-baris atau koma jadi array key bersih
const splitKeysByLine = (raw: string): string[] =>
  raw
    .split(/[\n,]+/)
    .map((k) => k.replace(/\r/g, '').trim())
    .filter(Boolean);

const getServerKeys = (): string[] => {
  const keys: string[] = [];
  if (process.env.GEMINI_API_KEY) {
    const split = splitKeysByLine(process.env.GEMINI_API_KEY);
    split.forEach((k) => {
      if (!keys.includes(k)) keys.push(k);
    });
  }
  Object.keys(process.env).forEach((envKey) => {
    if (envKey.startsWith('GEMINI_API_KEY_') && !envKey.includes('BACKUP')) {
      const val = process.env[envKey];
      if (val) {
        const split = splitKeysByLine(val);
        split.forEach((k) => {
          if (!keys.includes(k)) keys.push(k);
        });
      }
    }
  });
  return keys;
};

const getBackupKeys = (): string[] => {
  const keys: string[] = [];
  Object.keys(process.env).forEach((envKey) => {
    if (
      envKey.includes('BACKUP') ||
      envKey === 'GEMINI_BACKUP_KEY' ||
      envKey === 'GEMINI_BACKUP_KEYS'
    ) {
      const val = process.env[envKey];
      if (val) {
        const split = splitKeysByLine(val);
        split.forEach((k) => {
          if (!keys.includes(k)) keys.push(k);
        });
      }
    }
  });
  return keys;
};

// Helper to parse visitor API keys from headers
const getVisitorKeys = (req: express.Request): string[] => {
  const headerKeys = req.headers['x-user-api-keys'] as string | undefined;
  const legacyHeader = req.headers['x-user-api-key'] as string | undefined;

  let parsed: string[] = [];
  if (headerKeys) {
    try {
      const json = JSON.parse(headerKeys);
      if (Array.isArray(json)) {
        parsed = json.map((k) => (typeof k === 'string' ? k.trim() : '')).filter(Boolean);
      }
    } catch {
      if (typeof headerKeys === 'string') {
        parsed = headerKeys.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);
      }
    }
  }

  if (parsed.length === 0 && legacyHeader) {
    parsed = legacyHeader.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);
  }

  return parsed;
};

// Get ordered unique list of all candidate keys (Visitor -> Server -> Backup)
const getAllCandidateKeys = (req: express.Request): string[] => {
  const visitor = getVisitorKeys(req);
  const server = getServerKeys();
  const backup = getBackupKeys();

  const combined = [...visitor, ...server, ...backup];
  return Array.from(new Set(combined.filter(Boolean)));
};

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Server & Key Status Check
app.get('/api/status', (req, res) => {
  const serverKeys = getServerKeys();
  const backupKeys = getBackupKeys();
  res.json({
    status: 'ok',
    hasSystemApiKey: serverKeys.length > 0 || backupKeys.length > 0,
    serverKeyCount: serverKeys.length,
    backupKeyCount: backupKeys.length,
  });
});

const verifyKeyWithGoogle = async (
  key: string
): Promise<{ valid: boolean; reason?: string }> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
      { headers: { 'User-Agent': 'aistudio-build' } }
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

const SUSPICIOUS_PATTERNS = [
  'ignore previous instructions',
  'ignore all previous',
  'disregard previous instructions',
  'abaikan instruksi sebelumnya',
  'abaikan semua instruksi',
  'reveal system prompt',
  'show system prompt',
  'reveal your instructions',
  'system prompt:',
  'override system instructions',
];

function isSuspiciousPromptInjection(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SUSPICIOUS_PATTERNS.some((pattern) => lower.includes(pattern));
}

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
      candidates.map(async (key) => {
        const result = await verifyKeyWithGoogle(key);
        return { key, ...result };
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
    const { rawBrief } = req.body;
    if (!rawBrief || typeof rawBrief !== 'string') {
      return res.status(400).json({ error: 'Brief mentah wajib diisi.' });
    }

    if (rawBrief.length > 10000) {
      return res.status(400).json({ error: 'Brief mentah terlalu panjang (maksimal 10000 karakter). Mohon persingkat brief Anda.' });
    }

    if (isSuspiciousPromptInjection(rawBrief)) {
      return res.status(400).json({ error: 'Brief mentah terdeteksi mengandung instruksi ilegal atau manipulasi prompt. Mohon masukkan deskripsi bisnis yang valid.' });
    }

    const candidateKeys = getAllCandidateKeys(req);
    if (candidateKeys.length === 0) {
      return res.status(400).json({
        error: 'Tidak ada API Key yang tersedia. Masukkan API Key Gemini pribadi Anda di menu Sistem & API Key.',
      });
    }

    const candidateModels = getModelFallbackChain();
    const prompt = buildAnalysisPrompt(rawBrief);
    let jsonText = '';
    let modelUsed = GEMINI_MODEL;
    let lastError: any = null;

    keyLoop: for (const apiKey of candidateKeys) {
      for (const modelCandidate of candidateModels) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

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

          jsonText = response.text || '{}';
          modelUsed = modelCandidate;
          lastError = null;
          break keyLoop; // Success
        } catch (err: any) {
          lastError = err;
          console.warn(`Candidate key or model (${modelCandidate}) failed, trying next option...`);
        }
      }
    }

    if (!jsonText && lastError) {
      throw lastError;
    }

    const parsed: BriefAnalysisResponse = JSON.parse(jsonText || '{}');
    parsed.modelUsed = modelUsed;

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.error('Error analyzing brief:', err);
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

    if (formState.rawBrief && isSuspiciousPromptInjection(formState.rawBrief)) {
      return res.status(400).json({ error: 'Brief mentah terdeteksi mengandung instruksi ilegal atau manipulasi prompt. Mohon masukkan deskripsi bisnis yang valid.' });
    }

    const candidateKeys = getAllCandidateKeys(req);
    if (candidateKeys.length === 0) {
      return res.status(400).json({
        error: 'Tidak ada API Key yang tersedia. Masukkan API Key Gemini pribadi Anda di menu Sistem & API Key.',
      });
    }

    const candidateModels = getModelFallbackChain();
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(formState);
    let markdownOutput = '';
    let modelUsed = GEMINI_MODEL;
    let lastError: any = null;

    keyLoop: for (const apiKey of candidateKeys) {
      for (const modelCandidate of candidateModels) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
            },
          });

          markdownOutput = response.text || '# PRD Generation Failed';
          modelUsed = modelCandidate;
          lastError = null;
          break keyLoop; // Success
        } catch (err: any) {
          lastError = err;
          console.warn(`Candidate key or model (${modelCandidate}) failed, trying next option...`);
        }
      }
    }

    if (!markdownOutput && lastError) {
      throw lastError;
    }

    // Trim preamble text before first H1 header `# `
    const h1Index = markdownOutput.indexOf('# ');
    if (h1Index !== -1 && h1Index < 500) {
      markdownOutput = markdownOutput.substring(h1Index);
    }

    // Calculate readiness score & reasons based on PRD & Form quality
    const pageCount = formState.pages?.length || 0;
    const passed: string[] = [];
    const warnings: string[] = [];

    if (pageCount >= 3) {
      passed.push(`Struktur multi-halaman sangat baik (${pageCount} halaman terdefinisi).`);
    } else if (pageCount >= 2) {
      passed.push(`Struktur multi-halaman mencukupi (${pageCount} halaman terdefinisi).`);
    } else {
      warnings.push('Disarankan menambah minimal 3-5 halaman untuk website bisnis multi-halaman yang komprehensif.');
    }

    if (formState.projectName) {
      passed.push(`Nama proyek terdefinisi: "${formState.projectName}".`);
    } else {
      warnings.push('Nama proyek belum diisi secara spesifik.');
    }

    if (formState.sharedLayout) {
      passed.push(`Konfigurasi Shared Layout (Navbar: ${formState.sharedLayout.navbarStyle}, Footer: ${formState.sharedLayout.footerColumns} kolom) lengkap.`);
    }

    if (formState.targetAudience && formState.goalWebsite) {
      passed.push('Target audiens dan goal utama website terdefinisi dengan jelas.');
    } else {
      warnings.push('Detail target audiens atau goal website dapat diperjelas.');
    }

    if (formState.primaryColor && formState.typographyPairing) {
      passed.push('Identitas visual (warna utama & tipografi) sudah ditentukan.');
    }

    if (formState.designThemeId) {
      passed.push(`Fondasi Tema Desain terpilih: "${formState.designThemeId}" — akan diikuti konsisten di seluruh PRD.`);
    }

    const pagesWithMeta = formState.pages?.filter((p) => p.metaTitle && p.metaDescription).length || 0;
    if (pagesWithMeta === pageCount && pageCount > 0) {
      passed.push('Seluruh halaman memiliki target Meta Title & Meta Description SEO.');
    } else if (pagesWithMeta > 0) {
      passed.push(`${pagesWithMeta} dari ${pageCount} halaman sudah memiliki Meta Title/Description SEO.`);
    } else {
      warnings.push('Belum ada halaman yang diisi Meta Title/Meta Description SEO secara manual (AI akan membuat rekomendasi otomatis).');
    }

    let readyScore = 70 + (pageCount >= 3 ? 15 : 10) + (formState.projectName ? 5 : 0) + (formState.targetAudience ? 5 : 0) + (warnings.length === 0 ? 5 : 0);
    readyScore = Math.min(100, Math.max(50, readyScore));

    const responseData: PRDGenerateResponse = {
      markdown: markdownOutput,
      readyScore,
      scoreReasons: {
        passed,
        warnings,
      },
      modelUsed,
    };

    return res.json(responseData);
  } catch (err: any) {
    console.error('Error generating PRD:', err);
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
