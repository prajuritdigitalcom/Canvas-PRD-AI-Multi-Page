import { ProjectFormState, PageDefinition } from '../types';
import { PAGE_PRESETS } from './pagePresets';

const companyProfilePreset = PAGE_PRESETS.find((p) => p.id === 'company-profile')!;

const SAMPLE_PAGES: PageDefinition[] = companyProfilePreset.pages.map((p, idx) => ({
  ...p,
  id: 'page-sample-' + idx,
  order: idx + 1,
}));

export const SAMPLE_PROJECT: ProjectFormState = {
  projectName: 'KonsultanPajakKu',
  businessType: 'Jasa Konsultan Pajak & Akuntansi',
  websiteType: 'Company Profile',
  targetAudience:
    'Pemilik UMKM, direktur perusahaan menengah, dan tim finance/HR yang butuh kepatuhan pajak tanpa ribet',
  rawBrief:
    'KonsultanPajakKu adalah firma konsultan pajak & akuntansi berbasis di Jakarta yang telah melayani lebih dari 150 klien korporat sejak 2015. Kami butuh website company profile profesional untuk membangun kepercayaan calon klien korporat, menampilkan portofolio kasus yang pernah ditangani, dan memudahkan calon klien menghubungi tim kami untuk konsultasi gratis. Layanan utama meliputi: pelaporan pajak bulanan/tahunan, audit internal, perencanaan pajak korporat, dan pendampingan pemeriksaan pajak.',
  goalWebsite:
    'Menghasilkan leads konsultasi gratis dari calon klien korporat & membangun kredibilitas sebagai firma pajak terpercaya',
  primaryCTA: 'Konsultasi Gratis via WhatsApp',
  logoUrl: '',
  faviconUrl: '',

  pages: SAMPLE_PAGES,

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
    'Integrasi tombol WhatsApp di setiap halaman, formulir konsultasi dengan validasi, desain sepenuhnya responsif mobile, waktu muat halaman cepat, dan skema warna yang konsisten dengan identitas korporat',

  aiMode: 'manual',
};
