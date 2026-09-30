import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import { getProgress, subscribe } from '../../lib/loadProgress';
import { burst } from '../../lib/particles';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const LOAD_TIMEOUT = 6000;

type Props = {
	onDone: () => void;
};

/**
 * Splash — midnight atelier (satu momen orkestrasi + playful).
 * Segel + wordmark + garis ledger (fase · N°) masuk; counter & bar mengikuti
 * loading aset ASLI (loadProgress), wipe ke atas setelah intro + aset siap.
 * Segel bisa di-klik (stamp pop + burst). Klik lain / Esc = skip.
 * Muncul sekali per session (diatur dari App via sessionStorage).
 * Reduced-motion: selesai instan. Tanpa loop CSS — semua gerak milik GSAP.
 */
export default function Splash({ onDone }: Props) {
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const rootRef = useRef<HTMLDivElement>(null);
	const countRef = useRef<HTMLSpanElement>(null);
	const phaseRef = useRef<HTMLSpanElement>(null);
	const barRef = useRef<HTMLDivElement>(null);
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
		const shown = { v: 0 };
		const phases = m.splash.phases;
		const barEl = () => el.querySelector<HTMLElement>('.splash-bar');
		const renderCount = () => {
			const n = Math.round(shown.v);
			if (countRef.current) countRef.current.textContent = n.toString().padStart(3, '0');
			if (phaseRef.current) {
				phaseRef.current.textContent = n < 45 ? phases[0] : n < 100 ? phases[1] : phases[2];
			}
			if (barRef.current) barRef.current.setAttribute('aria-valuenow', String(n));
			const bar = barEl();
			if (bar) bar.style.transform = `scaleX(${Math.min(1, shown.v / 100)})`;
		};
		// Counter mengikuti loading aset asli (monoton naik; fallback timer
		// bila aset lebih cepat dari animasi masuk).
		const tickProgress = () => {
			const real = Math.round(getProgress() * 100);
			const floor = Math.min(100, counter.v);
			const target = Math.max(real, floor);
			if (target > shown.v) {
				shown.v = target;
				renderCount();
			}
		};
		const tickerCb = () => tickProgress();
		gsap.ticker.add(tickerCb);
		const unsub = subscribe(() => tickProgress());

		let exitTl: gsap.core.Timeline | null = null;
		let gated = false;
		const playExit = () => {
			if (gated || finishedRef.current) return;
			gated = true;
			shown.v = 100;
			renderCount();
			exitTl = gsap.timeline({ onComplete: finish });
			exitTl
				.to('.splash-content', { y: -64, duration: 0.55, ease: 'power3.in' }, 0)
				.to(el, { yPercent: -100, duration: 0.65, ease: 'power4.inOut' }, 0);
		};
		// Gerbang keluar: visual intro selesai + aset termuat (atau timeout).
		const startTime = performance.now();
		const gateTimer = window.setInterval(() => {
			const minHold = performance.now() - startTime > 1900;
			if ((getProgress() >= 1 && minHold) || performance.now() - startTime > LOAD_TIMEOUT) {
				window.clearInterval(gateTimer);
				playExit();
			}
		}, 120);

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				defaults: { ease: 'power4.out' },
				onComplete: () => {
					// Intro selesai — tunggu gerbang (min hold + aset) sebelum wipe.
					const wait = () => {
						if (gated || finishedRef.current) return;
						if (getProgress() >= 1 && performance.now() - startTime > 1900) playExit();
						else gsap.delayedCall(0.12, wait);
					};
					wait();
				},
			});
			tl.fromTo('.splash-fade', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, stagger: 0.05 }, 0)
				.fromTo('.splash-frame-corner', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.05 }, 0.05)
				// Act I — identitas (0.1 → 1.1)
				.fromTo('.splash-seal-wrap', { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, 0.1)
				.fromTo('.splash-eyebrow', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.15)
				.fromTo('.splash-letter-a', { autoAlpha: 0, y: 64 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05 }, 0.25)
				.fromTo('.splash-line-b', { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.45)
				// Act II — ledger + segel (lantai timer agar bar tidak diam
				// bila aset memuat lebih cepat dari koreografi)
				.to(counter, { v: 100, duration: 1.6, ease: 'power2.inOut' }, 0.5)
				.fromTo('.splash-ledger-line', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.6)
				.fromTo('.splash-meta', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.07 }, 0.65)
				.to('.splash-seal-draw', { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.7)
				.fromTo('.splash-seal-letter', { autoAlpha: 0, scale: 1.35 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'expo.out' }, 1.3);
		}, el);
		renderCount();

		const onClick = () => {
			ctx.kill();
			exitTl?.kill();
			window.clearInterval(gateTimer);
			if (finishedRef.current) return;
			gsap.to(el, { yPercent: -100, duration: 0.4, ease: 'power3.inOut', onComplete: finish });
		};
		const onKey = (e: KeyboardEvent) => {
			// Jangan skip saat fokus di tombol segel — Enter/Space di sana = stamp.
			if ((e.target as HTMLElement | null)?.closest?.('.splash-seal-btn')) return;
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onClick();
		};
		el.addEventListener('click', onClick);
		window.addEventListener('keydown', onKey);

		return () => {
			el.removeEventListener('click', onClick);
			window.removeEventListener('keydown', onKey);
			window.clearInterval(gateTimer);
			gsap.ticker.remove(tickerCb);
			unsub();
			exitTl?.kill();
			ctx.revert();
		};
	}, [onDone, m.splash.phases]);

	return (
		<div
			ref={rootRef}
			className="splash fixed inset-0 z-200 flex cursor-pointer flex-col overflow-hidden"
			role="dialog"
			aria-modal="true"
			aria-label={m.splash.loading}
		>
			{/* bingkai atelier + satu glow bawah (cerminan Hero) */}
			<div className="splash-fade splash-orb splash-orb-a pointer-events-none absolute" aria-hidden="true" />
			<div className="splash-fade splash-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
			<div className="splash-fade splash-grain pointer-events-none absolute inset-0" aria-hidden="true" />
			<span className="splash-frame-corner tl" aria-hidden="true" />
			<span className="splash-frame-corner tr" aria-hidden="true" />
			<span className="splash-frame-corner bl" aria-hidden="true" />
			<span className="splash-frame-corner br" aria-hidden="true" />

			{/* meta atas */}
			<div className="splash-meta absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 font-mono text-[10px] tracking-[0.22em] uppercase sm:px-8" style={{ color: 'var(--hero-muted)' }}>
				<span>{m.splash.credit}</span>
				<span>{m.splash.location}</span>
			</div>

			{/* konten utama */}
			<div className="splash-content relative flex flex-1 flex-col items-center justify-center px-5 text-center sm:px-10">
				{/* Segel bisa di-stamp: klik = pop + semburan (bukan skip). */}
				<button
					type="button"
					className="splash-seal-btn splash-seal-wrap relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full"
					aria-label="Stamp the seal"
					onClick={(e) => {
						e.stopPropagation();
						const wrap = e.currentTarget;
						gsap.fromTo(wrap, { scale: 1, autoAlpha: 1 }, { scale: 0.84, autoAlpha: 1, duration: 0.09, ease: 'power2.in', overwrite: 'auto', onComplete: () => {
							gsap.to(wrap, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'elastic.out(1, 0.38)', overwrite: 'auto' });
						} });
						gsap.fromTo('.splash-seal-letter', { rotate: 0 }, { rotate: 8, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.inOut', overwrite: 'auto' });
						burst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, { count: 22 });
					}}
				>
					<svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full" aria-hidden="true">
						<circle cx="48" cy="48" r="34" className="splash-seal-inner" />
						<circle cx="48" cy="48" r="34" className="splash-seal-draw" transform="rotate(-90 48 48)" />
					</svg>
					<span className="splash-seal-letter inline-block font-black" style={{ color: 'var(--hero-heading)', fontSize: '2rem' }}>A</span>
				</button>
				<p className="splash-eyebrow mt-5 italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: 'var(--hero-muted)', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
					{m.splash.brand}
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
				</h1>

				<div className="mt-10 flex w-full max-w-md items-center gap-4">
					<span className="splash-ledger-diamond" aria-hidden="true" />
					<div className="h-px flex-1" style={{ background: 'var(--border)' }} aria-hidden="true" />
					<p className="splash-ledger-line font-mono text-[10px] tracking-[0.22em] uppercase sm:text-[11px]" style={{ color: 'var(--hero-muted)' }}>
						<span ref={phaseRef}>{m.splash.phases[0]}</span>
						<span style={{ color: 'var(--color-secondary)' }}> · </span>
						<span className="splash-count-wrap inline-block tabular-nums" style={{ color: 'var(--hero-heading)' }}>N° <span ref={countRef}>000</span></span>
					</p>
					<div className="h-px flex-1" style={{ background: 'var(--border)' }} aria-hidden="true" />
					<span className="splash-ledger-diamond" aria-hidden="true" />
				</div>
			</div>

			{/* strip bawah: status nyata + tombol lewati yang bisa difokus */}
			<div className="splash-meta relative flex items-center justify-between px-5 pb-6 font-mono text-[10px] tracking-[0.22em] uppercase sm:px-8" style={{ color: 'var(--hero-muted)' }}>
				<span className="flex items-center gap-2">
					<span className="splash-status-dot" aria-hidden="true" />
					{m.splash.loading}
				</span>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						if (finishedRef.current) return;
						finishedRef.current = true;
						doneRef.current();
					}}
					className="rounded-full border px-4 py-1.5 transition hover:opacity-80"
					style={{ borderColor: 'var(--border)', color: 'var(--hero-heading)' }}
				>
					{m.splash.skip}
				</button>
			</div>
			<div
				ref={barRef}
				role="progressbar"
				aria-label={m.splash.loading}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={0}
				className="absolute inset-x-0 bottom-0 h-[2px]"
				style={{ background: 'var(--border)' }}
			>
				<span className="splash-bar block h-full w-full origin-left" style={{ transform: 'scaleX(0)' }} aria-hidden="true" />
			</div>
		</div>
	);
}
