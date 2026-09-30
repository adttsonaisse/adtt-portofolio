import type { CSSProperties } from 'react';
import LogoLoop from '../ui/LogoLoop';
import { skillFacts, skillGroups } from '../../data/skills';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import {
	SiSvelte,
	SiTypescript,
	SiTailwindcss,
	SiVite,
	SiReact,
	SiVuedotjs,
	SiLaravel,
	SiNodedotjs,
	SiExpress,
	SiGo,
	SiDotnet,
	SiMysql,
	SiGit,
	SiVercel,
	SiFigma,
	SiFramer,
	SiVitest,
	SiPostman,
} from 'react-icons/si';

const iconMap: Record<string, { Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; href: string }> = {
	'Svelte': { Icon: SiSvelte, color: '#FF3E00', href: 'https://svelte.dev' },
	'TypeScript': { Icon: SiTypescript, color: '#3178C6', href: 'https://www.typescriptlang.org' },
	'Tailwind CSS': { Icon: SiTailwindcss, color: '#06B6D4', href: 'https://tailwindcss.com' },
	'Vite': { Icon: SiVite, color: '#646CFF', href: 'https://vitejs.dev' },
	'React': { Icon: SiReact, color: '#61DAFB', href: 'https://react.dev' },
	'Vue': { Icon: SiVuedotjs, color: '#4FC08D', href: 'https://vuejs.org' },
	'Laravel': { Icon: SiLaravel, color: '#FF2D20', href: 'https://laravel.com' },
	'Node.js': { Icon: SiNodedotjs, color: '#339933', href: 'https://nodejs.org' },
	'Express JS': { Icon: SiExpress, color: '#111111', href: 'https://expressjs.com' },
	'REST API': { Icon: SiPostman, color: '#FF6C37', href: 'https://www.postman.com' },
	'Golang': { Icon: SiGo, color: '#00ADD8', href: 'https://go.dev' },
	'ASP .NET': { Icon: SiDotnet, color: '#512BD4', href: 'https://dotnet.microsoft.com' },
	'MySQL': { Icon: SiMysql, color: '#4479A1', href: 'https://www.mysql.com' },
	'Git / CI': { Icon: SiGit, color: '#F05032', href: 'https://git-scm.com' },
	'Vercel': { Icon: SiVercel, color: '#111111', href: 'https://vercel.com' },
	'Testing': { Icon: SiVitest, color: '#6E9F18', href: 'https://vitest.dev' },
	'Design Systems': { Icon: SiFigma, color: '#F24E1E', href: 'https://figma.com' },
	'Parallax & Motion': { Icon: SiFramer, color: '#0055FF', href: 'https://www.framer.com/motion' },
};

function toLogos(skills: string[], facts: Record<string, string>) {
	return skills.map((label) => {
		const entry = iconMap[label];
		if (!entry) return { node: <span className="font-mono text-sm font-bold">{label.slice(0, 2)}</span>, title: label };
		const { Icon, color, href } = entry;
		return {
			node: (
				<span className="skill-logo inline-flex items-center gap-3 bg-transparent md:gap-3.5" style={{ '--brand': color } as CSSProperties} data-fact={facts[label] ?? label}>
					<span className="flex shrink-0 items-center justify-center bg-transparent" style={{ width: 56, height: 56 }}>
						<Icon size={44} />
					</span>
					<span className="font-sans text-[1.1rem] font-black tracking-[-0.03em] md:text-[1.5rem]" style={{ color: 'var(--fg)' }}>
						{label}
					</span>
				</span>
			),
			title: label,
			href,
			ariaLabel: `${label} — ${facts[label] ?? label}`,
		};
	});
}

export default function Skills() {
	const ref = useSectionReveal<HTMLElement>();
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const groups = skillGroups[locale];
	const facts = skillFacts[locale];
	const row1 = toLogos(groups[0].skills, facts);
	const row2 = toLogos(groups[1].skills, facts);
	const row3 = toLogos(groups[2].skills, facts);

	return (
		<section id="skills" ref={ref} data-reveal className="relative py-20 md:py-28" style={{ scrollMarginTop: 80 }}>
			<div className="mx-auto max-w-340 px-4 md:px-6">
				<div className="flex flex-wrap items-end justify-between gap-4" data-reveal-item>
					<div>
						<p className="section-label">
							02 · {m.skills.label}
						</p>
						<h2 className="mt-2 text-[2rem] font-black tracking-[-0.03em] md:text-[2.6rem]" style={{ color: 'var(--fg)' }}>
							{m.skills.title}
						</h2>
						<p className="mt-3 max-w-xl text-sm leading-6" style={{ color: 'var(--fg-muted)' }}>
							{m.skills.description}
						</p>
					</div>
					{m.skills.devLabel ? (
						<p className="hidden font-mono text-xs tracking-[0.08em] md:block" style={{ color: 'var(--fg-muted)', opacity: 0.6 }}>
							{m.skills.devLabel}
						</p>
					) : null}
				</div>

				<div className="mt-10 flex flex-col gap-1" data-reveal-item>
					{/* Kecepatan bervariasi per baris (110 / 85 / 110): ritme,
					    bukan tiga marquee kembar. Arah selang-seling menuntun mata. */}
					<div className="overflow-hidden rounded-2xl bg-transparent py-2">
						<LogoLoop
							logos={row1}
							speed={110}
							direction="left"
							logoHeight={56}
							gap={48}
							hoverSpeed={0}
							scaleOnHover
							ariaLabel={m.skills.ariaFrontend}
						/>
					</div>
					<div className="overflow-hidden rounded-2xl bg-transparent py-2">
						<LogoLoop
							logos={row2}
							speed={85}
							direction="right"
							logoHeight={56}
							gap={48}
							hoverSpeed={0}
							scaleOnHover
							ariaLabel={m.skills.ariaBackend}
						/>
					</div>
					<div className="overflow-hidden rounded-2xl bg-transparent py-2">
						<LogoLoop
							logos={row3}
							speed={110}
							direction="left"
							logoHeight={56}
							gap={48}
							hoverSpeed={0}
							scaleOnHover
							ariaLabel={m.skills.ariaTooling}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
