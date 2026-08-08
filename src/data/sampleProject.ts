import { ProjectFormState, PageDefinition } from '../types';

export interface SampleProjectMeta {
  id: string;
  label: string;
  shortDescription: string;
  data: ProjectFormState;
}

const page = (
  overrides: Partial<PageDefinition> & Pick<PageDefinition, 'pageName' | 'pageSlug' | 'pageType' | 'pagePurpose' | 'keySections' | 'isInMainNav'>,
  order: number,
  idPrefix: string
): PageDefinition => ({
  id: `page-sample-${idPrefix}-${order}`,
  order,
  metaTitle: '',
  metaDescription: '',
  ...overrides,
});

// ============================================================
// 1. COMPANY PROFILE STANDAR — "KonsultanPajakKu"
// ============================================================
const COMPANY_PROFILE_SAMPLE: ProjectFormState = {
  projectName: 'KonsultanPajakKu',
  businessType:
    'Firma Konsultan Pajak, Akuntansi & Audit Internal Bersertifikat (Kantor Konsultan Pajak Terdaftar Kemenkeu)',
  websiteType: 'Company Profile',
  targetAudience:
    'Direktur keuangan dan pemilik perusahaan menengah-besar (omzet Rp5 miliar - Rp200 miliar/tahun) di sektor manufaktur, konstruksi, dan retail di Jabodetabek yang butuh kepatuhan pajak tanpa risiko sanksi, serta pemilik UMKM naik kelas yang baru wajib PKP dan butuh pendampingan pembukuan profesional.',
  rawBrief:
    'KonsultanPajakKu adalah Kantor Konsultan Pajak (KKP) terdaftar resmi di Direktorat Jenderal Pajak dengan konsultan bersertifikat USKP tingkat A, B, dan C, berkantor pusat di kawasan SCBD Jakarta Selatan dan cabang di Surabaya. Berdiri sejak 2015, kami telah menangani lebih dari 150 klien korporat aktif dari berbagai sektor seperti manufaktur, konstruksi, retail, F&B, dan startup teknologi, didukung tim 24 konsultan pajak bersertifikat dan akuntan publik. Layanan utama kami mencakup pelaporan SPT Masa & Tahunan (PPh 21/23/25/29, PPN), audit internal & kepatuhan, perencanaan pajak korporat (tax planning) untuk efisiensi legal, pendampingan pemeriksaan pajak (tax audit assistance) serta keberatan/banding pajak, hingga jasa pembukuan dan penyusunan laporan keuangan sesuai SAK. Kami pernah menangani studi kasus restitusi pajak senilai lebih dari Rp3,2 miliar untuk klien manufaktur dan berhasil menekan potensi sanksi pajak hingga 40% melalui tax planning yang tepat. Saat ini kami hanya punya company profile berupa PDF yang dikirim manual via email, sehingga menyulitkan calon klien korporat mencari informasi kredibilitas kami secara online, membandingkan layanan, atau menjadwalkan konsultasi. Kami butuh website company profile multi-halaman yang profesional dan meyakinkan, menampilkan rekam jejak, studi kasus nyata (dengan anonimisasi nama klien), sertifikasi tim konsultan, serta artikel edukasi pajak berkala untuk membangun otoritas (SEO) di mata calon klien korporat yang biasanya riset online dulu sebelum menghubungi konsultan pajak.',
  goalWebsite:
    'Menghasilkan minimal 15-20 leads konsultasi gratis berkualitas per bulan dari calon klien korporat, sekaligus membangun kredibilitas & otoritas sebagai firma pajak terpercaya melalui konten edukasi dan studi kasus nyata',
  primaryCTA: 'Konsultasi Gratis via WhatsApp',
  logoUrl: '',
  faviconUrl: '',

  pages: [
    page(
      {
        pageName: 'Home',
        pageSlug: '/',
        pageType: 'Home',
        pagePurpose:
          'Halaman utama yang meyakinkan direktur/pemilik perusahaan dalam 5 detik pertama bahwa KonsultanPajakKu adalah firma pajak terpercaya dan bersertifikat, dengan ringkasan value proposition, layanan unggulan, angka pencapaian, dan jalur cepat menuju konsultasi gratis.',
        keySections: [
          'Hero Banner dengan Headline & CTA Konsultasi Gratis',
          'Angka Pencapaian (150+ Klien, 9 Tahun Pengalaman, 24 Konsultan Bersertifikat)',
          'Ringkasan 4 Layanan Utama (Pajak, Audit, Tax Planning, Pembukuan)',
          'Mengapa Memilih Kami (Bersertifikat USKP, Terdaftar DJP, Respon Cepat)',
          'Testimoni & Logo Klien Korporat',
          'Artikel Edukasi Pajak Terbaru',
          'CTA Banner Konsultasi Gratis',
        ],
        isInMainNav: true,
        metaTitle: 'KonsultanPajakKu | Jasa Konsultan Pajak & Akuntansi Jakarta',
        metaDescription:
          'Firma konsultan pajak & akuntansi bersertifikat USKP di Jakarta, dipercaya 150+ klien korporat sejak 2015. Konsultasi gratis, respon cepat via WhatsApp.',
      },
      1,
      'cp'
    ),
    page(
      {
        pageName: 'Tentang Kami',
        pageSlug: '/tentang-kami',
        pageType: 'About',
        pagePurpose:
          'Membangun kepercayaan mendalam dengan menceritakan sejarah pendirian firma sejak 2015, visi-misi, struktur tim konsultan bersertifikat, serta sertifikasi dan keanggotaan asosiasi profesi yang dimiliki.',
        keySections: [
          'Hero Header "Tentang KonsultanPajakKu"',
          'Cerita & Sejarah Perusahaan Sejak 2015',
          'Visi & Misi',
          'Profil Tim Konsultan & Akuntan Bersertifikat',
          'Sertifikasi USKP, Izin DJP, dan Keanggotaan IKPI',
          'Kantor Pusat SCBD & Cabang Surabaya',
        ],
        isInMainNav: true,
        metaTitle: 'Tentang Kami - Sejarah & Tim Konsultan Pajak Bersertifikat',
        metaDescription:
          'Kenali sejarah, visi misi, dan tim 24 konsultan pajak & akuntan publik bersertifikat USKP di balik KonsultanPajakKu sejak 2015.',
      },
      2,
      'cp'
    ),
    page(
      {
        pageName: 'Layanan & Solusi',
        pageSlug: '/layanan',
        pageType: 'Services',
        pagePurpose:
          'Menjelaskan secara komprehensif 5 lini layanan utama lengkap dengan proses kerja dan FAQ agar calon klien memahami cakupan dan value setiap layanan sebelum konsultasi.',
        keySections: [
          'Hero Header Layanan',
          'Daftar Layanan Detail: Pelaporan SPT, Audit Internal, Tax Planning, Pendampingan Pemeriksaan Pajak, Jasa Pembukuan',
          'Proses Kerja 4 Tahap (Konsultasi - Analisis - Eksekusi - Laporan)',
          'FAQ Seputar Layanan Pajak Korporat',
          'CTA Konsultasi Gratis',
        ],
        isInMainNav: true,
        metaTitle: 'Layanan Konsultan Pajak: SPT, Audit, Tax Planning',
        metaDescription:
          'Layanan lengkap pelaporan SPT, audit internal, tax planning, dan pendampingan pemeriksaan pajak untuk perusahaan korporat & UMKM naik kelas.',
      },
      3,
      'cp'
    ),
    page(
      {
        pageName: 'Portofolio & Proyek',
        pageSlug: '/portofolio',
        pageType: 'Portfolio',
        pagePurpose:
          'Menampilkan studi kasus nyata (teranonimisasi) hasil penanganan pajak untuk berbagai sektor, memperkuat bukti kredibilitas dengan angka hasil konkret seperti penghematan pajak dan restitusi.',
        keySections: [
          'Filter Kategori Studi Kasus per Sektor Industri',
          'Grid Card Studi Kasus dengan Modal Detail',
          'Highlight Studi Kasus Restitusi Rp3,2 Miliar',
          'Statistik Hasil: Rata-rata Efisiensi Pajak 25-40%',
        ],
        isInMainNav: true,
        metaTitle: 'Studi Kasus & Portofolio Penanganan Pajak Korporat',
        metaDescription:
          'Lihat studi kasus nyata penanganan pajak, audit, dan restitusi hingga Rp3,2 miliar yang berhasil kami tangani untuk klien korporat berbagai sektor.',
      },
      4,
      'cp'
    ),
    page(
      {
        pageName: 'Blog & Berita',
        pageSlug: '/blog',
        pageType: 'Blog List',
        pagePurpose:
          'Pusat artikel edukasi pajak berkala (regulasi terbaru, tips efisiensi pajak, perubahan UU) untuk membangun otoritas SEO dan menjawab pertanyaan awal calon klien sebelum menghubungi tim.',
        keySections: [
          'Featured Article Hero',
          'Grid Artikel Terbaru dengan Pagination',
          'Widget Kategori (Regulasi, Tips Pajak, Studi Kasus)',
          'Newsletter Signup Box',
        ],
        isInMainNav: true,
        metaTitle: 'Blog Pajak: Regulasi Terbaru & Tips Efisiensi Pajak',
        metaDescription:
          'Artikel edukasi seputar regulasi pajak terbaru, tips efisiensi pajak legal, dan wawasan akuntansi dari tim konsultan bersertifikat KonsultanPajakKu.',
      },
      5,
      'cp'
    ),
    page(
      {
        pageName: 'Hubungi Kami',
        pageSlug: '/kontak',
        pageType: 'Contact',
        pagePurpose:
          'Memudahkan calon klien menjadwalkan konsultasi gratis melalui formulir terstruktur, WhatsApp langsung, atau kunjungan ke kantor, lengkap dengan info lokasi kedua kantor.',
        keySections: [
          'Formulir Konsultasi dengan Dropdown Jenis Kebutuhan',
          'Info Kontak (Telp, WA, Email) Kantor Jakarta & Surabaya',
          'Embedded Google Maps Kedua Kantor',
          'Jam Operasional & Estimasi Respon',
        ],
        isInMainNav: true,
        metaTitle: 'Hubungi Kami - Konsultasi Pajak Gratis Jakarta & Surabaya',
        metaDescription:
          'Jadwalkan konsultasi pajak gratis dengan tim kami di Jakarta (SCBD) atau Surabaya. Respon cepat via WhatsApp dalam 1x24 jam kerja.',
      },
      6,
      'cp'
    ),
  ],

  sharedLayout: {
    navbarStyle: 'Sticky',
    footerColumns: 3,
    hasWhatsAppFloatButton: true,
    hasStickyCTABar: true,
    hasNewsletterForm: true,
  },

  targetPlatform: 'Google AI Studio',

  primaryColor: 'Corporate Blue (#1E3A8A) & Accent Gold (#D4AF37)',
  colorTone: 'Corporate Professional',
  typographyPairing: 'Plus Jakarta Sans (Body) + Playfair Display (Heading)',
  designThemeId: 'modern-minimalist',
  contentLanguage: 'Indonesian',
  specialRequirements:
    'Integrasi tombol WhatsApp floating di setiap halaman dengan pesan template otomatis berbeda per halaman, formulir konsultasi dengan validasi & dropdown jenis kebutuhan (Pajak Korporat/UMKM/Audit), badge sertifikasi USKP dan keanggotaan IKPI di header/footer, desain sepenuhnya responsif mobile karena 60% traffic diperkirakan dari HP, waktu muat halaman di bawah 2 detik, skema warna biru korporat yang menimbulkan rasa terpercaya dan profesional, serta struktur konten yang SEO-friendly untuk kata kunci seperti "konsultan pajak jakarta" dan "jasa audit pajak korporat".',

  aiMode: 'manual',
};

