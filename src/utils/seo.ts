/**
 * Menerima input bebas dari user — bisa berupa kode verifikasi mentah,
 * ataupun baris HTML lengkap <meta name="google-site-verification" content="..." />.
 * Selalu mengembalikan HANYA nilai content-nya, sudah di-trim.
 */
export function extractGoogleSiteVerification(raw: string): string {
  const input = (raw || '').trim();
  if (!input) return '';

  // Coba tangkap dari atribut content="..." atau content='...'
  const match = input.match(/content\s*=\s*["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Kalau tidak ada pola <meta>, anggap user memang menempel kode mentahnya saja
  return input;
}
