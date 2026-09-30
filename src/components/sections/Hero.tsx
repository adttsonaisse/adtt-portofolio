import { useRef, useState } from 'react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { site } from '../../data/site';
import DepthText from '../ui/DepthText';
import { useTheme } from '../../hooks/useTheme';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import { burst } from '../../lib/particles';

export default function Hero() {
	const ref = useSectionReveal<HTMLElement>({ immediate: true, y: 16, itemY: 12, duration: 0.7, stagger: 0.08 });
	const { theme } = useTheme();
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const siteData = site[locale];
	const spotlightRef = useRef<HTMLDivElement>(null);
	const rafRef = useRef(0);
	// Gelombang huruf: naik tiap klik pada nama.
	const [wave, setWave] = useState(0);
	const fireWave = (e: React.MouseEvent | React.KeyboardEvent) => {
		setWave((w) => w + 1);
		const p = 'clientX' in e ? { x: e.clientX, y: e.clientY } : null;
		if (p && p.x > 0) burst(p.x, p.y, { count: 14 });
	};

	// Spotlight warna mengikuti kursor: posisi di-lerp (trailing licin),
	// radius membesar selama kursor di foto, mengecil saat keluar.
	// Tanpa re-render: tulis --x/--y/--r/--show langsung ke DOM.
	const spotRef = useRef({ tx: 50, ty: 50, x: 50, y: 50, r: 0, tr: 0, hovering: false, hideTimer: 0 });
	const fullRadius = () => (window.matchMedia('(max-width: 768px)').matches ? 130 : 210);

	const spotLoop = () => {
		const el = spotlightRef.current;
		const s = spotRef.current;
		if (!el) {
			rafRef.current = 0;
			return;
		}
		s.x += (s.tx - s.x) * 0.14;
		s.y += (s.ty - s.y) * 0.14;
		s.r += (s.tr - s.r) * 0.1;
		el.style.setProperty('--x', `${s.x.toFixed(2)}%`);
		el.style.setProperty('--y', `${s.y.toFixed(2)}%`);
		el.style.setProperty('--r', `${Math.max(0, s.r).toFixed(1)}px`);
		const settled = Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05 && Math.abs(s.tr - s.r) < 0.5;
		if (settled && !s.hovering) {
			el.style.setProperty('--show', '0');
			rafRef.current = 0;
			return;
		}
		rafRef.current = requestAnimationFrame(spotLoop);
	};
	const spotKick = () => {
		if (!rafRef.current) rafRef.current = requestAnimationFrame(spotLoop);
	};

	const spotTo = (clientX: number, clientY: number, el: HTMLDivElement) => {
		const r = el.getBoundingClientRect();
		if (!r.width || !r.height) return;
		const s = spotRef.current;
		s.tx = ((clientX - r.left) / r.width) * 100;
		s.ty = ((clientY - r.top) / r.height) * 100;
	};

	const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const el = spotlightRef.current ?? e.currentTarget;
		const s = spotRef.current;
		s.hovering = true;
		s.tr = fullRadius();
		window.clearTimeout(s.hideTimer);
		spotTo(e.clientX, e.clientY, el);
		el.style.setProperty('--show', '1');
		spotKick();
	};

	const onLeave = () => {
		const s = spotRef.current;
		s.hovering = false;
		s.tr = 0;
		spotKick();
	};

	// Touch: tap memunculkan lingkaran 1 detik di titik tap.
	const onTouch = (e: React.TouchEvent<HTMLDivElement>) => {
		const el = spotlightRef.current ?? e.currentTarget;
		const s = spotRef.current;
		const t = e.touches[0];
		if (!t) return;
		spotTo(t.clientX, t.clientY, el);
		s.x = s.tx;
		s.y = s.ty;
		s.hovering = true;
		s.tr = 130;
		window.clearTimeout(s.hideTimer);
		el.style.setProperty('--show', '1');
		spotKick();
		s.hideTimer = window.setTimeout(() => {
			s.hovering = false;
			s.tr = 0;
			spotKick();
		}, 1000);
	};

	return (
		<section id="home" ref={ref} data-reveal className="relative overflow-hidden" style={{ scrollMarginTop: 80 }}>
			<div
				className="pointer-events-none absolute top-[48%] left-1/2 hidden -translate-x-1/2 -translate-y-1/2 select-none md:block"
				aria-hidden="true"
			>
				<p
					className="leading-none font-black tracking-[-0.06em] whitespace-nowrap"
					style={{ fontSize: 'clamp(7rem, 16vw, 14rem)', color: 'rgba(88, 85, 246, 0.06)' }}
				>
				{m.hero.monogram}
				</p>
			</div>

			<div className="relative mx-auto max-w-340 px-4 md:px-6">
				<div className="grid min-h-155 grid-cols-12 gap-6 py-8 md:min-h-180 md:gap-4 md:py-6">
					<div className="col-span-12 flex flex-col justify-between md:col-span-3" data-reveal-item>
						<div>
							<h1
								className="flex flex-col gap-0 overflow-visible text-[3.2rem] leading-[0.88] tracking-tighter md:text-[4.4rem] lg:text-[5.6rem]"
								style={{ color: 'var(--hero-heading)', overflow: 'visible' }}
							>
								<span
									className="font-normal italic leading-none tracking-[-0.02em]"
									style={{
										fontFamily: "Georgia, 'Times New Roman', Times, serif",
										fontWeight: 400,
										fontStyle: 'italic',
										color: 'var(--hero-heading)',
									}}
								>
									{m.hero.greeting}
								</span>
								{/* Nama per huruf: tiap huruf miring sendiri mengikuti pointer;
								    klik = gelombang + semburan. */}
								<span
									role="button"
									tabIndex={0}
									aria-label="Play letter wave"
									onClick={fireWave}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											fireWave(e);
										}
									}}
									className="inline-block max-w-full cursor-pointer overflow-visible pr-6 whitespace-nowrap outline-none md:pr-10"
								>
									{'ADITYA'.split('').map((ch, i) => (
										<DepthText
											key={`${ch}-${i}`}
											text={ch}
											layers={14}
											depth={1.4}
											faceColor={theme === 'light' ? '#0a0a0b' : '#fafafa'}
											depthColor="#5855F6"
											tilt={5}
											pointerTracking
											autoOrbit={false}
											smoothing={0.12}
											perspective={900}
											fontSize="1em"
											fontWeight={900}
											shadow={false}
											className="leading-[0.88]"
											pulseKey={wave}
											pulseDelay={i * 60}
										/>
									))}
								</span>
							</h1>

							{/* Satu-satunya panah dekoratif-bertujuan di halaman:
							    isyarat arah ke #contact. Tombol lain tidak memakai panah. */}
							<a
								href="#contact"
								className="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition hover:brightness-[0.96]"
								style={{ background: '#5855F6', boxShadow: 'var(--shadow-lift)' }}
							>
								{m.hero.cta}
								<span
									className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm leading-none"
									style={{ color: '#5855F6' }}
								>
									→
								</span>
							</a>
						</div>

						<p className="mt-10 max-w-75 text-[14px] leading-6 md:mt-auto" style={{ color: 'var(--hero-muted)' }}>
							{m.hero.intro}
						</p>
					</div>

					<div className="relative col-span-12 flex items-end justify-center md:col-span-6" data-reveal-item>
						<div
							className="pointer-events-none absolute bottom-0 left-1/2 h-[74%] w-[92%] -translate-x-1/2 rounded-t-[28px] opacity-60"
							style={{
								background: 'radial-gradient(ellipse at center bottom, rgba(88,85,246,0.16) 0%, transparent 70%)',
							}}
							aria-hidden="true"
						/>

						<div
							ref={spotlightRef}
							className="hero-reveal group relative z-10 block w-95 cursor-crosshair md:w-125 lg:w-145"
							style={
								{
									'--x': '50%',
									'--y': '50%',
									'--r': '0px',
									'--show': '0',
								} as React.CSSProperties
							}
							onMouseMove={onMove}
							onMouseLeave={onLeave}
							onTouchStart={onTouch}
						>
							<picture>
								<source srcSet="/adtt-600.webp 600w, /adtt.webp 900w" type="image/webp" />
								<img
									src="/adtt.png"
									alt={`Portrait of ${siteData.name}`}
									width={900}
									height={1273}
									className="hero-base h-auto w-full object-contain object-bottom"
									loading="eager"
									fetchPriority="high"
									decoding="async"
									draggable={false}
								/>
							</picture>
							<picture className="hero-overlay absolute inset-0" aria-hidden="true">
								<source srcSet="/adtt-600.webp 600w, /adtt.webp 900w" type="image/webp" />
								<img
									src="/adtt.png"
									alt=""
									width={900}
									height={1273}
									className="h-auto w-full object-contain object-bottom"
									loading="eager"
									decoding="async"
									draggable={false}
								/>
							</picture>
						</div>
					</div>

					<div className="col-span-12 flex flex-col justify-between md:col-span-3" data-reveal-item>
						<div className="text-left md:text-right">
							<p className="font-mono text-xs tracking-[0.12em] uppercase" style={{ color: 'var(--hero-muted)' }}>
							{m.hero.followMe}
							</p>
							<div className="mt-3 flex gap-2.5 md:justify-end">
								{[
									{ label: 'GitHub', href: siteData.links.github, Icon: FaGithub },
									{ label: 'LinkedIn', href: siteData.links.linkedin, Icon: FaLinkedinIn },
									{ label: 'Email', href: siteData.links.email, Icon: FiMail },
								].map(({ label, href, Icon }) => (
									<a
										key={label}
										href={href}
										target={href.startsWith('mailto:') ? undefined : '_blank'}
										rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
										className="flex h-9 w-9 items-center justify-center rounded-full border text-sm transition hover:scale-105"
										style={{ borderColor: 'var(--hero-social-border)', color: 'var(--hero-social-color)', background: 'var(--hero-social-bg)' }}
										aria-label={label}
									>
										<Icon size={15} aria-hidden="true" />
									</a>
								))}
							</div>
							<p className="mt-5 max-w-65 text-[14px] leading-6 md:ml-auto" style={{ color: 'var(--hero-muted)' }}>
								{m.hero.role}
							</p>
						</div>

						<div className="mt-10 md:mt-auto md:text-right">
							<p
								className="text-[2.1rem] leading-[0.92] font-black tracking-[-0.04em] md:text-[2.6rem] lg:text-[3.1rem]"
								style={{ color: 'var(--hero-heading)' }}
							>
							{m.hero.software}
							<br />
							{m.hero.engineer}
							<br />
							<span style={{ color: 'var(--hero-heading)' }}>{m.hero.craft}</span>
							</p>
						</div>
					</div>
				</div>
			</div>

			<style>{`
        .hero-reveal { transform: translateZ(0); contain: layout paint; }
        /* Base selalu grayscale — warna hanya muncul dari lingkaran kursor. */
        .hero-base {
          filter: grayscale(100%) drop-shadow(0 24px 36px rgba(0,0,0,0.12));
        }
        .hero-overlay {
          /* drop-shadow dihapus di overlay (sudah ada di base) — hemat 1x filter mahal per frame.
             Radius --r dianimasikan via rAF: membesar selama kursor di foto. */
          mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), black 0 62%, transparent 100%);
          -webkit-mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), black 0 62%, transparent 100%);
          opacity: var(--show);
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        /* Tap di touch: lingkaran 1 detik (diatur via onTouch) — overlay
           tidak disembunyikan agar reveal tetap jalan. */
        /* Reduced-motion: tanpa lingkaran, foto tampil berwarna penuh statis. */
        @media (prefers-reduced-motion: reduce) {
          .hero-overlay { transition: none; display: block; opacity: 1; mask-image: none; -webkit-mask-image: none; }
        }
        [data-theme='dark'] section div[aria-hidden] p { color: rgba(129,140,248,0.09) !important; }
        [data-theme='light'] section div[aria-hidden] p { color: rgba(88, 85, 246, 0.06) !important; }
      `}</style>
		</section>
	);
}
