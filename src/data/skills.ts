import type { Locale } from '../types/i18n';

export type SkillGroup = {
	label: string;
	accent?: boolean;
	skills: string[];
};

/** Fun-fact per skill untuk tooltip playful (draf — koreksi sesukamu). */
export const skillFacts: Record<Locale, Record<string, string>> = {
	en: {
		'Svelte': '3 projects shipped, zero virtual DOM',
		'TypeScript': 'Strict mode everywhere, no any escapes',
		'Tailwind CSS': 'This whole page, utility-first',
		'Vite': 'Cold start under a second',
		'React': 'This portfolio runs on it',
		'Vue': 'First love, still fluent',
		'Laravel': 'APIs with Eloquent charm',
		'Node.js': 'REST + realtime backends',
		'Express JS': 'Lean APIs, fast to ship',
		'REST API': 'Designed, versioned, documented',
		'Golang': '40ms p95 on Nova API',
		'ASP .NET': 'Enterprise-grade services',
		'MySQL': 'Indexed, migrated, backed up',
		'Git / CI': 'Conventional commits + pipelines',
		'Vercel': 'A preview for every push',
		'Testing': 'Vitest, green before merge',
		'Design Systems': 'Tokens, not hex soup',
		'Parallax & Motion': 'GSAP choreography',
	},
	id: {
		'Svelte': '3 proyek rilis, tanpa virtual DOM',
		'TypeScript': 'Strict mode di mana-mana, tanpa any lolos',
		'Tailwind CSS': 'Seluruh halaman ini, utility-first',
		'Vite': 'Cold start di bawah sedetik',
		'React': 'Portofolio ini jalan di atasnya',
		'Vue': 'Cinta pertama, masih fasih',
		'Laravel': 'API dengan pesona Eloquent',
		'Node.js': 'Backend REST + realtime',
		'Express JS': 'API ramping, cepat rilis',
		'REST API': 'Dirancang, berversi, terdokumentasi',
		'Golang': '40ms p95 di Nova API',
		'ASP .NET': 'Layanan kelas enterprise',
		'MySQL': 'Terindeks, termigrasi, terbackup',
		'Git / CI': 'Conventional commits + pipeline',
		'Vercel': 'Preview setiap push',
		'Testing': 'Vitest, hijau sebelum merge',
		'Design Systems': 'Token, bukan sup hex',
		'Parallax & Motion': 'Koreografi GSAP',
	},
};

export const skillGroups: Record<Locale, SkillGroup[]> = {
	en: [
		{
			label: 'Frontend Craft',
			accent: true,
			skills: ['Svelte', 'TypeScript', 'Tailwind CSS', 'Vite', 'React', 'Vue', 'Laravel'],
		},
		{
			label: 'Backend & Systems',
			skills: ['Node.js', 'Express JS', 'REST API', 'Golang', 'ASP .NET', 'MySQL'],
		},
		{
			label: 'Tooling & Delivery',
			skills: ['Git / CI', 'Vercel', 'Testing', 'Design Systems', 'Parallax & Motion'],
		},
	],
	id: [
		{
			label: 'Frontend Craft',
			accent: true,
			skills: ['Svelte', 'TypeScript', 'Tailwind CSS', 'Vite', 'React', 'Vue', 'Laravel'],
		},
		{
			label: 'Backend & Sistem',
			skills: ['Node.js', 'Express JS', 'REST API', 'Golang', 'ASP .NET', 'MySQL'],
		},
		{
			label: 'Tooling & Rilis',
			skills: ['Git / CI', 'Vercel', 'Testing', 'Design Systems', 'Parallax & Motion'],
		},
	],
};
