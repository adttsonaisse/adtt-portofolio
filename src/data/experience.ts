import type { Locale } from '../types/i18n';

export type Cat = 'Project' | 'Prestasi';

export type Experience = {
	company: string;
	role: string;
	period: string;
	desc: string;
	tags: string[];
	cat: Cat;
	year: number;
};

const baseItems = [
	{
		company: 'Freelance — UMKM',
		period: '2024 — Sekarang',
		desc_en: 'Engineer reliable software for local businesses — pragmatic architecture, type-safe stacks, and WCAG AA delivery.',
		desc_id: 'Bikin software yang bisa diandelin buat bisnis lokal — arsitektur simpel, stack type-safe, dan standar WCAG AA.',
		tags: ['TypeScript', 'SvelteKit', 'PostgreSQL'],
		cat: 'Project' as Cat,
		year: 2024,
		role_en: 'Software Engineer',
		role_id: 'Software Engineer',
	},
	{
		company: 'SMK — Project Sekolah',
		period: 'Agu 2026',
		desc_en: 'Online cafeteria e-commerce system: real-time transactions, stock management & daily reports for students & canteen.',
		desc_id: 'Sistem jual-beli kantin online sekolah: transaksi real-time, kelola stok & laporan harian buat siswa & kantin.',
		tags: ['Laravel', 'React', 'Tailwind', 'MySQL'],
		cat: 'Project' as Cat,
		year: 2026,
		role_en: 'E-Commerce / Kantin Online',
		role_id: 'E-Commerce / Kantin Online',
	},
	{
		company: 'PMR — Ekstrakurikuler',
		period: '2025',
		desc_en: 'Build CRUD admin dashboard + RBAC for managing members, activities, inventory & documentation archive.',
		desc_id: 'Bikin dashboard admin CRUD + RBAC buat ngatur anggota, kegiatan, inventaris & arsip dokumentasi PMR.',
		tags: ['Laravel', 'React', 'CRUD', 'RBAC'],
		cat: 'Project' as Cat,
		year: 2025,
		role_en: 'PMR Extracurricular Website',
		role_id: 'Website Ekstrakurikuler PMR',
	},
	{
		company: 'Tingkat Kabupaten',
		period: '2026',
		desc_en: '3rd Place Cloud Computing — scalable architecture design & deployment cost optimization.',
		desc_id: 'Juara 3 lomba Cloud Computing — desain arsitektur scalable & optimasi biaya deployment.',
		tags: ['Cloud Computing', 'GCP', 'Docker'],
		cat: 'Prestasi' as Cat,
		year: 2026,
		role_en: '3rd Place — Cloud Computing',
		role_id: 'Juara 3 — Cloud Computing',
	},
	{
		company: 'Tingkat Kabupaten',
		period: '2025',
		desc_en: '2nd Place Cloud Computing — implemented & deployed scalable cloud services reliably.',
		desc_id: 'Juara 2 lomba Cloud Computing — implementasi & deployment layanan cloud yang sat-set.',
		tags: ['Cloud Computing', 'AWS', 'Deployment'],
		cat: 'Prestasi' as Cat,
		year: 2025,
		role_en: '2nd Place — Cloud Computing',
		role_id: 'Juara 2 — Cloud Computing',
	},
	{
		company: 'SMK Rekayasa Perangkat Lunak',
		period: '2022 — 2026',
		desc_en: 'Focus on design systems, web architecture & product craft — exploring modern full-stack.',
		desc_id: 'Fokus ke design system, web architecture & product craft — eksplorasi full-stack modern.',
		tags: ['RPL', 'Web Architecture'],
		cat: 'Project' as Cat,
		year: 2022,
		role_en: 'Computer Science Student',
		role_id: 'Siswa RPL',
	},
] as const;

export const experiences: Record<Locale, Experience[]> = {
	en: baseItems.map((e): Experience => ({
		company: e.company,
		role: e.role_en,
		period: e.period,
		desc: e.desc_en,
		tags: [...e.tags],
		cat: e.cat,
		year: e.year,
	})),
	id: baseItems.map((e): Experience => ({
		company: e.company,
		role: e.role_id,
		period: e.period,
		desc: e.desc_id,
		tags: [...e.tags],
		cat: e.cat,
		year: e.year,
	})),
};

export const featuredExperiences = (locale: Locale) => experiences[locale];
