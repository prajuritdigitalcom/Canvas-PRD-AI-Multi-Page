import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { buildSystemPrompt, buildUserPrompt, buildAnalysisPrompt } from '../src/prompts/promptTemplates.js';
import { ProjectFormState, PRDGenerateResponse, BriefAnalysisResponse } from '../src/types.js';

// Vercel serverless function timeout
export const maxDuration = 60;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to parse server & backup Gemini API keys
const getServerKeys = (): string[] => {
  const keys: string[] = [];
  if (process.env.GEMINI_API_KEY) {
    const split = process.env.GEMINI_API_KEY.split(',').map((k) => k.trim()).filter(Boolean);
    keys.push(...split);
  }
  Object.keys(process.env).forEach((envKey) => {
    if (envKey.startsWith('GEMINI_API_KEY_') && !envKey.includes('BACKUP')) {
      const val = process.env[envKey]?.trim();
      if (val && !keys.includes(val)) {
        keys.push(val);
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
      const val = process.env[envKey]?.trim();
      if (val) {
        const split = val.split(',').map((k) => k.trim()).filter(Boolean);
        split.forEach((k) => {
          if (!keys.includes(k)) keys.push(k);
        });
      }
    }
  });
  return keys;
};

// Helper to instantiate Gemini client
const getGeminiClient = (visitorApiKey?: string) => {
  const serverKeys = getServerKeys();
  const backupKeys = getBackupKeys();
  
  // Prefer visitor key if provided, or server keys, or server backup keys
  const visitorKeyClean = visitorApiKey?.trim();
  const primaryKey = visitorKeyClean || serverKeys[0] || backupKeys[0];

  if (!primaryKey) {
    throw new Error(
      'Tidak ada API Key yang tersedia. Masukkan API Key Gemini pribadi Anda di menu Sistem & API Key.'
    );
  }
  return new GoogleGenAI({
    apiKey: primaryKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
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

// API: Analyze Brief (Auto Mode)
app.post('/api/analyze-brief', async (req, res) => {
  try {
    const { rawBrief } = req.body;
    if (!rawBrief || typeof rawBrief !== 'string') {
      return res.status(400).json({ error: 'Brief mentah wajib diisi.' });
    }

    const visitorApiKey = req.headers['x-user-api-key'] as string | undefined;
    const ai = getGeminiClient(visitorApiKey);
    const prompt = buildAnalysisPrompt(rawBrief);

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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
            visualStyle: { type: Type.STRING, description: 'Gaya visual' },
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
                },
                required: ['pageName', 'pageSlug', 'pageType', 'pagePurpose', 'isInMainNav'],
              },
            },
          },
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsed: BriefAnalysisResponse = JSON.parse(jsonText);

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

    const visitorApiKey = req.headers['x-user-api-key'] as string | undefined;
    const ai = getGeminiClient(visitorApiKey);
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(formState);

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const markdownOutput = response.text || '# PRD Generation Failed';

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

    let readyScore = 70 + (pageCount >= 3 ? 15 : 10) + (formState.projectName ? 5 : 0) + (formState.targetAudience ? 5 : 0) + (warnings.length === 0 ? 5 : 0);
    readyScore = Math.min(100, Math.max(50, readyScore));

    const responseData: PRDGenerateResponse = {
      markdown: markdownOutput,
      readyScore,
      scoreReasons: {
        passed,
        warnings,
      },
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
