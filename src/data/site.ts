import type { Locale } from '../types/i18n';

interface SiteData {
	name: string;
	shortName: string;
	role: string;
	tagline: string;
	bio: string;
	links: {
		github: string;
		linkedin: string;
		email: string;
	};
}

export const site: Record<Locale, SiteData> = {
	en: {
		name: 'Aditya Nurdiansyah',
		shortName: 'Aditya',
		role: 'Software Engineer',
		tagline: 'Crafting luxury-grade software — precise engineering, enduring systems.',
		bio: 'Software Engineer based in Indonesia. I blend engineering rigor with product craft — clean architecture, type-safe systems, and thoughtful UX to build software that feels expensive, fast, and enduring.',
		links: {
			github: 'https://github.com/adttsonaisse',
			linkedin: 'https://linkedin.com/in/adtt',
			email: 'mailto:muhammadadityanurdiansyahh@gmail.com',
		},
	},
	id: {
		name: 'Aditya Nurdiansyah',
		shortName: 'Aditya',
		role: 'Software Engineer',
		tagline: 'Bikin software kelas mewah — engineering rapi, sistem awet.',
		bio: 'Software Engineer dari Indonesia. Aku nyampur ketelitian engineering sama craft produk — arsitektur bersih, sistem type-safe, dan UX yang dipikirin mateng biar software-nya berasa mahal, sat-set, dan awet.',
		links: {
			github: 'https://github.com/adttsonaisse',
			linkedin: 'https://linkedin.com/in/adtt',
			email: 'mailto:muhammadadityanurdiansyahh@gmail.com',
		},
	},
};