// ============================================================
// 2. E-COMMERCE / KATALOG PRODUK — "Batik Nusantara Kriya"
// ============================================================
const ECOMMERCE_SAMPLE: ProjectFormState = {
  projectName: 'Batik Nusantara Kriya',
  businessType: 'UMKM Fashion & Kerajinan Batik Tulis, Cap, dan Kombinasi (Produsen + Reseller)',
  websiteType: 'E-Commerce / Catalog',
  targetAudience:
    'Wanita karier usia 28-50 tahun di kota besar yang mencari batik otentik untuk acara kantor/formal, ibu-ibu yang mencari seragam batik untuk acara keluarga/sekolah, kolektor batik, serta wisatawan domestik dan diaspora Indonesia di luar negeri yang mencari oleh-oleh batik asli via online.',
  rawBrief:
    'Batik Nusantara Kriya adalah UMKM yang berdiri sejak 2018 di Pekalongan, memproduksi dan menjual batik tulis asli, batik cap, serta batik kombinasi dari lebih dari 40 pengrajin lokal binaan kami di Pekalongan dan Solo. Kami memiliki lebih dari 85 varian produk aktif meliputi kemeja pria, dress wanita, kain panjang, selendang, hingga seragam batik custom untuk instansi/sekolah, dengan rentang harga Rp150.000 - Rp1.500.000 tergantung teknik dan bahan (katun primisima, sutra, dan ATBM). Produk kami sudah bersertifikat SNI Batik dan pernah meraih Juara 2 UMKM Unggulan Jawa Tengah 2022. Saat ini penjualan kami masih mengandalkan marketplace (Shopee, Tokopedia) dan Instagram, namun kami ingin punya website katalog sendiri agar terlihat lebih profesional dan tidak terikat komisi marketplace, dengan sistem pemesanan yang simpel: pelanggan melihat katalog lengkap di website, memilih produk, lalu langsung chat WhatsApp untuk konfirmasi ukuran/stok dan pembayaran (transfer/QRIS), tanpa perlu sistem keranjang belanja & checkout online yang rumit karena target pasar kami masih lebih nyaman bertransaksi via chat personal. Kami juga ingin menampilkan testimoni asli pelanggan lengkap dengan foto produk yang sudah diterima untuk membangun kepercayaan, serta panduan cara pemesanan yang jelas untuk pembeli baru yang belum familiar dengan cara belanja UMKM online.',
  goalWebsite:
    'Meningkatkan penjualan online sebesar 30% dalam 6 bulan dengan mengurangi ketergantungan pada komisi marketplace, membangun citra merek yang lebih profesional, dan mempermudah calon pembeli memesan langsung via WhatsApp tanpa proses checkout yang rumit',
  primaryCTA: 'Pesan via WhatsApp',
  logoUrl: '',
  faviconUrl: '',

  pages: [
    page(
      {
        pageName: 'Beranda (Home)',
        pageSlug: '/',
        pageType: 'Home',
        pagePurpose:
          'Etalase utama yang langsung menampilkan produk terlaris, promo aktif, kategori populer, dan bukti kepercayaan (sertifikasi SNI, penghargaan UMKM) agar pengunjung baru langsung tertarik menjelajahi katalog.',
        keySections: [
          'Hero Promo Slider (Koleksi Terbaru & Diskon)',
          'Grid Kategori Produk (Kemeja, Dress, Kain, Seragam Custom)',
          'Produk Unggulan & Best Seller',
          'Badge Kepercayaan (Sertifikat SNI, Juara UMKM Jateng 2022)',
          'Testimoni Pembeli dengan Foto Produk Asli',
          'Cara Pesan Singkat 3 Langkah',
        ],
        isInMainNav: true,
        metaTitle: 'Batik Nusantara Kriya | Batik Tulis & Cap Asli Pekalongan',
        metaDescription:
          'Belanja batik tulis, cap, dan kombinasi asli Pekalongan langsung dari pengrajin. Bersertifikat SNI, 85+ pilihan motif, pesan mudah via WhatsApp.',
      },
      1,
      'ecom'
    ),
    page(
      {
        pageName: 'Katalog Produk',
        pageSlug: '/katalog',
        pageType: 'Services',
        pagePurpose:
          'Menampilkan seluruh 85+ produk aktif dengan filter jenis batik, kategori, dan rentang harga agar pengunjung dapat menemukan produk yang sesuai kebutuhan dengan cepat sebelum memesan via WhatsApp.',
        keySections: [
          'Sidebar Filter Jenis Batik, Kategori & Rentang Harga',
          'Grid Card Produk dengan Harga & Badge Stok',
          'Pengurutan (Terbaru, Terlaris, Harga)',
          'Quick View Modal Detail Produk',
          'Paging Katalog',
        ],
        isInMainNav: true,
        metaTitle: 'Katalog Produk Batik Tulis, Cap & Kombinasi Lengkap',
        metaDescription:
          'Jelajahi 85+ koleksi batik tulis, cap, dan kombinasi asli dengan filter jenis, kategori, dan harga. Kemeja, dress, kain, hingga seragam custom.',
      },
      2,
      'ecom'
    ),
    page(
      {
        pageName: 'Detail Produk',
        pageSlug: '/produk/:slug',
        pageType: 'Service Detail',
        pagePurpose:
          'Meyakinkan calon pembeli dengan informasi lengkap satu produk spesifik (foto multi-angle, bahan, ukuran tersedia, harga) dan mendorong mereka langsung memesan via WhatsApp dengan konteks produk yang sudah terisi otomatis.',
        keySections: [
          'Galeri Foto Produk Multi-angle dengan Zoom',
          'Informasi Harga, Bahan (Katun Primisima/Sutra/ATBM), dan Stok',
          'Pilihan Ukuran & Varian Warna',
          'Deskripsi Motif & Cerita Filosofi Batik',
          'Tombol "Pesan via WhatsApp" dengan Kode Produk Otomatis',
          'Rekomendasi Produk Terkait',
        ],
        isInMainNav: false,
        metaTitle: 'Detail Produk Batik - Bahan, Ukuran & Harga Lengkap',
        metaDescription:
          'Lihat detail lengkap motif, bahan, ukuran, dan harga produk batik pilihan Anda, lalu pesan langsung via WhatsApp dengan mudah dan cepat.',
      },
      3,
      'ecom'
    ),
    page(
      {
        pageName: 'Cara Pemesanan',
        pageSlug: '/cara-pemesanan',
        pageType: 'FAQ',
        pagePurpose:
          'Memandu pembeli baru yang belum familiar dengan alur belanja UMKM online, menjelaskan langkah demi langkah dari memilih produk hingga barang diterima, termasuk metode pembayaran dan opsi pengiriman.',
        keySections: [
          'Timeline 5 Langkah Pemesanan (Pilih - Chat WA - Konfirmasi - Bayar - Kirim)',
          'Metode Pembayaran (Transfer Bank & QRIS)',
          'Opsi Ekspedisi & Estimasi Ongkir',
          'FAQ Seputar Pembelian & Retur',
        ],
        isInMainNav: true,
        metaTitle: 'Cara Pemesanan Batik - Panduan Lengkap Belanja',
        metaDescription:
          'Panduan lengkap 5 langkah memesan batik di Batik Nusantara Kriya, mulai dari memilih produk, konfirmasi via WhatsApp, hingga pembayaran dan pengiriman.',
      },
      4,
      'ecom'
    ),
    page(
      {
        pageName: 'Testimoni & Galeri Pembeli',
        pageSlug: '/testimoni',
        pageType: 'Testimonials',
        pagePurpose:
          'Memperkuat kepercayaan calon pembeli baru dengan menampilkan ulasan asli dan foto nyata dari pelanggan yang sudah menerima produk, sekaligus membuka kanal bagi pembeli untuk mengirim ulasan mereka sendiri.',
        keySections: [
          'Ulasan Bintang & Rating Rata-rata',
          'Galeri Foto Produk dari Pelanggan Asli',
          'Testimoni Video (jika ada)',
          'Formulir Kirim Ulasan & Foto',
        ],
        isInMainNav: true,
        metaTitle: 'Testimoni Pelanggan - Ulasan & Foto Produk Asli',
        metaDescription:
          'Baca ulasan jujur dan lihat galeri foto produk asli dari pelanggan Batik Nusantara Kriya yang sudah merasakan kualitas batik kami.',
      },
      5,
      'ecom'
    ),
    page(
      {
        pageName: 'Kontak & CS Online',
        pageSlug: '/kontak',
        pageType: 'Contact',
        pagePurpose:
          'Menyediakan kanal bantuan cepat untuk pertanyaan seputar produk, pemesanan custom/partai besar (seragam), dan informasi lokasi workshop/gudang bagi yang ingin berkunjung langsung.',
        keySections: [
          'Daftar Tim CS WhatsApp Aktif per Jam Operasional',
          'Peta Lokasi Workshop & Gudang Pekalongan',
          'Form Pertanyaan Khusus (Pesanan Custom/Partai Besar)',
          'FAQ Kontak Cepat',
        ],
        isInMainNav: true,
        metaTitle: 'Hubungi Kami - CS Batik Nusantara Kriya',
        metaDescription:
          'Hubungi tim CS kami via WhatsApp untuk pertanyaan produk, pesanan custom seragam batik partai besar, atau kunjungi workshop kami di Pekalongan.',
      },
      6,
      'ecom'
    ),
  ],

  sharedLayout: {
    navbarStyle: 'Standard',
    footerColumns: 4,
    hasWhatsAppFloatButton: true,
    hasStickyCTABar: true,
    hasNewsletterForm: false,
  },

  targetPlatform: 'Google AI Studio',

  primaryColor: 'Earthy Brown (#7B3F00) & Warm Cream (#F5E6CA)',
  colorTone: 'Warm & Traditional Elegant',
  typographyPairing: 'Poppins (Body) + Cormorant Garamond (Heading)',
  designThemeId: 'editorial-elegant',
  contentLanguage: 'Indonesian',
  specialRequirements:
    'Galeri foto produk multi-angle dengan fitur zoom agar detail motif batik terlihat jelas, badge "Batik Tulis Asli" / "Bersertifikat SNI" / "Stok Terbatas" pada kartu produk, filter katalog berdasarkan jenis batik (tulis/cap/kombinasi), kategori (kemeja/dress/kain/seragam), dan rentang harga, tombol "Pesan via WhatsApp" yang otomatis mengisi pesan dengan nama & kode produk yang dipilih, serta desain yang menonjolkan warna dan tekstur kain batik secara elegan.',

  aiMode: 'manual',
};

