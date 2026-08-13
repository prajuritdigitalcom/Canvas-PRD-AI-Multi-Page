# Canvas PRD AI Generator (Visitor API Key Architecture)

Generator PRD Website Multi-Halaman cerdas yang berjalan sepenuhnya dengan **Visitor API Key Only**.

## 🚀 Fitur Utama
- **Visitor API Key Only**: Setiap pengunjung memasukkan API Key Gemini mereka sendiri secara mandiri.
- **Round Robin Selection**: Rotasi otomatis antar API Key milik pengguna per sesi.
- **Adaptive Cooldown & Failover**: Bounded retry otomatis jika terjadi 429 Rate Limit / Quota Exceeded dengan exponential backoff + jitter.
- **Visitor Session Isolation**: Setiap sesi pengunjung terisolasi total melalui `visitorPoolId` tanpa campur aduk state antar pengguna.
- **Tanpa Server-side Secrets**: Tidak ada `GEMINI_API_KEY` rahasia di server.

## 🛠️ Cara Memulai

1. **Instal Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```

3. **Gunakan Aplikasi**:
   - Buka aplikasi di browser.
   - Buka menu **Gemini API Key** di sidebar.
   - Masukkan satu atau lebih API Key Gemini milik Anda (dapatkan dari [Google AI Studio](https://aistudio.google.com/app/apikey)).
   - Beberapa key dapat disimpan sekaligus untuk mengaktifkan fitur Round Robin, Failover, dan Adaptive Cooldown.

## 🧪 Menguji Sistem

Jalankan pengujian unit terpadu untuk pengujian prompt templates dan Gemini Visitor Key services:
```bash
npm test
```

## 🔐 Keamanan
- API Key tersimpan secara lokal di browser (`sessionStorage` / `localStorage`) pengguna dan tidak pernah disimpan dalam database server.
- Verifikasi API Key dilakukan melalui HTTP Header `x-goog-api-key` langsung tanpa membocorkan raw key di URL atau log server.
