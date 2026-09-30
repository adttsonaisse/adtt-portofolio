import type { Locale } from '../types/i18n';

export interface Messages {
	header: {
		home: string;
		about: string;
		service: string;
		portfolio: string;
		contact: string;
		getInTouch: string;
	};
	nav: {
		language: string;
		skip: string;
		english: string;
		indonesian: string;
		currentLanguage: string;
	};
	meta: {
		title: string;
		description: string;
	};
	hero: {
		greeting: string;
		role: string;
		intro: string;
		cta: string;
		followMe: string;
		monogram: string;
		software: string;
		engineer: string;
		craft: string;
	};
	about: {
		label: string;
		title: string;
		subtitle: string;
		bio: string[];
		cta: string;
		github: string;
		decorative: string;
		flipHint: string;
		status: string;
		statusDetail: string;
	};
	skills: {
		label: string;
		title: string;
		description: string;
		devLabel: string;
		ariaFrontend: string;
		ariaBackend: string;
		ariaTooling: string;
	};
	projects: {
		label: string;
		title: string;
		instruction: string;
		hint: string;
		prev: string;
		next: string;
		github: string;
		live: string;
		noRepo: string;
		noLive: string;
		empty: string;
		featured: string;
	};
	contact: {
		label: string;
		heading: string;
		subheading: string;
		pitch: string;
		cta: string;
		copied: string;
	};
	experience: {
		label: string;
		all: string;
		project: string;
		prestasi: string;
		title: string;
		subtitle: string;
		emptyCta: string;
		item: string;
		hint: string;
		hoverHint: string;
	};
	splash: {
		brand: string;
		credit: string;
		atelier: string;
		location: string;
		loading: string;
		skip: string;
		phases: string[];
	};
	footer: {
		credit: string;
	};
	themeToggle: {
		ariaDark: string;
		ariaLight: string;
		titleToLight: string;
		titleToDark: string;
	};
}