// ============================================================
// 3. SAAS / APLIKASI WEB — "KasirCerdas"
// ============================================================
const SAAS_SAMPLE: ProjectFormState = {
  projectName: 'KasirCerdas',
  businessType: 'SaaS Aplikasi Kasir Digital (POS), Manajemen Stok, dan Laporan Keuangan Berbasis Cloud',
  websiteType: 'SaaS / Service App',
  targetAudience:
    'Pemilik UMKM retail, kafe, dan restoran dengan 1-10 outlet di kota-kota besar Indonesia yang masih mencatat transaksi manual/pakai buku dan ingin beralih ke sistem digital terintegrasi tanpa perlu keahlian teknis, serta tim finance UMKM yang butuh laporan otomatis untuk pengambilan keputusan.',
  rawBrief:
    'KasirCerdas adalah aplikasi SaaS kasir digital (Point of Sales) berbasis cloud yang diluncurkan tahun 2021, saat ini digunakan oleh lebih dari 3.200 outlet aktif di seluruh Indonesia mulai dari warung kopi, restoran, minimarket, hingga toko retail multi-cabang. Aplikasi kami membantu pemilik usaha mencatat transaksi penjualan, mengelola stok barang secara real-time, memantau performa multi-outlet dari satu dashboard, serta menghasilkan laporan keuangan otomatis (laba rugi, arus kas sederhana) tanpa perlu keahlian akuntansi. Fitur unggulan kami meliputi integrasi pembayaran QRIS dan e-wallet, mode offline yang tetap bisa mencatat transaksi saat koneksi internet terputus, manajemen resep/bahan baku untuk bisnis F&B, serta API terbuka untuk integrasi dengan aplikasi akuntansi pihak ketiga. Kami sudah tersertifikasi ISO 27001 untuk keamanan data dan diproses menggunakan enkripsi end-to-end. Saat ini website kami masih sangat sederhana (satu halaman statis) sehingga sulit menjelaskan detail fitur, tidak ada halaman harga yang jelas, dan tidak ada jalur khusus bagi calon pelanggan enterprise (multi-outlet 10+) untuk request demo personal dengan tim sales. Kami butuh landing page yang persuasif dan modern untuk mengonversi pengunjung menjadi pengguna trial gratis 14 hari, halaman fitur lengkap yang menjelaskan seluruh modul secara mendalam, halaman harga berlangganan dengan 3 paket (Starter, Pro, Enterprise) dalam skema bulanan/tahunan, pusat bantuan/FAQ untuk pengguna existing yang butuh panduan cepat, dan halaman booking demo terjadwal khusus untuk calon pelanggan skala enterprise.',
  goalWebsite:
    'Meningkatkan pendaftaran trial gratis sebesar 50% dan booking demo enterprise sebesar 25% dalam 3 bulan setelah peluncuran website baru, sekaligus menurunkan beban tim support dengan pusat bantuan mandiri yang lengkap',
  primaryCTA: 'Coba Gratis 14 Hari',
  logoUrl: '',
  faviconUrl: '',

  pages: [
    page(
      {
        pageName: 'Home / Landing Page',
        pageSlug: '/',
        pageType: 'Home',
        pagePurpose:
          'Mengonversi pengunjung (pemilik UMKM yang masih manual) menjadi pendaftar trial gratis dalam waktu singkat, dengan menunjukkan mockup aplikasi, bukti sosial (3.200+ outlet aktif), dan kalkulator penghematan yang membuat manfaat terasa konkret.',
        keySections: [
          'Hero Showcase Dashboard Aplikasi + Video Demo Singkat',
          'Logo & Jumlah Pengguna Aktif (3.200+ Outlet)',
          'Fitur Utama dengan Mockup Layar (Kasir, Stok, Laporan, QRIS)',
          'Kalkulator Estimasi Penghematan Waktu & Biaya',
          'Testimoni Pemilik Usaha F&B & Retail',
          'Badge Keamanan ISO 27001',
          'CTA Daftar Trial Gratis 14 Hari',
        ],
        isInMainNav: true,
        metaTitle: 'KasirCerdas | Aplikasi Kasir Digital & POS Cloud UMKM',
        metaDescription:
          'Aplikasi kasir digital berbasis cloud dipercaya 3.200+ outlet di Indonesia. Kelola transaksi, stok, dan laporan keuangan real-time. Coba gratis 14 hari.',
      },
      1,
      'saas'
    ),
    page(
      {
        pageName: 'Fitur Lengkap',
        pageSlug: '/fitur',
        pageType: 'Services',
        pagePurpose:
          'Menjelaskan secara mendalam setiap modul aplikasi (kasir, manajemen stok, laporan, integrasi pembayaran, mode offline) agar calon pengguna yang lebih teknis/skeptis mendapat kejelasan sebelum mendaftar trial.',
        keySections: [
          'Breakdown Modul: Kasir, Manajemen Stok, Multi-Outlet, Laporan Keuangan',
          'Tabel Perbandingan Fitur per Jenis Usaha (Retail vs F&B)',
          'Integrasi Pembayaran QRIS, E-Wallet & API Akuntansi',
          'Mode Offline Anti Gangguan Internet',
          'Keamanan Data & Sertifikasi ISO 27001',
        ],
        isInMainNav: true,
        metaTitle: 'Fitur Lengkap KasirCerdas: Kasir, Stok & Laporan',
        metaDescription:
          'Jelajahi fitur lengkap KasirCerdas mulai dari kasir digital, manajemen stok real-time, laporan keuangan otomatis, hingga integrasi QRIS dan mode offline.',
      },
      2,
      'saas'
    ),
    page(
      {
        pageName: 'Harga & Paket',
        pageSlug: '/harga',
        pageType: 'Pricing',
        pagePurpose:
          'Menyajikan skema harga berlangganan secara transparan dengan 3 tingkatan paket agar calon pelanggan dari berbagai skala usaha (warung tunggal hingga retail multi-cabang) dapat memilih paket yang sesuai tanpa perlu bertanya ke sales.',
        keySections: [
          'Toggle Perbandingan Harga Bulanan vs Tahunan (Diskon 20%)',
          'Tabel Kartu Harga 3 Paket (Starter, Pro, Enterprise)',
          'Matriks Perbandingan Fitur Detail per Paket',
          'FAQ Pembayaran & Kebijakan Refund',
        ],
        isInMainNav: true,
        metaTitle: 'Harga & Paket Berlangganan KasirCerdas',
        metaDescription:
          'Pilih paket berlangganan KasirCerdas mulai dari Starter hingga Enterprise dengan diskon 20% untuk pembayaran tahunan. Bandingkan fitur tiap paket di sini.',
      },
      3,
      'saas'
    ),
    page(
      {
        pageName: 'Pusat Bantuan & Dokumen',
        pageSlug: '/bantuan',
        pageType: 'FAQ',
        pagePurpose:
          'Menjadi pusat swadaya bagi pengguna existing dan calon pengguna untuk mencari jawaban cepat seputar penggunaan aplikasi, sehingga mengurangi volume tiket support yang masuk ke tim CS.',
        keySections: [
          'Pencarian Topik Bantuan',
          'Accordion FAQ per Kategori (Instalasi, Kasir, Stok, Pembayaran)',
          'Link Panduan Cepat & Video Tutorial',
          'Form Tiket Bantuan untuk Kendala Teknis',
        ],
        isInMainNav: true,
        metaTitle: 'Pusat Bantuan KasirCerdas - FAQ & Panduan Penggunaan',
        metaDescription:
          'Temukan jawaban cepat seputar penggunaan KasirCerdas melalui FAQ, panduan langkah demi langkah, dan video tutorial, atau ajukan tiket bantuan langsung.',
      },
      4,
      'saas'
    ),
    page(
      {
        pageName: 'Kontak Sales & Demo',
        pageSlug: '/demo',
        pageType: 'Contact',
        pagePurpose:
          'Menjaring calon pelanggan skala enterprise (multi-outlet besar) yang butuh sesi demo personal dan negosiasi kebutuhan khusus sebelum berlangganan paket Enterprise.',
        keySections: [
          'Formulir Booking Demo dengan Pilihan Tanggal & Jam',
          'Manfaat Sesi Demo Personal (30 Menit dengan Tim Sales)',
          'Ulasan Pengguna Enterprise Multi-Outlet',
          'Kontak Langsung Tim Sales Enterprise',
        ],
        isInMainNav: true,
        metaTitle: 'Booking Demo KasirCerdas untuk Bisnis Enterprise',
        metaDescription:
          'Jadwalkan sesi demo personal 30 menit dengan tim sales KasirCerdas untuk kebutuhan multi-outlet skala enterprise. Konsultasi gratis tanpa komitmen.',
      },
      5,
      'saas'
    ),
  ],

  sharedLayout: {
    navbarStyle: 'Sticky',
    footerColumns: 4,
    hasWhatsAppFloatButton: false,
    hasStickyCTABar: true,
    hasNewsletterForm: true,
  },

  targetPlatform: 'Google AI Studio',

  primaryColor: 'Tech Indigo (#4338CA) & Accent Lime (#A3E635)',
  colorTone: 'Modern Tech & Trustworthy',
  typographyPairing: 'Inter (Body) + Space Grotesk (Heading)',
  designThemeId: 'bento-grid',
  contentLanguage: 'Indonesian',
  specialRequirements:
    'Tampilkan mockup dashboard aplikasi & video demo singkat di hero section, badge "Terintegrasi QRIS" dan "Tersertifikasi ISO 27001" untuk membangun kepercayaan keamanan data, tabel perbandingan 3 paket harga yang jelas dengan toggle bulanan/tahunan (diskon 20% untuk tahunan), kalkulator estimasi penghematan waktu/biaya di halaman utama, dan formulir booking demo dengan pilihan tanggal & jam yang terintegrasi kalender.',

  aiMode: 'manual',
};

// ============================================================
// Export gabungan — dipakai untuk pilihan kategori di UI
// ============================================================
export const SAMPLE_PROJECTS: SampleProjectMeta[] = [
  {
    id: 'company-profile',
    label: 'Company Profile Standar',
    shortDescription: 'Firma konsultan pajak & akuntansi bersertifikat (KonsultanPajakKu)',
    data: COMPANY_PROFILE_SAMPLE,
  },
  {
    id: 'ecommerce-catalog',
    label: 'E-Commerce / Katalog Produk',
    shortDescription: 'Toko batik online dengan pemesanan via WhatsApp (Batik Nusantara Kriya)',
    data: ECOMMERCE_SAMPLE,
  },
  {
    id: 'saas-app',
    label: 'SaaS / Aplikasi Web',
    shortDescription: 'Aplikasi kasir digital berbasis cloud untuk UMKM (KasirCerdas)',
    data: SAAS_SAMPLE,
  },
];

// Tetap sediakan SAMPLE_PROJECT (default = Company Profile) supaya kode lama yang masih
// mengimpor SAMPLE_PROJECT langsung (kalau ada) tidak error.
export const SAMPLE_PROJECT: ProjectFormState = COMPANY_PROFILE_SAMPLE;

