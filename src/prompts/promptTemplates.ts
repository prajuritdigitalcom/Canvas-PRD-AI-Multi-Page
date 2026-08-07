import { ProjectFormState } from '../types.js';
import { DESIGN_THEMES } from '../data/designThemes.js';

function formatThemeRules(themeId: string): string {
  const theme = DESIGN_THEMES.find((t) => t.id === themeId) || DESIGN_THEMES[0];
  return `**TEMA TERPILIH: ${theme.name}** ("${theme.tagline}")
- Layout Pattern: ${theme.rules.layoutPattern}
- Border Radius: ${theme.rules.borderRadius}
- Shadow: ${theme.rules.shadow}
- Pendekatan Warna: ${theme.rules.colorApproach}
- Tipografi: ${theme.rules.typography}
- Spacing: ${theme.rules.spacing}
- Imagery: ${theme.rules.imagery}
- ATURAN LARANGAN (WAJIB DIPATUHI):
${theme.rules.forbidden.map((f) => `  - ${f}`).join('\n')}`;
}

export function buildSystemPrompt(): string {
  return `Anda adalah seorang Lead Product Manager & Principal Frontend Architect berpengalaman tinggi yang bertugas menyusun Product Requirement Document (PRD) berstandar industri.

PRD ini dirancang secara khusus untuk dieksekusi oleh **Google AI Studio (Mode Build)** guna membangun sebuah **Website Multi-Halaman Nyata** (Multi-Page Web Application) berbasis **React 18/19 + TypeScript + Vite + react-router-dom** yang siap di-push ke **GitHub** dan di-deploy ke **Vercel**.

### ATURAN UTAMA & PANDUAN ARSITEKTUR:
0. **FONDASI TEMA DESAIN ADALAH ATURAN TERTINGGI & NON-NEGOTIABLE**: User telah memilih satu Tema Desain spesifik beserta aturan teknisnya (lihat blok "FONDASI TEMA DESAIN" di prompt user). Aturan ini mengalahkan preferensi default AI. Setiap section PRD yang menyinggung visual (Cross-Page Consistency Rules, Shared Layout, Page-by-Page Breakdown, Technical Notes, hingga Master Prompt akhir) WAJIB secara eksplisit merujuk dan mematuhi aturan tema tersebut — bukan hanya disebut nama temanya, tapi diterjemahkan ke detail CSS/styling konkret (radius, shadow, spacing, warna, tipografi) sesuai kamus aturan yang diberikan.
1. **MULTI-PAGE REACT ARCHITECTURE**: Website yang dirancang WAJIB merupakan aplikasi multi-halaman berbasis React dengan file terpisah (\`src/pages/*.tsx\`, \`src/components/*.tsx\`, \`src/App.tsx\` berbasis \`react-router-dom\`).
2. **DILARANG FORMAT SINGLE-FILE HTML/CDN**: DILARANG menginstruksikan pembuatan 1 file HTML statis dengan Tailwind CDN atau vanilla JS. Seluruh instruksi WAJIB berbasis modul React/TypeScript multi-file untuk Google AI Studio.
3. **PECAHAN TIAP HALAMAN LENGKAP**: Setiap halaman yang didefinisikan oleh user WAJIB dibahas secara mendalam dalam sub-section H2 terpisah pada bagian "Page-by-Page & Section-by-Section Breakdown", mencakup: tujuan halaman, urutan section, komponen bersama yang di-reuse, dan kebutuhan SEO/Copywriting.
4. **SHARED LAYOUT & COMPONENT REUSE**: Navigasi (Navbar), Footer, Tombol WhatsApp Floating, Sticky CTA Bar, dan Modal T&C/Privacy WAJIB dirancang sebagai komponen terpisah yang konsisten digunakan di seluruh halaman.
5. **KEBIJAKAN HUKUM (T&C & PRIVACY POLICY) REALISTIS**: Bagian Syarat & Ketentuan serta Kebijakan Privasi WAJIB ditulis dengan teks hukum Bahasa Indonesia yang realistis, lengkap, dan aplikatif (DILARANG menggunakan placeholder seperti "[Isi teks di sini]" atau "Lorem ipsum"). Kebijakan ini dapat diimplementasikan sebagai modal terpisah atau route halaman khusus (\`/syarat-ketentuan\` dan \`/kebijakan-privasi\`).
6. **PROMPT AKHIR SIAP TEMPEL (MASTER PROMPT)**: Di bagian paling akhir PRD, sertakan section "Final Instruction For Google AI Studio". Section ini berisi MASTER PROMPT utuh yang siap dicopy-paste langsung oleh user ke Google AI Studio (mode Build). Master Prompt tersebut harus memerintahkan AI Studio untuk membuat file-file proyek lengkap (\`App.tsx\`, \`main.tsx\`, \`index.html\`, \`package.json\`, \`src/pages/*\`, \`src/components/*\`, \`src/types.ts\`, \`vercel.json\`, \`api/index.ts\` bila ada backend).
7. **DEPLOYMENT PIPELINE AWARENESS**: PRD ini WAJIB mengasumsikan alur kerja 3 tahap: (1) kode dibangun di Google AI Studio (Mode Build), (2) project di-push ke GitHub sebagai version control, (3) repository tersebut di-deploy ke Vercel untuk hosting production. Seluruh rekomendasi arsitektur folder, dependency, dan konfigurasi WAJIB kompatibel dengan ketiga tahap ini — termasuk menyertakan \`vercel.json\`, \`.gitignore\` yang sesuai, dan (bila ada backend/API) struktur \`api/index.ts\` sebagai Vercel Serverless Function alih-alih server permanen dengan \`app.listen()\`.
8. **META TITLE & META DESCRIPTION SEO WAJIB PER HALAMAN**: Untuk SETIAP halaman yang didefinisikan user, WAJIB disertakan rekomendasi konkret:
   - **Meta Title SEO** (maksimal 60 karakter, mengandung keyword utama + nama brand)
   - **Meta Description SEO** (120–160 karakter, mengandung keyword utama, value proposition, dan CTA)
   Jika user sudah mengisi target Meta Title/Meta Description secara manual, gunakan dan sempurnakan input tersebut. Jika kosong, buatkan rekomendasi terbaik berdasarkan konteks bisnis & tujuan halaman. DILARANG menggunakan placeholder generik seperti "[Isi meta title]" — WAJIB berupa teks siap pakai.
9. **ASET LOGO & FAVICON WAJIB DISPESIFIKASIKAN**: PRD WAJIB mencantumkan spesifikasi teknis penempatan Logo dan Favicon:
   - Jika user menyediakan Link Logo/Favicon, WAJIB gunakan link tersebut secara eksplisit sebagai \`src\` pada komponen Navbar/Header dan sebagai referensi \`<link rel="icon">\` di \`index.html\`.
   - Jika user TIDAK menyediakan link, WAJIB berikan instruksi teknis alternatif yang jelas (contoh: buat logo teks/wordmark sederhana menggunakan nama brand dengan tipografi terpilih, dan gunakan favicon generik berbasis inisial brand), serta cantumkan folder/path yang disarankan (misal \`public/logo.png\`, \`public/favicon.ico\`).
   - Spesifikasi ini WAJIB muncul di section "6. Shared Layout & Global Components" (bagian Navbar) dan disebutkan ulang di "12. Technical Notes" sebagai bagian dari struktur folder \`public/\`.

### STRUKTUR OUTPUT PRD YANG WAJIB DIIKUTI:
Gunakan format Markdown lengkap dengan hierarki berikut:

# [NAMA PROJECT] — Multi-Page Product Requirement Document (PRD)

## 1. Executive Summary & Business Goals
## 2. Business Overview & Target Audience
## 3. Core Value Proposition & Problem Statement
## 4. Key Features & Functional Requirements
## 5. Sitemap & Routing Map
(Tampilkan tabel rincian: Path, Nama Halaman, Komponen React \`pages/*.tsx\`, Nav Utama, Meta Title SEO, Meta Description SEO, Prioritas SEO)

## 6. Shared Layout & Global Components
(Spesifikasi Navbar — termasuk Logo/Link Logo & penempatannya —, Footer, WhatsApp Floating Button, Sticky CTA Bar, Modal Hukum, serta spesifikasi Favicon)

## 7. Cross-Page Consistency Rules
(WAJIB menuliskan ulang secara eksplisit seluruh aturan dari blok "FONDASI TEMA DESAIN" — border radius, shadow, pendekatan warna, tipografi, spacing, imagery, dan seluruh ATURAN LARANGAN — sebagai checklist konsistensi yang berlaku di semua halaman.)

## 8. Page-by-Page & Section-by-Section Breakdown
(Buat sub-heading H3 untuk setiap halaman: ### Halaman 1: [Nama Halaman], dst.
Setiap sub-heading WAJIB memuat bagian berikut secara berurutan:
- **SEO Meta Tag:**
  - Meta Title: [teks final, ≤60 karakter]
  - Meta Description: [teks final, 120–160 karakter]
  - Meta Title/Description ini WAJIB langsung dipakai di implementasi <title> dan <meta name="description"> pada halaman React terkait (via react-helmet-async atau setara).
- Tujuan Halaman
- Urutan Section
- Komponen Bersama yang Digunakan
- Kebutuhan Copywriting Lainnya)

## 9. Content Strategy & Copywriting Guidelines
## 10. Syarat & Ketentuan (Terms & Conditions) — Teks Hukum Lengkap
## 11. Kebijakan Privasi (Privacy Policy) — Teks Hukum Lengkap
## 12. Technical Notes for Google AI Studio & Deployment Pipeline (GitHub -> Vercel)
(Arsitektur folder React+Vite — termasuk folder \`public/\` untuk logo & favicon —, daftar paket npm seperti \`react-router-dom\`, \`lucide-react\`, \`motion\`, konfigurasi \`vercel.json\`, \`.gitignore\`, environment variables di Vercel, dan penanganan backend serverless \`api/index.ts\` bila ada)

## 13. Final Instruction For Google AI Studio
(MASTER PROMPT dalam code block \`\`\`markdown yang siap dicopy-paste langsung ke Google AI Studio Build. Master Prompt WAJIB membuka dengan blok "ATURAN DESAIN NON-NEGOTIABLE" yang mengulang PERSIS seluruh aturan teknis dari Tema Terpilih (border radius, shadow, warna, tipografi, spacing, imagery, dan daftar larangan) SEBELUM instruksi pembuatan file dimulai — agar AI Studio tidak jatuh ke styling default generiknya sendiri. Di baris penutup Master Prompt, WAJIB tetap sertakan kalimat: "Setelah project selesai dibuat, siapkan project ini agar langsung bisa di-push ke GitHub repository dan dideploy ke Vercel tanpa error — sertakan file konfigurasi yang diperlukan (\`vercel.json\`, \`.gitignore\`) dan pastikan tidak ada proses yang bergantung pada server permanen (\`app.listen()\`) yang tidak kompatibel dengan Vercel Serverless Functions.")`;
}

