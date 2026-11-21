import type { Locale } from '../types/i18n';

export type Project = {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	links: { github?: string; live?: string };
	featured?: boolean;
	image?: string;
};

// Educart: taruh screenshot asli di public/projects/educart.png
// (gambar dari chat tidak bisa saya simpan langsung — drop manual).
// Selama file belum ada, galeri Educart tampil kosong.
const IMG = {
	pmr: '/projects/pmr-smekar.webp',
	educart: '/projects/educart.webp',
};

const baseProjects = [
	{
		slug: 'pmr-wira-smekar',
		tags: ['Next.js', 'Tailwind', 'Supabase'],
		links: { github: 'https://github.com/adttsonaisse/pmrwirasmekar', live: 'https://pmrwirasmekar.vercel.app/' },
		featured: true,
		image: IMG.pmr,
		en: {
			title: 'PMR Wira Smekar',
			description: 'School Red Cross org site — articles, events, recruitment.',
		},
		id: {
			title: 'PMR Wira Smekar',
			description: 'Web organisasi PMR sekolah — artikel, kegiatan, pendaftaran.',
		},
	},
	{
		slug: 'educart-ecommerce',
		tags: ['Laravel', 'MySQL', 'Tailwind'],
		links: { github: 'https://github.com/adttsonaisse/project-ecommerce-sekolah' },
		image: IMG.educart,
		en: {
			title: 'Educart E-Commerce',
			description: 'School supply storefront — categories, stock, pre-orders.',
		},
		id: {
			title: 'Educart E-Commerce',
			description: 'Toko perlengkapan sekolah — kategori, stok, pre-order.',
		},
	},
] as const;

export const projects: Record<Locale, Project[]> = {
	en: baseProjects.map((p): Project => ({
		slug: p.slug,
		title: p.en.title,
		description: p.en.description,
		tags: [...p.tags],
		links: { ...p.links },
		featured: 'featured' in p ? true : undefined,
		image: p.image,
	})),
	id: baseProjects.map((p): Project => ({
		slug: p.slug,
		title: p.id.title,
		description: p.id.description,
		tags: [...p.tags],
		links: { ...p.links },
		featured: 'featured' in p ? true : undefined,
		image: p.image,
	})),
};

export const featuredProjects = (locale: Locale) => projects[locale].filter((p) => p.featured);