export const messages: Record<Locale, Messages> = {
	en: {
		header: {
			home: 'Home',
			about: 'About Me',
			service: 'Services',
			portfolio: 'Portfolio',
			contact: 'Contact',
			getInTouch: 'Get in touch',
		},
		nav: {
			language: 'Language',
			skip: 'Skip to content',
			english: 'English',
			indonesian: 'Indonesian',
			currentLanguage: 'Current language',
		},
		meta: {
			title: 'Aditya Nurdiansyah — Software Engineer',
			description:
				'Portfolio of Aditya Nurdiansyah, Software engineer crafting polished digital experiences.',
		},
		hero: {
			greeting: "I'M",
			role: 'Software engineer crafting polished digital experiences.',
			intro: "Hello, I'm Aditya, a software engineer blending thoughtful design with fast, reliable engineering.",
			cta: "Let's Discuss",
			followMe: 'Follow Me',
			monogram: 'Developer',
			software: 'SOFTWARE',
			engineer: 'ENGINEER',
			craft: 'CRAFT',
		},
		about: {
			label: 'ABOUT',
			title: 'Aditya Nurdiansyah',
			subtitle: 'Software Engineer',
			bio: [
				"I'm Aditya, A Software Engineer who likes turning ideas into ready to use product, fast, and well made.",
				"I care about the details, how an interface feels, how a system holds up, and how everything comes together as one product.",
				"I'm always looking for better ways to solve problems, simplify complexity, and turn rough ideas into something people can actually use.",
			],
			cta: 'Work with me',
			github: 'GitHub',
			decorative: 'ADITYA',
			flipHint: 'Tap to flip',
			status: 'Open for work',
			statusDetail: 'Jakarta, ID · replies < 24h',
		},
		skills: {
			label: 'Services',
			title: 'What I Build',
			description:
				'Building reliable digital products from interface to infrastructure focused on clean architecture, performance, and a great user experience.',
			devLabel: '',
			ariaFrontend: 'Frontend Craft logos',
			ariaBackend: 'Backend logos',
			ariaTooling: 'Tooling logos',
		},
		projects: {
			label: 'Portfolio',
			title: 'Projects',
			instruction:
				"A selection of things i've built.",
			hint: 'Drag, swipe, shift+scroll, or use arrow keys to explore.',
			prev: 'Previous project',
			next: 'Next project',
			github: 'GitHub',
			live: 'Live Website',
			noRepo: 'No repo',
			noLive: 'No live',
			empty: 'No links',
			featured: 'Featured',
		},
		contact: {
			label: 'Contact',
			heading: "Let's work",
			subheading: 'together',
			pitch:
				"Have a project in mind? let’s build something worth shipping. Available for freelance work across product, web, and software engineering. usually respond within 24h.",
			cta: 'Get in touch',
			copied: 'Copied ✓',
		},
		experience: {
			label: 'All',
			all: 'All',
			project: 'Project',
			prestasi: 'Achievement',
			title: 'Experience',
			subtitle:
				'Editorial timeline — journeys through projects and milestones. Filter categories preserve original order.',
			emptyCta: 'Add experience entry',
			item: 'item • no sort',
			hint: 'no sorting',
			hoverHint: 'Hover cards for tilt + spotlight',
		},
		splash: {
			brand: 'Maison Aditya — Portfolio N°2',
			credit: 'ADTT©2026',
			atelier: 'Atelier N°2',
			location: 'JKT—ID / V2.0',
			loading: 'Loading experience',
			skip: 'Click to skip',
			phases: ['CUTTING TYPE', 'POURING INDIGO', 'READY'],
		},
		footer: {
			credit: '',
		},
		themeToggle: {
			ariaDark: 'Toggle theme, current dark',
			ariaLight: 'Toggle theme, current light',
			titleToLight: 'Switch to light mode',
			titleToDark: 'Switch to dark mode',
		},
	},
	id: {
		header: {
			home: 'Beranda',
			about: 'Tentang Saya',
			service: 'Layanan',
			portfolio: 'Portofolio',
			contact: 'Kontak',
			getInTouch: 'Hubungi Saya',
		},
		nav: {
			language: 'Bahasa',
			skip: 'Lewati ke konten',
			english: 'Bahasa Inggris',
			indonesian: 'Bahasa Indonesia',
			currentLanguage: 'Bahasa saat ini',
		},
		meta: {
			title: 'Aditya Nurdiansyah — Software Engineer',
			description:
				'Portofolio Aditya Nurdiansyah, Software Engineer yang merancang pengalaman digital yang halus.',
		},
		hero: {
			greeting: "I'M",
			role: 'Software Engineer yang merancang pengalaman digital yang halus.',
			intro: 'Halo, saya Aditya, seorang Software Engineer yang memadukan desain yang matang dengan engineering yang cepat dan andal.',
			cta: 'Mari Berdiskusi',
			followMe: 'Ikuti Saya',
			monogram: 'Developer',
			software: 'SOFTWARE',
			engineer: 'ENGINEER',
			craft: 'CRAFT',
		},
		about: {
			label: 'TENTANG',
			title: 'Aditya Nurdiansyah',
			subtitle: 'Software Engineer',
			bio: [
				'Saya Aditya, seorang Software Engineer yang suka mengubah ide menjadi produk yang siap pakai — cepat dan dibuat dengan baik.',
				'Saya peduli pada detail — bagaimana sebuah antarmuka terasa, bagaimana sebuah sistem bertahan, dan bagaimana semuanya menyatu sebagai satu produk.',
				'Saya selalu mencari cara yang lebih baik untuk menyelesaikan masalah, menyederhanakan kerumitan, dan mengubah ide kasar menjadi sesuatu yang benar-benar bisa dipakai.',
			],
			cta: 'Bekerja sama dengan saya',
			github: 'GitHub',
			decorative: 'ADITYA',
			flipHint: 'Ketuk untuk balik',
			status: 'Terbuka untuk kerja',
			statusDetail: 'Jakarta, ID · balas < 24 jam',
		},
		skills: {
			label: 'Layanan',
			title: 'Yang Saya Bangun',
			description:
				'Membangun produk digital yang andal dari antarmuka hingga infrastruktur — berfokus pada arsitektur yang bersih, performa, dan pengalaman pengguna yang luar biasa.',
			devLabel: '',
			ariaFrontend: 'Logo Frontend',
			ariaBackend: 'Logo Backend',
			ariaTooling: 'Logo Tooling',
		},
		projects: {
			label: 'Portofolio',
			title: 'Proyek',
			instruction: 'Pilihan hal yang pernah saya buat.',
			hint: 'Seret, geser, Shift+scroll, atau gunakan tombol panah untuk menjelajah.',
			prev: 'Proyek sebelumnya',
			next: 'Proyek berikutnya',
			github: 'GitHub',
			live: 'Website Live',
			noRepo: 'Tidak ada repo',
			noLive: 'Tidak ada demo',
			empty: 'Tidak ada tautan',
			featured: 'Unggulan',
		},
		contact: {
			label: 'Kontak',
			heading: 'Mari bekerja',
			subheading: 'bersama',
			pitch:
				'Punya proyek dalam pikiran? Mari bangun sesuatu yang layak diluncurkan. Tersedia untuk pekerjaan freelance di bidang produk, web, dan software engineering. Biasanya membalas dalam 24 jam.',
			cta: 'Hubungi Saya',
			copied: 'Tersalin ✓',
		},
		experience: {
			label: 'Semua',
			all: 'Semua',
			project: 'Proyek',
			prestasi: 'Prestasi',
			title: 'Pengalaman',
			subtitle:
				'Linimasa editorial — perjalanan melalui proyek dan tonggak pencapaian. Filter kategori mempertahankan urutan asli.',
			emptyCta: 'Tambah entri pengalaman',
			item: 'item • tanpa pengurutan',
			hint: 'tanpa pengurutan',
			hoverHint: 'Arahkan kursor ke kartu untuk efek tilt + spotlight',
		},
		splash: {
			brand: 'Maison Aditya — Portofolio N°2',
			credit: 'ADTT©2026',
			atelier: 'Atelier N°2',
			location: 'JKT—ID / V2.0',
			loading: 'Memuat pengalaman',
			skip: 'Klik untuk lewati',
			phases: ['POTONG TIPE', 'TUANG INDIGO', 'SIAP'],
		},
		footer: {
			credit: '',
		},
		themeToggle: {
			ariaDark: 'Alihkan tema, saat ini gelap',
			ariaLight: 'Alihkan tema, saat ini terang',
			titleToLight: 'Ganti ke mode terang',
			titleToDark: 'Ganti ke mode gelap',
		},
	},
};

export const useMessages = (locale: Locale): Messages => messages[locale];
