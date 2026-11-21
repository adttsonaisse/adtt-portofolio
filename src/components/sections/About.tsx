import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { site } from '../../data/site';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import { useMagnet } from '../../hooks/useMagnet';

const Lanyard = lazy(() => import('../Lanyard'));

export default function About() {
	const ref = useSectionReveal<HTMLElement>();
	const ctaRef = useMagnet<HTMLAnchorElement>();
	const lanyardHostRef = useRef<HTMLDivElement>(null);
	const [showLanyard, setShowLanyard] = useState(() =>
		typeof window !== 'undefined' && window.location.hash === '#about',
	);
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const siteData = site[locale];
	// Badge flip: depan = peran, belakang = status ketersediaan.
	const [flipped, setFlipped] = useState(false);

	// Tunda load chunk 3D Lanyard (Three.js + Rapier WASM + card.glb 2.4MB)
	// sampai minimal 15% area lanyard benar-benar masuk viewport (atau klik #about),
	// agar di initial load Hero (desktop 940px / mobile) chunk 3D tidak ikut terpicu.
	useEffect(() => {
		if (showLanyard) return;
		const el = lanyardHostRef.current;
		if (!el) return;
		const activate = () => setShowLanyard(true);
		const onHash = () => {
			if (window.location.hash === '#about') activate();
		};
		const onClick = (e: MouseEvent) => {
			const link = (e.target as Element | null)?.closest?.('a[href="#about"]');
			if (link) activate();
		};
		window.addEventListener('hashchange', onHash);
		document.addEventListener('click', onClick, true);
		if (typeof IntersectionObserver === 'undefined') {
			activate();
			return () => {
				window.removeEventListener('hashchange', onHash);
				document.removeEventListener('click', onClick, true);
			};
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					activate();
					io.disconnect();
				}
			},
			{ rootMargin: '0px', threshold: 0.15 },
		);
		io.observe(el);
		return () => {
			io.disconnect();
			window.removeEventListener('hashchange', onHash);
			document.removeEventListener('click', onClick, true);
		};
	}, [showLanyard]);

	return (
		<section
			id="about"
			ref={ref}
			data-reveal
			className="relative overflow-hidden py-20 md:py-28"
			style={{ scrollMarginTop: 80 }}
		>
			<div
				className="pointer-events-none absolute top-[34%] left-1/2 hidden -translate-x-1/2 select-none md:block"
				aria-hidden="true"
			>
				<p
					className="leading-none font-black tracking-[-0.06em] whitespace-nowrap"
					style={{
						fontSize: 'clamp(6rem, 13vw, 12rem)',
						color: 'rgba(88,85,246,0.045)',
					}}
				>
					{m.about.label}
				</p>
			</div>

			<div className="relative mx-auto max-w-340 px-4 md:px-6">
				<div className="grid gap-6 md:grid-cols-12 md:gap-10">
					<div className="relative md:col-span-5" data-reveal-item>
						{/* Nomor urut = posisi nyata di halaman (sekuens), bukan dekorasi. */}
						<p className="section-label mb-3">
							01 · {m.about.label}
						</p>
						{/* Lanyard — transparent parent, no bg/border, fixed height to prevent CLS */}
						<div
							ref={lanyardHostRef}
							className="relative h-105 overflow-hidden md:h-130"
							style={{ background: 'transparent', border: 'none', borderRadius: 'var(--radius-lg)' }}
						>
							{showLanyard ? (
								<Suspense fallback={<div aria-hidden="true" className="h-full w-full" />}>
									<Lanyard
										position={[0, 0, 13]}
										gravity={[0, -40, 0]}
										fov={22}
										transparent
										frontImage="/lanyard-biodata-front.png"
										backImage="/adtt-600.webp"
										imageFit="cover"
										className="h-full"
									/>
								</Suspense>
							) : null}
						</div>
						<button
							type="button"
							onClick={() => setFlipped((f) => !f)}
							aria-label={m.about.flipHint}
							title={m.about.flipHint}
							className="flip-badge mt-3 cursor-pointer text-left"
							data-flipped={flipped ? '1' : ''}
						>
							<span className="flip-inner" aria-hidden="false">
								<span className="flip-face flip-front">
									<span className="h-px w-8" style={{ background: 'var(--border)' }} aria-hidden="true" />
									<span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
										{m.about.subtitle}
									</span>
								</span>
								<span className="flip-face flip-back">
									<span className="flip-dot" aria-hidden="true" />
									<span className="font-mono text-xs" style={{ color: 'var(--fg)' }}>
										{m.about.status} · {m.about.statusDetail}
									</span>
								</span>
							</span>
						</button>
					</div>

					<div className="md:col-span-7 flex gap-6 md:gap-8">
						<div className="flex flex-1 flex-col justify-center">
							<h2
								data-reveal-item
								className="text-[2rem] leading-[0.95] font-black tracking-[-0.03em] md:text-[2.5rem]"
								style={{ color: 'var(--fg)' }}
							>
								{m.about.title}
								<br />
								<span style={{ color: 'var(--color-primary)' }}>{m.about.subtitle}</span>
							</h2>
							<div
								className="section-rule mt-4"
								aria-hidden="true"
							/>
							{m.about.bio.map((para, i) => (
								<p
									key={i}
									data-reveal-item
									className="mt-6 max-w-xl text-[15px] leading-7"
									style={{ color: 'var(--fg-muted)' }}
								>
									{para}
								</p>
							))}

							<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" data-reveal-item>
								<a
									ref={ctaRef}
									href="#contact"
									className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-[0.96]"
									style={{ background: 'var(--color-primary)', boxShadow: 'var(--shadow-lift)' }}
								>
									{m.about.cta}
								</a>
								{/* Aksi sekunder = tautan tenang, bukan pill kedua.
								    ↗ penanda eksternal yang fungsional. */}
								<a
									href={siteData.links.github}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1.5 py-3 text-sm font-semibold underline decoration-1 underline-offset-4 transition hover:opacity-70"
									style={{ color: 'var(--fg)', textDecorationColor: 'var(--border)' }}
								>
									{m.about.github} <span aria-hidden="true">↗</span>
								</a>
							</div>
						</div>

						{/* Dekor kanan — vertical typography */}
						<div
							className="hidden shrink-0 items-center justify-center border-l md:flex md:w-37"
							style={{ borderColor: 'var(--border)' }}
							aria-hidden="true"
						>
							<p
								className="select-none font-black tracking-[-0.06em]"
								style={{
									writingMode: 'vertical-rl',
									textOrientation: 'mixed',
									fontSize: 'clamp(3rem, 5vw, 4.2rem)',
									lineHeight: 1,
									color: 'rgba(88,85,246,0.09)',
								}}
							>
								{m.about.decorative}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
