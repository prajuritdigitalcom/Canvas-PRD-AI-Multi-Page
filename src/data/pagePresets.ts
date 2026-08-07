import { PagePreset } from '../types';

export const PAGE_PRESETS: PagePreset[] = [
  {
    id: 'company-profile',
    name: 'Company Profile Standar (6 Halaman)',
    websiteType: 'Company Profile',
    description: 'Struktur ideal untuk profil perusahaan / bisnis profesional.',
    pages: [
      {
        pageName: 'Home',
        pageSlug: '/',
        pageType: 'Home',
        pagePurpose: 'Halaman utama penarik perhatian, ringkasan nilai tambah, layanan unggulan, dan bukti sosial.',
        keySections: ['Hero Banner with CTA', 'Ringkasan Nilai Tambah', 'Layanan Utama Grid', 'Mengapa Memilih Kami', 'Testimoni & Klien', 'CTA Banner Banner Kontak'],
        isInMainNav: true,
        metaTitle: 'Profil Perusahaan Profesional & Layanan Terbaik',
        metaDescription: 'Solusi terpercaya untuk kebutuhan bisnis Anda. Dapatkan layanan berkualitas tinggi dengan tim profesional berpengalaman.'
      },
      {
        pageName: 'Tentang Kami',
        pageSlug: '/tentang-kami',
        pageType: 'About',
        pagePurpose: 'Menjelaskan profil perusahaan, visi, misi, sejarah singkat, dan tim kepemimpinan.',
        keySections: ['Hero Header Sub-page', 'Cerita & Sejarah Perusahaan', 'Visi & Misi Card', 'Tim Kepemimpinan', 'Sertifikasi & Penghargaan'],
        isInMainNav: true,
        metaTitle: 'Tentang Kami - Visi, Misi & Profil Perusahaan',
        metaDescription: 'Mengenal lebih dekat profil perusahaan kami, perjalanan sejarah, visi misi, serta tim profesional di balik layanan terbaik.'
      },
      {
        pageName: 'Layanan & Solusi',
        pageSlug: '/layanan',
        pageType: 'Services',
        pagePurpose: 'Menampilkan katalog lengkap layanan/produk dengan penjelasan komprehensif.',
        keySections: ['Hero Header Layanan', 'Daftar Layanan Detail Grid', 'Proses Kerja / Methodologi', 'FAQ Layanan', 'CTA Konsultasi Gratis'],
        isInMainNav: true,
        metaTitle: 'Layanan & Solusi Terbaik untuk Bisnis Anda',
        metaDescription: 'Jelajahi berbagai layanan dan solusi komprehensif yang dirancang untuk mempercepat pertumbuhan dan efisiensi bisnis Anda.'
      },
      {
        pageName: 'Portofolio & Proyek',
        pageSlug: '/portofolio',
        pageType: 'Portfolio',
        pagePurpose: 'Showcase hasil kerja nyata, studi kasus, dan galeri proyek yang pernah ditangani.',
        keySections: ['Filter Kategori Proyek', 'Grid Card Proyek dengan Modal/Hover', 'Highlight Studi Kasus Utama', 'Statistik Hasil'],
        isInMainNav: true,
        metaTitle: 'Portofolio Proyek & Studi Kasus Hasil Kerja',
        metaDescription: 'Lihat koleksi portofolio proyek dan studi kasus sukses yang telah kami selesaikan untuk berbagai klien terkemuka.'
      },
      {
        pageName: 'Blog & Berita',
        pageSlug: '/blog',
        pageType: 'Blog List',
        pagePurpose: 'Pusat artikel edukatif, kabar perusahaan, dan wawasan industri untuk SEO.',
        keySections: ['Featured Article Hero', 'Grid Artikel Terbaru dengan Pagination', 'Widget Kategori & Pencarian', 'Newsletter Signup Box'],
        isInMainNav: true,
        metaTitle: 'Blog & Wawasan Industri Terbaru',
        metaDescription: 'Temukan artikel menarik, panduan praktis, serta wawasan industri terbaru dari tim ahli kami.'
      },
      {
        pageName: 'Hubungi Kami',
        pageSlug: '/kontak',
        pageType: 'Contact',
        pagePurpose: 'Halaman kontak lengkap dengan formulir, peta lokasi, alamat kantor, dan saluran komunikasi.',
        keySections: ['Formulir Pesan Interaktif', 'Info Kontak (Telp, WA, Email)', 'Embedded Google Maps / Lokasi', 'Jam Operasional Kantor'],
        isInMainNav: true,
        metaTitle: 'Hubungi Kami - Konsultasi & Lokasi Kantor',
        metaDescription: 'Hubungi tim kami untuk konsultasi gratis atau kunjungi lokasi kantor kami. Kami siap membantu kebutuhan bisnis Anda.'
      }
    ]
  },
  {
    id: 'ecommerce-catalog',
    name: 'E-Commerce / Katalog Produk (6 Halaman)',
    websiteType: 'E-Commerce / Catalog',
    description: 'Struktur khusus katalog produk & toko online dengan sistem konsultasi/WA.',
    pages: [
      {
        pageName: 'Beranda (Home)',
        pageSlug: '/',
        pageType: 'Home',
        pagePurpose: 'Etalase utama produk terlaris, promo terbaru, kategori populer, dan kepercayaan merek.',
        keySections: ['Hero Promo Slider', 'Grid Kategori Produk', 'Produk Unggulan / Flash Sale', 'Keunggulan Belanja', 'Testimoni Pembeli'],
        isInMainNav: true
      },
      {
        pageName: 'Katalog Produk',
        pageSlug: '/katalog',
        pageType: 'Services',
        pagePurpose: 'Daftar seluruh produk dengan filter harga, kategori, dan pencarian cepat.',
        keySections: ['Sidebar Filter & Sortir', 'Grid Card Produk + Harga', 'Paging Katalog', 'Quick View Modal'],
        isInMainNav: true
      },
      {
        pageName: 'Detail Produk',
        pageSlug: '/produk/:slug',
        pageType: 'Service Detail',
        pagePurpose: 'Penjelasan rinci spesifikasi produk, galeri foto, varian, dan tombol beli via WA.',
        keySections: ['Galeri Foto Produk Multi-angle', 'Informasi Harga & Stok', 'Deskripsi & Spesifikasi', 'Tombol Beli Langsung via WhatsApp', 'Rekomendasi Produk Terkait'],
        isInMainNav: false
      },
      {
        pageName: 'Cara Pemesanan',
        pageSlug: '/cara-pemesanan',
        pageType: 'FAQ',
        pagePurpose: 'Panduan langkah demi langkah proses order, metode pembayaran, dan syarat pengiriman.',
        keySections: ['Timeline Langkah Pemesanan', 'Opsi Pembayaran & Ekspedisi', 'FAQ Seputar Pembelian'],
        isInMainNav: true
      },
      {
        pageName: 'Testimoni & Galeri Pembeli',
        pageSlug: '/testimoni',
        pageType: 'Testimonials',
        pagePurpose: 'Ulasan asli dari konsumen beserta bukti kirim dan tangkapan layar kepuasan.',
        keySections: ['Ulasan Bintang & Rating', 'Galeri Foto Konsumen', 'Formulir Kirim Ulasan'],
        isInMainNav: true
      },
      {
        pageName: 'Kontak & CS Online',
        pageSlug: '/kontak',
        pageType: 'Contact',
        pagePurpose: 'Kanal bantuan cepat ke Customer Service dan alamat toko fisik.',
        keySections: ['Daftar Tim CS WA Aktif', 'Peta Alamat Toko/Gudang', 'Form Pertanyaan Khusus'],
        isInMainNav: true
      }
    ]
  },
  {
    id: 'saas-app',
    name: 'SaaS / Aplikasi Web (5 Halaman)',
    websiteType: 'SaaS / Service App',
    description: 'Struktur terarah untuk produk digital, software, dan layanan berbasis langganan.',
    pages: [
      {
        pageName: 'Home / Landing Page',
        pageSlug: '/',
        pageType: 'Home',
        pagePurpose: 'Konversi pengunjung menjadi pengguna gratis / pendaftar demo aplikasi.',
        keySections: ['Hero Showcase Aplikasi + Video Demo', 'Logo Klien / Pengguna', 'Fitur Utama dengan Mockup', 'Kalkulator Penghematan', 'CTA Daftar Gratis'],
        isInMainNav: true
      },
      {
        pageName: 'Fitur Lengkap',
        pageSlug: '/fitur',
        pageType: 'Services',
        pagePurpose: 'Rincian mendalam setiap modul dan teknologi di dalam software.',
        keySections: ['Breakdown Modul Software', 'Tabel Perbandingan Fitur', 'Integrasi API & Platform', 'Keamanan Data'],
        isInMainNav: true
      },
      {
        pageName: 'Harga & Paket',
        pageSlug: '/harga',
        pageType: 'Pricing',
        pagePurpose: 'Tabel langganan transparan (Bulanan/Tahunan) dengan tombol pilih paket.',
        keySections: ['Toggle Bulanan vs Tahunan', 'Tabel Kartu Harga (Starter, Pro, Enterprise)', 'Matriks Perbandingan Fitur', 'FAQ Pembayaran'],
        isInMainNav: true
      },
      {
        pageName: 'Pusat Bantuan & Dokumen',
        pageSlug: '/bantuan',
        pageType: 'FAQ',
        pagePurpose: 'Pusat panduan penggunaan, FAQ umum, dan dokumentasi singkat.',
        keySections: ['Pencarian Topik Bantuan', 'Accordion FAQ per Kategori', 'Link Panduan Cepat', 'Form Tiket Bantuan'],
        isInMainNav: true
      },
      {
        pageName: 'Kontak Sales & Demo',
        pageSlug: '/demo',
        pageType: 'Contact',
        pagePurpose: 'Formulir permintaan sesi demo khusus untuk pengguna bisnis / enterprise.',
        keySections: ['Formulir Booking Demo Schedule', 'Manfaat Sesi Demo', 'Ulasan Pengguna Enterprise'],
        isInMainNav: true
      }
    ]
  }
];
