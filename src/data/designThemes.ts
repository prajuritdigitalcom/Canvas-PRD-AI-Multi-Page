export interface ResponsiveFontToken {
  desktop: string;
  tablet: string;
  mobile: string;
}

export interface ColorContrastPair {
  backgroundToken: string;
  textToken: string;
  usage: string;
}

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
    typographyScale: {
      h1: ResponsiveFontToken;
      h2: ResponsiveFontToken;
      h3: ResponsiveFontToken;
      h4: ResponsiveFontToken;
      bodyLarge: ResponsiveFontToken;
      body: ResponsiveFontToken;
      bodySmall: ResponsiveFontToken;
      caption: ResponsiveFontToken;
    };
    colorContrastPairs: ColorContrastPair[];
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
      typographyScale: {
        h1: { desktop: '48px, bold', tablet: '38px, bold', mobile: '30px, bold' },
        h2: { desktop: '36px, bold', tablet: '30px, bold', mobile: '24px, bold' },
        h3: { desktop: '28px, semibold', tablet: '24px, semibold', mobile: '20px, semibold' },
        h4: { desktop: '22px, semibold', tablet: '20px, semibold', mobile: '18px, semibold' },
        bodyLarge: { desktop: '18px, regular', tablet: '17px, regular', mobile: '16px, regular' },
        body: { desktop: '16px, regular', tablet: '16px, regular', mobile: '15px, regular' },
        bodySmall: { desktop: '14px, regular', tablet: '14px, regular', mobile: '13px, regular' },
        caption: { desktop: '12px, medium', tablet: '12px, medium', mobile: '12px, medium' },
      },
      colorContrastPairs: [
        { backgroundToken: 'Surface Light (#FFFFFF)', textToken: 'Text Dark (#0F172A)', usage: 'Section dengan latar terang standar' },
        { backgroundToken: 'Surface Muted (#F8FAFC)', textToken: 'Text Dark (#0F172A)', usage: 'Section alternating background' },
        { backgroundToken: 'Surface Dark (#0F172A)', textToken: 'Text Light (#F8FAFC)', usage: 'Section CTA / footer latar gelap' },
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
      typographyScale: {
        h1: { desktop: '56px, black/extrabold', tablet: '42px, black/extrabold', mobile: '32px, black/extrabold' },
        h2: { desktop: '40px, extrabold', tablet: '32px, extrabold', mobile: '26px, extrabold' },
        h3: { desktop: '30px, bold', tablet: '25px, bold', mobile: '22px, bold' },
        h4: { desktop: '24px, bold', tablet: '21px, bold', mobile: '18px, bold' },
        bodyLarge: { desktop: '18px, medium', tablet: '17px, medium', mobile: '16px, medium' },
        body: { desktop: '16px, medium', tablet: '16px, medium', mobile: '15px, medium' },
        bodySmall: { desktop: '14px, bold', tablet: '14px, bold', mobile: '13px, bold' },
        caption: { desktop: '12px, bold', tablet: '12px, bold', mobile: '12px, bold' },
      },
      colorContrastPairs: [
        { backgroundToken: 'Surface Light (#FFFDF5)', textToken: 'Text Dark (#000000)', usage: 'Section latar krem/putih terang berborder hitam' },
        { backgroundToken: 'Surface Accent Yellow (#FFDE59)', textToken: 'Text Dark (#000000)', usage: 'Section/card aksen kuning solid' },
        { backgroundToken: 'Surface Dark (#000000)', textToken: 'Text Light (#FFFFFF)', usage: 'Section CTA/footer hitam pekat' },
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
      typographyScale: {
        h1: { desktop: '48px, bold', tablet: '38px, bold', mobile: '30px, bold' },
        h2: { desktop: '36px, bold', tablet: '30px, bold', mobile: '24px, bold' },
        h3: { desktop: '26px, semibold', tablet: '22px, semibold', mobile: '20px, semibold' },
        h4: { desktop: '20px, semibold', tablet: '19px, semibold', mobile: '18px, semibold' },
        bodyLarge: { desktop: '18px, regular', tablet: '17px, regular', mobile: '16px, regular' },
        body: { desktop: '16px, regular', tablet: '15px, regular', mobile: '15px, regular' },
        bodySmall: { desktop: '14px, regular', tablet: '14px, regular', mobile: '13px, regular' },
        caption: { desktop: '12px, medium', tablet: '12px, medium', mobile: '12px, medium' },
      },
      colorContrastPairs: [
        { backgroundToken: 'Surface Light (#FFFFFF)', textToken: 'Text Dark (#09090B)', usage: 'Kartu & section latar putih' },
        { backgroundToken: 'Surface Subtly Gray (#F4F4F5)', textToken: 'Text Dark (#09090B)', usage: 'Section/kartu bento kontras lembut' },
        { backgroundToken: 'Surface Accent Blue/Dark (#18181B)', textToken: 'Text Light (#FAFAFA)', usage: 'Kartu bento focal point / footer' },
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
      typographyScale: {
        h1: { desktop: '56px, serif bold', tablet: '42px, serif bold', mobile: '32px, serif bold' },
        h2: { desktop: '40px, serif bold', tablet: '32px, serif bold', mobile: '26px, serif bold' },
        h3: { desktop: '30px, serif semibold', tablet: '25px, serif semibold', mobile: '22px, serif semibold' },
        h4: { desktop: '22px, semibold', tablet: '20px, semibold', mobile: '18px, semibold' },
        bodyLarge: { desktop: '20px, regular', tablet: '18px, regular', mobile: '16px, regular' },
        body: { desktop: '17px, regular', tablet: '16px, regular', mobile: '15px, regular' },
        bodySmall: { desktop: '14px, regular', tablet: '14px, regular', mobile: '13px, regular' },
        caption: { desktop: '12px, medium', tablet: '12px, medium', mobile: '12px, medium' },
      },
      colorContrastPairs: [
        { backgroundToken: 'Surface Cream/Warm Light (#FAFAFA)', textToken: 'Text Charcoal (#1C1917)', usage: 'Latar baca majalah terang' },
        { backgroundToken: 'Surface Soft Beige (#F5F5F4)', textToken: 'Text Charcoal (#1C1917)', usage: 'Latar artikel/quote terpisah' },
        { backgroundToken: 'Surface Dark Espresso (#1C1917)', textToken: 'Text Warm Cream (#FAFAFA)', usage: 'Section penutup/footer majalah' },
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
      typographyScale: {
        h1: { desktop: '46px, rounded bold', tablet: '36px, rounded bold', mobile: '30px, rounded bold' },
        h2: { desktop: '34px, rounded bold', tablet: '28px, rounded bold', mobile: '24px, rounded bold' },
        h3: { desktop: '26px, rounded semibold', tablet: '22px, rounded semibold', mobile: '20px, rounded semibold' },
        h4: { desktop: '20px, rounded semibold', tablet: '18px, rounded semibold', mobile: '17px, rounded semibold' },
        bodyLarge: { desktop: '18px, regular', tablet: '17px, regular', mobile: '16px, regular' },
        body: { desktop: '16px, regular', tablet: '16px, regular', mobile: '15px, regular' },
        bodySmall: { desktop: '14px, medium', tablet: '14px, medium', mobile: '13px, medium' },
        caption: { desktop: '12px, bold', tablet: '12px, bold', mobile: '12px, bold' },
      },
      colorContrastPairs: [
        { backgroundToken: 'Surface Organic Light (#FFFBEB)', textToken: 'Text Warm Dark (#292524)', usage: 'Latar hangat ceria' },
        { backgroundToken: 'Surface Soft Peach (#FFEDD5)', textToken: 'Text Warm Dark (#292524)', usage: 'Card/blob latar hangat' },
        { backgroundToken: 'Surface Dark Organic (#292524)', textToken: 'Text Light (#FFFBEB)', usage: 'Section footer/CTA hangat gelap' },
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
      typographyScale: {
        h1: { desktop: '52px, thin/light tracking-wide', tablet: '40px, light', mobile: '32px, light' },
        h2: { desktop: '38px, light tracking-wide', tablet: '30px, light', mobile: '24px, light' },
        h3: { desktop: '28px, regular', tablet: '24px, regular', mobile: '20px, regular' },
        h4: { desktop: '22px, regular', tablet: '20px, regular', mobile: '18px, regular' },
        bodyLarge: { desktop: '18px, light', tablet: '17px, light', mobile: '16px, light' },
        body: { desktop: '16px, light', tablet: '15px, light', mobile: '15px, light' },
        bodySmall: { desktop: '14px, regular', tablet: '14px, regular', mobile: '13px, regular' },
        caption: { desktop: '12px, tracking-widest medium', tablet: '12px, medium', mobile: '12px, medium' },
      },
      colorContrastPairs: [
        { backgroundToken: 'Surface Dark Obsidian (#0B0F17)', textToken: 'Text Metallic Light (#F1F5F9)', usage: 'Canvas utama dark luxury' },
        { backgroundToken: 'Surface Elevated Dark (#1E293B)', textToken: 'Text Light (#F8FAFC)', usage: 'Kartu & section terangkat' },
        { backgroundToken: 'Surface Accent Gold (#D97706)', textToken: 'Text Dark Obsidian (#0B0F17)', usage: 'Highlight/CTA aksen emas' },
      ],
    },
    referenceExamples: [
      { name: 'The Agency RE', url: 'https://theagencyre.com', note: 'Latar gelap dominan, foto properti sinematik, tipografi tipis elegan.' },
      { name: 'Bentley Motors', url: 'https://bentleymotors.com', note: 'Nuansa gelap dengan aksen metalik, spacing lega untuk kesan eksklusif.' },
    ],
  },
];