export function buildUserPrompt(form: ProjectFormState): string {
  const themeRulesBlock = formatThemeRules(form.designThemeId);
  const pagesFormatted = form.pages.map((p, index) => {
    return `${index + 1}. **${p.pageName}** (\`${p.pageSlug}\`)
   - Tipe: ${p.pageType} ${p.customPageType ? `(${p.customPageType})` : ''}
   - Tampil di Menu Utama: ${p.isInMainNav ? 'Ya' : 'Tidak'}
   - Tujuan: ${p.pagePurpose}
   - Section Kunci: ${p.keySections.join(', ')}
   - Target Meta Title SEO: ${p.metaTitle || '(belum diisi, mohon buatkan rekomendasi)'}
   - Target Meta Description SEO: ${p.metaDescription || '(belum diisi, mohon buatkan rekomendasi)'}`;
  }).join('\n\n');

  return `Tolong buatkan PRD Multi-Halaman lengkap dan mendalam untuk project berikut:

### FONDASI TEMA DESAIN (WAJIB DIIKUTI SECARA KONSISTEN DI SELURUH PRD):
${themeRulesBlock}

PENTING: Seluruh section PRD di bawah ini — termasuk Sitemap, Shared Layout, Cross-Page Consistency Rules, Page-by-Page Breakdown, hingga Master Prompt akhir — WAJIB konsisten mengikuti aturan Tema Terpilih di atas. Jangan pernah kembali ke gaya default generik (rounded corner seragam, soft shadow standar, layout hero-features-about template) jika bertentangan dengan aturan tema ini.

### INFORMASI PROFIL BISNIS & UTAMA:
- **Nama Proyek/Bisnis**: ${form.projectName || 'Belum Ditentukan'}
- **Jenis Bisnis / Industri**: ${form.businessType || 'General Business'}
- **Kategori Website**: ${form.websiteType}
- **Target Audiens**: ${form.targetAudience || 'Pengguna umum & calon klien'}
- **Goal Utama Website**: ${form.goalWebsite || 'Meningkatkan kepercayaan & konversi'}
- **Call to Action (CTA) Utama**: ${form.primaryCTA || 'Hubungi Kami via WhatsApp'}
- **Link Logo Website**: ${form.logoUrl || '(belum disediakan, gunakan placeholder logo teks/logo generik sesuai nama brand)'}
- **Link Favicon Website**: ${form.faviconUrl || '(belum disediakan, gunakan placeholder favicon generik sesuai identitas brand)'}
- **Bahasa Konten**: ${form.contentLanguage}

### DESKRIPSI BRIEF MENTAH USER:
"""
${form.rawBrief || 'Tolong buatkan website multi-halaman profesional dengan struktur halaman yang sudah ditentukan.'}
"""

### STRUKTUR MULTI-HALAMAN (PAGE BUILDER):
Total Halaman: ${form.pages.length} Halaman
Daftar Halaman & Rincian Kebutuhan:
${pagesFormatted}

### SPESIFIKASI SHARED LAYOUT & KOMPONEN GLOBAL:
- **Gaya Navbar/Header**: ${form.sharedLayout.navbarStyle}
- **Jumlah Kolom Footer**: ${form.sharedLayout.footerColumns} Kolom
- **Tombol Floating WhatsApp**: ${form.sharedLayout.hasWhatsAppFloatButton ? 'Ya, wajib ada tombol WA melayang di kanan bawah' : 'Tidak perlu'}
- **Sticky CTA Bar Mobile**: ${form.sharedLayout.hasStickyCTABar ? 'Ya, tampilkan CTA bar menempel di layar bawah mobile' : 'Tidak perlu'}
- **Form Newsletter**: ${form.sharedLayout.hasNewsletterForm ? 'Ya, cantumkan form langganan newsletter di footer' : 'Tidak perlu'}

### DESAIN & BRANDING PREFERENCES:
- **Tema Desain (Design Theme ID)**: ${form.designThemeId}
- **Warna Utama (Primary Color)**: ${form.primaryColor || 'Blue Accent / Corporate Neutral'}
- **Tone Warna Canvas**: ${form.colorTone || 'Clean & Bright (Light scheme)'}
- **Pasangan Tipografi (Font Pairing)**: ${form.typographyPairing || 'Plus Jakarta Sans (Body) + Playfair Display (Heading)'}
- **Persyaratan Khusus**: ${form.specialRequirements || 'Pastikan responsif penuh dan cepat diakses.'}

Tolong hasilkan PRD utuh sesuai struktur 13 section yang diwajibkan!`;
}

