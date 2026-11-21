import { useEffect, useRef, type CSSProperties } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import { getProgress, subscribe } from '../../lib/loadProgress';
import { burst } from '../../lib/particles';

const LOAD_TIMEOUT = 4500;
const MIN_HOLD = 680;
const COUNT_DURATION = 620;

type Props = {
	onDone: () => void;
};

/**
 * Splash — midnight atelier (pure CSS + WAAPI, 0KB GSAP di initial bundle).
 * Segel + wordmark + garis ledger (fase · N°) masuk; counter & bar mengikuti
 * loading aset ASLI (loadProgress), wipe ke atas setelah intro + aset siap.
 * Segel bisa di-klik (stamp pop + burst). Klik lain / Esc = skip.
 * Muncul sekali per session (diatur dari App via sessionStorage).
 */
export default function Splash({ onDone }: Props) {
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const rootRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const countRef = useRef<HTMLSpanElement>(null);
	const phaseRef = useRef<HTMLSpanElement>(null);
	const barRef = useRef<HTMLDivElement>(null);
	const barFillRef = useRef<HTMLSpanElement>(null);
	const sealLetterRef = useRef<HTMLSpanElement>(null);
	const doneRef = useRef(onDone);
	const phasesRef = useRef(m.splash.phases);
	const skipRef = useRef<(() => void) | null>(null);
	const finishedRef = useRef(false);

	useEffect(() => {
		phasesRef.current = m.splash.phases;
	}, [m.splash.phases]);

	useEffect(() => {
		doneRef.current = onDone;
		const el = rootRef.current;
		if (!el) return;

		const finish = () => {
			if (finishedRef.current) return;
			finishedRef.current = true;
			doneRef.current();
		};

		let shown = 0;
		const startTime = performance.now();
		let rafId = 0;
		let gated = false;
		const exitAnims: Animation[] = [];

		const renderCount = () => {
			const phases = phasesRef.current;
			const n = Math.round(shown);
			if (countRef.current) countRef.current.textContent = n.toString().padStart(3, '0');
			if (phaseRef.current) {
				phaseRef.current.textContent = n < 45 ? phases[0] : n < 100 ? phases[1] : phases[2];
			}
			if (barRef.current) barRef.current.setAttribute('aria-valuenow', String(n));
			if (barFillRef.current) {
				barFillRef.current.style.transform = `scaleX(${Math.min(1, shown / 100)})`;
			}
		};

		const playExit = (fast = false) => {
			if (gated || finishedRef.current) return;
			gated = true;
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = 0;
			}
			shown = 100;
			renderCount();
			const dur = fast ? 320 : 400;
			if (typeof el.animate !== 'function') {
				finish();
				return;
			}
			if (contentRef.current && typeof contentRef.current.animate === 'function') {
				exitAnims.push(
					contentRef.current.animate(
						[{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(0, -48px, 0)' }],
						{ duration: dur, easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)', fill: 'forwards' },
					),
				);
			}
			const curtain = el.animate(
				[{ transform: 'translate3d(0, 0%, 0)' }, { transform: 'translate3d(0, -100%, 0)' }],
				{ duration: dur, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' },
			);
			exitAnims.push(curtain);
			curtain.onfinish = finish;
			curtain.oncancel = finish;
		};

		const tick = (now: number) => {
			rafId = 0;
			if (gated || finishedRef.current) return;
			const elapsed = now - startTime;
			const t = Math.min(1, elapsed / COUNT_DURATION);
			// easeInOutQuad
			const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
			const floor = Math.min(100, eased * 100);
			const real = Math.round(getProgress() * 100);
			const target = Math.max(real, floor);
			if (target > shown) {
				shown = target;
				renderCount();
			}
			if ((getProgress() >= 1 && elapsed >= MIN_HOLD) || elapsed >= LOAD_TIMEOUT) {
				playExit(false);
				return;
			}
			rafId = requestAnimationFrame(tick);
		};

		renderCount();
		rafId = requestAnimationFrame(tick);
		const unsub = subscribe(() => {
			if (!rafId && !gated && !finishedRef.current) {
				rafId = requestAnimationFrame(tick);
			}
		});

		const skip = () => playExit(true);
		skipRef.current = skip;

		const onKey = (e: KeyboardEvent) => {
			if ((e.target as HTMLElement | null)?.closest?.('.splash-seal-btn')) return;
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') skip();
		};
		el.addEventListener('click', skip);
		window.addEventListener('keydown', onKey);

		return () => {
			skipRef.current = null;
			el.removeEventListener('click', skip);
			window.removeEventListener('keydown', onKey);
			if (rafId) cancelAnimationFrame(rafId);
			unsub();
			exitAnims.forEach((a) => {
				a.onfinish = null;
				a.oncancel = null;
				a.cancel();
			});
		};
	}, [onDone]);

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
			<div ref={contentRef} className="splash-content relative flex flex-1 flex-col items-center justify-center px-5 text-center sm:px-10">
				{/* Segel bisa di-stamp: klik = pop + semburan (bukan skip). */}
				<button
					type="button"
					className="splash-seal-btn splash-seal-wrap relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full"
					aria-label="Stamp the seal"
					onClick={(e) => {
						e.stopPropagation();
						const wrap = e.currentTarget;
						wrap.animate?.(
							[
								{ transform: 'scale(1)' },
								{ transform: 'scale(0.84)', offset: 0.16 },
								{ transform: 'scale(1.06)', offset: 0.55 },
								{ transform: 'scale(0.98)', offset: 0.8 },
								{ transform: 'scale(1)' },
							],
							{ duration: 480, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
						);
						sealLetterRef.current?.animate?.(
							[{ transform: 'rotate(0deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' }],
							{ duration: 180, easing: 'ease-in-out' },
						);
						burst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, { count: 22 });
					}}
				>
					<svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full" aria-hidden="true">
						<circle cx="48" cy="48" r="34" className="splash-seal-inner" />
						<circle cx="48" cy="48" r="34" className="splash-seal-draw" transform="rotate(-90 48 48)" />
					</svg>
					<span ref={sealLetterRef} className="splash-seal-letter inline-block font-black" style={{ color: 'var(--hero-heading)', fontSize: '2rem' }}>A</span>
				</button>
				<p className="splash-eyebrow mt-5 italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: 'var(--hero-muted)', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
					{m.splash.brand}
				</p>
				<h1 className="relative mt-3 leading-[0.9] font-black tracking-[0.02em] uppercase">
					<span className="block overflow-hidden">
						<span className="block text-[clamp(3rem,12vw,8rem)]" style={{ color: 'var(--hero-heading)' }}>
							{'ADITYA'.split('').map((ch, i) => (
								<span key={i} className="splash-letter-a" style={{ display: 'inline-block', '--i': i } as CSSProperties}>{ch}</span>
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
						skipRef.current?.();
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
				<span ref={barFillRef} className="splash-bar block h-full w-full origin-left" style={{ transform: 'scaleX(0)' }} aria-hidden="true" />
			</div>
		</div>
	);
}
