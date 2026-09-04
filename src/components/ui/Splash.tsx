import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

type Props = {
	onDone: () => void;
};

/**
 * Splash screen — midnight atelier (~3.5s).
 * Gerbang tersibak di awal (reveal), lalu segel + display + sheen + ledger
 * dimainkan TERBUKA, hold 0.4s agar terbaca, lalu wipe ke atas.
 * Muncul sekali per session (diatur dari App via sessionStorage).
 * Klik / Enter / Space / Esc untuk skip. Reduced-motion: selesai instan.
 */
export default function Splash({ onDone }: Props) {
	const rootRef = useRef<HTMLDivElement>(null);
	const countRef = useRef<HTMLSpanElement>(null);
	const phaseRef = useRef<HTMLSpanElement>(null);
	const doneRef = useRef(onDone);
	const finishedRef = useRef(false);

	useEffect(() => {
		doneRef.current = onDone;
		const el = rootRef.current;
		if (!el) return;

		const finish = () => {
			if (finishedRef.current) return;
			finishedRef.current = true;
			doneRef.current();
		};

		if (window.matchMedia(REDUCED_QUERY).matches) {
			finish();
			return;
		}

		const counter = { v: 0 };
		const setCount = () => {
			const n = Math.round(counter.v);
			if (countRef.current) countRef.current.textContent = n.toString().padStart(3, '0');
			if (phaseRef.current) {
				phaseRef.current.textContent =
					n < 28 ? 'CUTTING TYPE' : n < 58 ? 'SETTING GRID' : n < 86 ? 'POURING INDIGO' : n < 100 ? 'PRESSING SEAL' : 'READY';
			}
		};

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				defaults: { ease: 'power4.out' },
				onComplete: finish,
			});
			// Act 0 — gerbang tersibak dulu (0 → 0.8): adegan harus TERBUKA saat dimainkan.
			// Panel default tertutup dari CSS; tidak ada fromTo agar tak ada flash konten.
			tl.to('.splash-curtain-l', { xPercent: -101, duration: 0.9, ease: 'power4.inOut' }, 0)
				.to('.splash-curtain-r', { xPercent: 101, duration: 0.9, ease: 'power4.inOut' }, 0)
				.fromTo('.splash-fade', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.05 }, 0.1)
				.fromTo('.splash-frame-corner', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.06 }, 0.2)
				// Act I — identitas (0.3 → 1.3), overlap dengan gerbang yang masih tersibak
				.fromTo('.splash-seal-wrap', { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.55 }, 0.3)
				.fromTo('.splash-eyebrow', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.35)
				.fromTo('.splash-letter-a', { autoAlpha: 0, y: 64 }, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.055 }, 0.45)
				.fromTo('.splash-line-b', { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.65)
				.fromTo('.splash-sheen', { backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0', duration: 0.9, ease: 'power2.inOut' }, 0.9)
				// Act II — ledger + counter + seal stamp (0.8 → 2.4), panggung sudah terbuka penuh
				.fromTo('.splash-bar', { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0.8)
				.to(counter, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: setCount, onStart: setCount }, 0.8)
				.fromTo('.splash-ledger-line', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.1)
				.fromTo('.splash-meta', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, 1.15)
				.to('.splash-seal-draw', { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, 1.2)
				.fromTo('.splash-seal-letter', { autoAlpha: 0, scale: 1.35 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'expo.out' }, 1.95)
				.fromTo('.splash-seal-bloom', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 }, 1.95)
				// Act III — hold agar terbaca, lalu wipe sederhana (gerbang sudah terbuka)
				.to({}, { duration: 0.4 })
				.to('.splash-content', { y: -64, duration: 0.6, ease: 'power3.in' }, 'exit')
				.to(el, { yPercent: -100, duration: 0.7, ease: 'power4.inOut' }, 'exit');
		}, el);

		const onClick = () => {
			ctx.kill();
			if (finishedRef.current) return;
			gsap.to(el, { yPercent: -100, duration: 0.45, ease: 'power3.inOut', onComplete: finish });
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onClick();
		};
		el.addEventListener('click', onClick);
		window.addEventListener('keydown', onKey);

		return () => {
			el.removeEventListener('click', onClick);
			window.removeEventListener('keydown', onKey);
			ctx.revert();
		};
	}, [onDone]);

	return (
		<div
			ref={rootRef}
			className="splash fixed inset-0 z-200 flex cursor-pointer flex-col overflow-hidden"
			role="presentation"
			aria-hidden="true"
		>
			{/* ——— atelier frame + curtain (exit panels sit above content) ——— */}
			<div className="splash-fade splash-grid pointer-events-none absolute inset-0" aria-hidden="true" />
			<div className="splash-fade splash-orb splash-orb-a pointer-events-none absolute" aria-hidden="true" />
			<div className="splash-fade splash-orb splash-orb-b pointer-events-none absolute" aria-hidden="true" />
			<div className="splash-fade splash-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
			<div className="splash-fade splash-grain pointer-events-none absolute inset-0" aria-hidden="true" />
			<span className="splash-frame-corner tl" aria-hidden="true" />
			<span className="splash-frame-corner tr" aria-hidden="true" />
			<span className="splash-frame-corner bl" aria-hidden="true" />
			<span className="splash-frame-corner br" aria-hidden="true" />

			{/* ——— top meta ——— */}
			<div className="splash-meta absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 font-mono text-[10px] tracking-[0.28em] uppercase sm:px-8" style={{ color: 'var(--hero-muted)' }}>
				<span>ADTT&copy;2026</span>
				<span className="hidden items-center gap-2 sm:flex">
					<span className="splash-blink inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
					Atelier N°2
				</span>
				<span>JKT&mdash;ID / V2.0</span>
			</div>

			{/* ——— konten utama ——— */}
			<div className="splash-content relative flex flex-1 flex-col items-center justify-center px-5 text-center sm:px-10">
				<div className="splash-seal-wrap relative flex h-24 w-24 items-center justify-center">
					<div className="splash-seal-bloom absolute inset-0 rounded-full" aria-hidden="true" />
					<svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full" aria-hidden="true">
						<circle cx="48" cy="48" r="34" className="splash-seal-inner" />
						<circle cx="48" cy="48" r="34" className="splash-seal-draw" transform="rotate(-90 48 48)" />
					</svg>
					<span className="splash-seal-letter inline-block font-black" style={{ color: 'var(--hero-heading)', fontSize: '2rem' }}>A</span>
				</div>
				<p className="splash-eyebrow mt-5 italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: 'var(--hero-muted)', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
					Maison Aditya — Portfolio N°2
				</p>
				<h1 className="relative mt-3 leading-[0.9] font-black tracking-[0.02em] uppercase">
					<span className="block overflow-hidden">
						<span className="block text-[clamp(3rem,12vw,8rem)]" style={{ color: 'var(--hero-heading)' }}>
							{'ADITYA'.split('').map((ch, i) => (
								<span key={i} className="splash-letter-a" style={{ display: 'inline-block' }}>{ch}</span>
							))}
						</span>
					</span>
					<span className="splash-line-b splash-outline block text-[clamp(3rem,12vw,8rem)]" aria-hidden="true">Nurdiansyah</span>
					<span className="splash-sheen" aria-hidden="true" />
				</h1>

				<div className="mt-10 flex items-center gap-4">
					<span className="splash-ledger-diamond" aria-hidden="true" />
					<div className="h-px flex-1" style={{ background: 'var(--border)' }} aria-hidden="true" />
					<p className="splash-ledger-line font-mono text-[10px] tracking-[0.28em] uppercase sm:text-[11px]" style={{ color: 'var(--hero-muted)' }}>
						<span ref={phaseRef}>CUTTING TYPE</span>
						<span style={{ color: 'var(--color-secondary)' }}> · </span>
						<span className="splash-count-wrap inline-block tabular-nums" style={{ color: 'var(--hero-heading)' }}>N° <span ref={countRef}>000</span></span>
					</p>
					<div className="h-px flex-1" style={{ background: 'var(--border)' }} aria-hidden="true" />
					<span className="splash-ledger-diamond" aria-hidden="true" />
				</div>
			</div>

			{/* ——— bottom strip ——— */}
			<div className="splash-meta relative flex items-center justify-between px-5 pb-6 font-mono text-[10px] tracking-[0.28em] uppercase sm:px-8" style={{ color: 'var(--hero-muted)' }}>
				<span className="flex items-center gap-2">
					<span className="splash-blink inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-secondary)' }} />
					Loading experience
				</span>
				<span>Click to skip</span>
			</div>
			<div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: 'var(--border)' }} aria-hidden="true">
				<span className="splash-bar block h-full w-full origin-left" aria-hidden="true" />
			</div>
			<div className="splash-curtain-l" aria-hidden="true" />
			<div className="splash-curtain-r" aria-hidden="true" />
		</div>
	);
}