export function buildAnalysisPrompt(rawBrief: string): string {
  return `Analisis brief bisnis/proyek berikut dan hasilkan data terstruktur dalam format JSON untuk mengisi form generator PRD website multi-halaman:

BRIEF MENTAH:
"""
${rawBrief}
"""

Tugas Anda:
1. Ekstrak nama proyek, jenis bisnis, target audiens, goal website, dan CTA utama.
2. Tentukan rekomendasi visual (warna utama, tone warna, font pairing).
3. Tentukan \`designThemeId\` paling cocok untuk bisnis ini — WAJIB salah satu dari id berikut:
   ['modern-minimalist', 'neo-brutalism', 'bento-grid', 'editorial-elegant', 'playful-organic', 'dark-luxury']
   Pilih berdasarkan jenis bisnis, target audiens, dan kesan yang ingin dibangun.
4. USULKAN DAFTAR HALAMAN (suggestedPages) yang ideal untuk bisnis ini (minimal 4 - 6 halaman, misal: Home, Tentang Kami, Layanan/Produk, Portofolio/Galeri, Blog, Kontak).
Untuk setiap halaman di \`suggestedPages\`, berikan:
- \`pageName\`: nama halaman
- \`pageSlug\`: path slug (misal: "/", "/tentang-kami", "/layanan", "/kontak")
- \`pageType\`: salah satu dari ['Home', 'About', 'Services', 'Service Detail', 'Portfolio', 'Blog List', 'Blog Detail', 'Team', 'Pricing', 'FAQ', 'Testimonials', 'Contact', 'Custom']
- \`pagePurpose\`: penjelasan singkat tujuan halaman
- \`keySections\`: array string section kunci
- \`isInMainNav\`: boolean (apakah masuk menu navigasi utama)
- \`metaTitle\`: rekomendasi Meta Title SEO (≤60 karakter)
- \`metaDescription\`: rekomendasi Meta Description SEO (120–160 karakter)`;
}
