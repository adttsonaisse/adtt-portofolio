import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { projects } from '../../data/projects';
import CircularGallery, { type CircularGalleryHandle } from '../ui/CircularGallery';
import { useTheme } from '../../hooks/useTheme';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';

/**
 * Stiker playful untuk proyek featured: rotasi acak, bisa di-drag
 * (stopPropagation native agar drag galeri tidak ikut jalan).
 */
function FeaturedSticker({ label }: { label: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const [off, setOff] = useState({ x: 0, y: 0 });
	const offRef = useRef(off);
	const [tilt] = useState(() => -8 + Math.random() * 16);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let dragging = false;
		let sx = 0;
		let sy = 0;
		const base = { x: 0, y: 0 };
		const stop = (e: Event) => e.stopPropagation();
		const down = (e: PointerEvent) => {
			e.stopPropagation();
			dragging = true;
			sx = e.clientX;
			sy = e.clientY;
			base.x = offRef.current.x;
			base.y = offRef.current.y;
			try {
				el.setPointerCapture(e.pointerId);
			} catch {
				/* abaikan */
			}
		};
		const move = (e: PointerEvent) => {
			if (!dragging) return;
			const next = { x: base.x + e.clientX - sx, y: base.y + e.clientY - sy };
			offRef.current = next;
			setOff(next);
		};
		const up = () => {
			if (!dragging) return;
			dragging = false;
			gsap.fromTo(el, { rotate: tilt }, { rotate: tilt + 7, duration: 0.09, yoyo: true, repeat: 3, ease: 'power2.inOut', overwrite: 'auto' });
		};
		el.addEventListener('mousedown', stop);
		el.addEventListener('touchstart', stop, { passive: true });
		el.addEventListener('pointerdown', down);
		el.addEventListener('pointermove', move);
		el.addEventListener('pointerup', up);
		el.addEventListener('pointercancel', up);
		return () => {
			el.removeEventListener('mousedown', stop);
			el.removeEventListener('touchstart', stop);
			el.removeEventListener('pointerdown', down);
			el.removeEventListener('pointermove', move);
			el.removeEventListener('pointerup', up);
			el.removeEventListener('pointercancel', up);
		};
	}, [tilt]);

	return (
		<div
			ref={ref}
			className="absolute top-4 right-4 z-10 cursor-grab touch-none rounded-full px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.08em] text-white uppercase select-none active:cursor-grabbing md:top-5 md:right-5"
			style={{
				background: 'var(--color-primary)',
				boxShadow: 'var(--shadow-lift)',
				transform: `translate(${off.x}px, ${off.y}px) rotate(${tilt}deg)`,
			}}
		>
			★ {label}
		</div>
	);
}

export default function Projects() {
	const ref = useSectionReveal<HTMLElement>();
	const galleryRef = useRef<CircularGalleryHandle>(null);
	const [active, setActive] = useState(0);
	const { theme } = useTheme();
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const textColor = theme === 'light' ? '#111111' : '#ffffff';
	const localizedProjects = projects[locale];
	const items = useMemo(() => localizedProjects.map((p) => ({ image: p.image!, text: p.title })), [localizedProjects]);
	const current = localizedProjects[active] ?? localizedProjects[0];

	// Caption pop tiap proyek aktif berganti (lewati mount pertama).
	const prevActive = useRef(active);
	useEffect(() => {
		if (prevActive.current === active) return;
		prevActive.current = active;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		gsap.fromTo('.proj-caption', { scale: 0.94, rotate: -1 }, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)', overwrite: 'auto' });
	}, [active]);

  return (
    <section id="projects" ref={ref} data-reveal className="relative py-20 md:py-28" style={{ scrollMarginTop: 80 }}>
      <div className="mx-auto max-w-[1360px] px-4 md:px-6" data-reveal-item>
        <p className="section-label">
        	03 · {m.projects.label}
        </p>
        <h2 className="mt-2 text-[2rem] font-black tracking-[-0.03em] md:text-[2.5rem]" style={{ color: 'var(--fg)' }}>
        	{m.projects.title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: 'var(--fg-muted)' }}>
         	{m.projects.instruction}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-340 px-4 md:px-6" data-reveal-item>
        <div className="group relative h-[420px] overflow-hidden md:h-[560px] lg:h-[600px]" style={{ borderRadius: 'var(--radius-lg)' }}>
          <CircularGallery
            ref={galleryRef}
            bend={1}
            textColor={textColor}
            borderRadius={0.05}
            scrollSpeed={3}
            scrollEase={0.05}
            items={items}
            onActiveIndexChange={setActive}
          />
          {current.featured && <FeaturedSticker key={current.slug} label={m.projects.featured} />}
          <button
            type="button"
            aria-label={m.projects.prev}
            onClick={() => galleryRef.current?.prev()}
            className="absolute top-1/2 left-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border text-lg transition hover:scale-105 active:scale-95 md:left-5 md:h-12 md:w-12"
            style={{
              borderColor: 'var(--border)',
              background: 'color-mix(in srgb, var(--surface) 82%, transparent)',
              color: 'var(--fg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            aria-label={m.projects.next}
            onClick={() => galleryRef.current?.next()}
            className="absolute top-1/2 right-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border text-lg transition hover:scale-105 active:scale-95 md:right-5 md:h-12 md:w-12"
            style={{
              borderColor: 'var(--border)',
              background: 'color-mix(in srgb, var(--surface) 82%, transparent)',
              color: 'var(--fg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span aria-hidden>→</span>
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="proj-caption text-center">
            <span className="font-mono text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--fg-muted)' }}>
              {String(active + 1).padStart(2, '0')} /               {String(localizedProjects.length).padStart(2, '0')}
            </span>
            <span className="mx-2" style={{ color: 'var(--border)' }}>
              •
            </span>
            <span className="text-sm font-bold tracking-[-0.01em]" style={{ color: 'var(--fg)' }}>
              {current.title}
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {current.links.github ? (
              <a
                href={current.links.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--fg)', background: 'var(--card-bg)' }}
              >
                {m.projects.github} <span aria-hidden>↗</span>
              </a>
            ) : (
              <span
                className="inline-flex items-center rounded-full border px-6 py-2.5 text-sm font-semibold opacity-40"
                style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
              >
                {m.projects.noRepo}
              </span>
            )}
            {current.links.live && current.links.live !== '#' ? (
              <a
                href={current.links.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                style={{ background: '#5855F6', boxShadow: 'var(--shadow-lift)' }}
              >
                {m.projects.live} <span aria-hidden>↗</span>
              </a>
            ) : (
              <span
                className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold text-white opacity-50"
                style={{ background: '#5855F6' }}
              >
                {m.projects.noLive}
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] tracking-[0.08em] uppercase" style={{ color: 'var(--fg-muted)', opacity: 0.5 }}>
            {m.projects.hint}
          </p>
        </div>
      </div>
    </section>
  );
}
