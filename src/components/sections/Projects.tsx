import { useMemo, useRef, useState } from 'react';
import { projects } from '../../data/projects';
import CircularGallery, { type CircularGalleryHandle } from '../ui/CircularGallery';
import { useTheme } from '../../hooks/useTheme';
import { useSectionReveal } from '../../hooks/useSectionReveal';

export default function Projects() {
  const ref = useSectionReveal<HTMLElement>();
  const galleryRef = useRef<CircularGalleryHandle>(null);
  const [active, setActive] = useState(0);
  const { theme } = useTheme();
  const textColor = theme === 'light' ? '#111111' : '#ffffff';
  const items = useMemo(() => projects.map((p) => ({ image: p.image!, text: p.title })), []);
  const current = projects[active] ?? projects[0];

  return (
    <section id="projects" ref={ref} data-reveal className="relative py-16 md:py-20" style={{ scrollMarginTop: 80 }}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{ background: 'radial-gradient(500px circle at 80% 20%, var(--color-primary) 0%, transparent 60%)' }}
        aria-hidden="true"
      />
      <div className="mx-auto max-w-[1360px] px-4 md:px-6" data-reveal-item>
        <p className="font-mono text-xs tracking-[0.14em] uppercase" style={{ color: 'var(--color-primary)' }}>
          Portfolio
        </p>
        <h2 className="mt-2 text-[2rem] font-black tracking-[-0.03em] md:text-[2.5rem]" style={{ color: 'var(--fg)' }}>
          Selected work
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: 'var(--fg-muted)' }}>
          Drag, swipe horizontal, atau Shift+scroll untuk geser — link di bawah otomatis ganti sesuai project yang di tengah.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-340 px-4 md:px-6" data-reveal-item>
        <div style={{ height: '600px', position: 'relative' }} className="group relative overflow-hidden rounded-[28px]">
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
          <button
            type="button"
            aria-label="Previous project"
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
            aria-label="Next project"
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
          <p className="text-center">
            <span className="font-mono text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--fg-muted)' }}>
              {String(active + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
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
                style={{ borderColor: 'var(--border)', color: 'var(--fg)', background: 'var(--card)' }}
              >
                GitHub <span aria-hidden>↗</span>
              </a>
            ) : (
              <span
                className="inline-flex items-center rounded-full border px-6 py-2.5 text-sm font-semibold opacity-40"
                style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
              >
                No repo
              </span>
            )}
            {current.links.live && current.links.live !== '#' ? (
              <a
                href={current.links.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(88,85,246,0.35)] transition hover:brightness-110"
                style={{ background: '#5855F6' }}
              >
                Live Website <span aria-hidden>→</span>
              </a>
            ) : (
              <span
                className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold text-white opacity-50"
                style={{ background: '#5855F6' }}
              >
                No live
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] tracking-[0.08em] uppercase" style={{ color: 'var(--fg-muted)', opacity: 0.5 }}>
            drag / swipe / Shift+scroll / arrow keys / tombol ← → untuk ganti — vertical scroll tetap scroll halaman
          </p>
        </div>
      </div>
    </section>
  );
}
