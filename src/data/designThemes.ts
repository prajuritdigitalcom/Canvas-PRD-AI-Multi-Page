export interface DesignThemeRule {
  id: string;
  name: string;
  tagline: string;
  bestFor: string; // jenis bisnis paling cocok
  rules: {
    layoutPattern: string;
    borderRadius: string;
    shadow: string;
    colorApproach: string;
    typography: string;
    spacing: string;
    imagery: string;
    forbidden: string[]; // hal yang DILARANG agar tidak jatuh ke default generik
  };
  // hanya untuk ditampilkan di UI (popup referensi), TIDAK dikirim ke prompt AI:
  referenceExamples: {
    name: string;
    url: string;
    note: string; // alasan singkat kenapa masuk kategori tema ini
  }[];
}

export const DESIGN_THEMES: DesignThemeRule[] = [
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    tagline: 'Bersih, tenang, dan dipercaya',
    bestFor: 'Company Profile, Jasa Konsultan, Finance, Kesehatan',
    rules: {
      layoutPattern: 'Ruang kosong (whitespace) dominan, satu CTA sangat jelas per section, grid 12-kolom presisi.',
      borderRadius: 'Konsisten kecil (4-8px), tidak berlebihan.',
      shadow: 'Shadow sangat tipis/nyaris tidak terlihat, hanya untuk elevasi kartu penting.',
      colorApproach: 'Palet netral (1 warna aksen dominan + 1-2 warna netral), tanpa gradient ramai.',
      typography: 'Sans-serif presisi, hierarki ukuran jelas, line-height lega.',
      spacing: 'Padding antar-section besar dan konsisten (min 80-120px desktop).',
      imagery: 'Foto asli/berkualitas tinggi, bukan ilustrasi kartun, bukan stok generik dengan gradient overlay.',
      forbidden: [
        'DILARANG rounded-full berlebihan di semua elemen',
        'DILARANG lebih dari 1 warna aksen mencolok',
        'DILARANG animasi/motion berlebihan yang mengalihkan fokus dari konten',
      ],
    },
    referenceExamples: [
      { name: 'Linear', url: 'https://linear.app', note: 'Whitespace luas, satu warna aksen, tipografi presisi.' },
      { name: 'Stripe', url: 'https://stripe.com', note: 'Grid rapi, shadow nyaris tak terlihat, kesan kredibel untuk produk finansial.' },
      { name: 'Warby Parker', url: 'https://warbyparker.com', note: 'Foto produk bersih di atas latar netral, navigasi sederhana.' },
    ],
  },
  {
    id: 'neo-brutalism',
    name: 'Neo-Brutalism',
    tagline: 'Berani, mentah, dan berbeda',
    bestFor: 'Agency Kreatif, Portofolio, Studio Desain, Brand Anak Muda',
    rules: {
      layoutPattern: 'Grid terlihat jelas/eksplisit, elemen boleh sedikit tidak simetris, struktur "terlihat" bukan disembunyikan.',
      borderRadius: 'Nyaris 0 (sharp corner), maksimal 2-4px jika terpaksa.',
      shadow: 'Hard shadow offset (contoh: box-shadow 4px 4px 0px warna solid), BUKAN soft blur shadow.',
      colorApproach: '2-3 warna solid kontras tinggi, tanpa gradient, tanpa pastel lembut.',
      typography: 'Font tebal/bold besar, kadang monospace untuk aksen, ukuran heading ekstra besar.',
      spacing: 'Padding tegas, elemen berdempetan dengan border tebal sebagai pemisah (bukan whitespace kosong).',
      imagery: 'Ilustrasi flat/geometris atau foto dengan filter kontras tinggi, bukan foto stok halus.',
      forbidden: [
        'DILARANG rounded-xl/rounded-2xl di komponen manapun',
        'DILARANG soft drop-shadow standar (blur besar, opacity rendah)',
        'DILARANG palet warna pastel lembut',
      ],
    },
    referenceExamples: [
      { name: 'Gumroad', url: 'https://gumroad.com', note: 'Border tebal, warna solid kontras tinggi, tanpa shadow lembut.' },
      { name: 'Feastables', url: 'https://feastables.com', note: 'Tombol besar seperti stiker, tipografi tegas, kesan energik.' },
    ],
  },
  {
    id: 'bento-grid',
    name: 'Bento Grid Modular',
    tagline: 'Padat informasi, rapi, dan scannable',
    bestFor: 'SaaS, Startup Produk Digital, Aplikasi/Layanan Multi-Fitur',
    rules: {
      layoutPattern: 'Kotak-kotak modular ukuran bervariasi (seperti kotak bekal Jepang) menyusun fitur/konten dalam satu grid utuh per section.',
      borderRadius: 'Sedang-besar (12-24px) khusus untuk tiap "kotak" bento agar terasa sebagai unit terpisah.',
      shadow: 'Shadow lembut hanya di border kotak, memberi sedikit elevasi tanpa berlebihan.',
      colorApproach: 'Latar netral (putih/abu sangat muda) dengan 1-2 kotak beraksen warna kuat sebagai focal point.',
      typography: 'Sans-serif modern, ukuran bervariasi sesuai ukuran kotak (kotak besar = judul besar).',
      spacing: 'Gap antar-kotak konsisten (16-24px), grid harus tetap rapi di mobile (stack vertikal).',
      imagery: 'Ikon custom, mini-chart/preview UI, atau screenshot produk di dalam kotak-kotak tersebut.',
      forbidden: [
        'DILARANG grid kotak berukuran seragam semua (harus ada variasi ukuran agar terasa "bento")',
        'DILARANG mengabaikan reflow ke single-column rapi di mobile',
      ],
    },
    referenceExamples: [
      { name: 'Apple (halaman produk)', url: 'https://apple.com', note: 'Kotak modular ukuran berbeda menyusun fitur dalam satu section.' },
      { name: 'Vercel', url: 'https://vercel.com', note: 'Kotak bento jadi panggung motion, tiap kotak terungkap saat scroll.' },
      { name: 'Notion', url: 'https://notion.so', note: 'Kombinasi kotak fitur dan preview UI produk dalam grid rapi.' },
    ],
  },
  {
    id: 'editorial-elegant',
    name: 'Editorial Elegant',
    tagline: 'Naratif, seperti membaca majalah premium',
    bestFor: 'Personal Brand, Edukasi, Blog/Media, Klinik/Wellness Premium',
    rules: {
      layoutPattern: 'Tipografi besar sebagai elemen visual utama (bukan gambar/ikon), narasi terungkap bertahap saat scroll.',
      borderRadius: 'Minimal, fokus ke garis pembatas (divider line) tipis, bukan card membulat.',
      shadow: 'Nyaris tidak ada shadow — mengandalkan garis/divider dan whitespace untuk pemisahan.',
      colorApproach: 'Monokrom/duotone (contoh: hitam-krem, atau 1 warna aksen earth-tone), sangat sedikit warna mencolok.',
      typography: 'Serif tebal untuk heading + sans-serif untuk body, ukuran heading sangat besar (viewport-scaled).',
      spacing: 'Lebar konten dibatasi (max-width kolom baca nyaman, ~65-75 karakter per baris) meski layar lebar.',
      imagery: 'Foto editorial berkualitas tinggi, ditempatkan besar full-width di antara blok teks.',
      forbidden: [
        'DILARANG layout kotak-kotak/card grid seperti bento',
        'DILARANG warna cerah/saturasi tinggi lebih dari 1 aksen',
      ],
    },
    referenceExamples: [
      { name: 'Aesop', url: 'https://aesop.com', note: 'Tipografi serif besar sebagai elemen utama, foto editorial full-width.' },
      { name: 'Mubi', url: 'https://mubi.com', note: 'Lebar konten dibatasi untuk kenyamanan baca, terasa seperti majalah digital.' },
    ],
  },
  {
    id: 'playful-organic',
    name: 'Playful Organic',
    tagline: 'Hangat, ramah, dan terasa buatan tangan',
    bestFor: 'UMKM, Komunitas, F&B, Brand Lokal yang Personal',
    rules: {
      layoutPattern: 'Bentuk melengkung asimetris (blob) sebagai elemen dekoratif background, bukan grid kaku.',
      borderRadius: 'Besar dan tidak seragam (rounded-3xl, atau custom blob shape via SVG).',
      shadow: 'Shadow lembut dan hangat (warna shadow sedikit tinted, bukan abu-abu netral).',
      colorApproach: 'Warna cerah hangat (bukan neon), kombinasi 2-3 warna ceria tapi tetap harmonis.',
      typography: 'Sans-serif membulat/friendly, sesekali handwritten-style font untuk aksen personal.',
      spacing: 'Tidak terlalu kaku, boleh sedikit overlap elemen dekoratif dengan konten.',
      imagery: 'Ilustrasi custom playful, foto candid/lifestyle asli (bukan foto studio formal).',
      forbidden: [
        'DILARANG grid kotak tegas/simetris sempurna ala korporat',
        'DILARANG palet warna monokrom/dingin',
      ],
    },
    referenceExamples: [
      { name: 'Mailchimp', url: 'https://mailchimp.com', note: 'Ilustrasi custom dan tipografi playful membangun identitas mudah dikenali.' },
      { name: 'Duolingo', url: 'https://duolingo.com', note: 'Warna cerah, elemen membulat, kesan menyenangkan dan mudah didekati.' },
      { name: 'Dropbox', url: 'https://dropbox.com', note: 'Bentuk blob lembut sebagai latar dekoratif di balik konten utama.' },
    ],
  },
  {
    id: 'dark-luxury',
    name: 'Dark Mode Luxury',
    tagline: 'Eksklusif, premium, dan berkelas',
    bestFor: 'Properti Premium, Jasa High-Ticket, Brand Mewah/Eksklusif',
    rules: {
      layoutPattern: 'Layar gelap dominan, elemen penting disorot dengan spacing besar & pencahayaan visual (glow/aksen tipis).',
      borderRadius: 'Kecil-sedang, presisi, konsisten.',
      shadow: 'Glow effect tipis (bukan shadow gelap standar) di elemen interaktif/highlight.',
      colorApproach: 'Latar gelap (charcoal/near-black) + aksen metalik (emas/tembaga) atau 1 warna jewel-tone.',
      typography: 'Serif elegan atau sans-serif tipis (thin/light weight) untuk kesan mewah, tracking huruf sedikit lebar di heading.',
      spacing: 'Sangat lega, elemen tidak berdesakan, kesan "ruang privat/eksklusif".',
      imagery: 'Foto dengan grading gelap/moody, detail material premium (tekstur emas, marmer, dsb).',
      forbidden: [
        'DILARANG latar putih/terang di section utama',
        'DILARANG warna aksen cerah/pastel — hanya metalik atau jewel-tone gelap',
      ],
    },
    referenceExamples: [
      { name: 'The Agency RE', url: 'https://theagencyre.com', note: 'Latar gelap dominan, foto properti sinematik, tipografi tipis elegan.' },
      { name: 'Bentley Motors', url: 'https://bentleymotors.com', note: 'Nuansa gelap dengan aksen metalik, spacing lega untuk kesan eksklusif.' },
    ],
  },
];
