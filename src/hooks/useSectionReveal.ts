import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Options = {
	/** posisi trigger ScrollTrigger, default 'top 82%' */
	start?: string;
	/** jarak naik section (px), default 44 */
	y?: number;
	/** jarak naik item (px), default 32 */
	itemY?: number;
	/** durasi section, default 0.9 */
	duration?: number;
	/** jeda stagger antar item, default 0.14 */
	stagger?: number;
	/** kalau true, langsung main saat mount (untuk Hero) */
	immediate?: boolean;
};

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Stagger reveal per section pakai GSAP ScrollTrigger.
 * - section fade + naik, lalu [data-reveal-item] muncul berurutan
 * - main sekali (once: true), aman StrictMode, hormati reduced-motion
 * - initial state di-set via gsap.set (bukan CSS) supaya tanpa JS konten tetap kelihatan
 *
 * @example
 * const ref = useSectionReveal<HTMLElement>();
 * <section ref={ref} data-reveal>...<h2 data-reveal-item>...</h2></section>
 */
export function useSectionReveal<T extends HTMLElement = HTMLElement>(options: Options = {}) {
	const { start = 'top 82%', y = 44, itemY = 32, duration = 0.9, stagger = 0.14, immediate = false } = options;
	const ref = useRef<T | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia(REDUCED_QUERY).matches) return;

		const items = el.querySelectorAll('[data-reveal-item]');
		const ctx = gsap.context(() => {
			// Path immediate (Hero): animasikan item saja, bukan whole section.
			// Menghindari repaint 1 layer raksasa tepat saat entry setelah splash.
			if (immediate) {
				if (items.length === 0) return;
				gsap.set(items, { autoAlpha: 0, y: itemY });
				gsap.to(items, {
					autoAlpha: 1,
					y: 0,
					duration,
					stagger,
					ease: 'power3.out',
					overwrite: 'auto',
					// Mulai setelah 2 frame biar decode gambar + paint pertama selesai dulu.
					delay: 0.05,
					onComplete: () => gsap.set(items, { clearProps: 'will-change,transform,opacity,visibility' }),
				});
				return;
			}

			gsap.set(el, { autoAlpha: 0, y });
			if (items.length > 0) gsap.set(items, { autoAlpha: 0, y: itemY });

			const tl = gsap.timeline({
				defaults: { ease: 'power3.out', overwrite: 'auto' },
				scrollTrigger: { trigger: el, start, once: true },
			});
			tl.to(el, { autoAlpha: 1, y: 0, duration });
			if (items.length > 0) {
				tl.to(items, { autoAlpha: 1, y: 0, duration: 0.7, stagger }, '-=0.55');
			}
			tl.set([el, ...Array.from(items)], { clearProps: 'will-change' });
		}, el);

		// Section lazy (Skills/Projects/Contact) mengubah tinggi halaman saat
		// chunk-nya resolve — hitung ulang posisi semua trigger di frame idle
		// berikutnya supaya tidak ada section yang stuck invisible.
		const raf = requestAnimationFrame(() => {
			try {
				ScrollTrigger.refresh();
			} catch {
				/* abaikan */
			}
		});

		return () => {
			cancelAnimationFrame(raf);
			ctx.revert();
		};
	}, [start, y, itemY, duration, stagger, immediate]);

	return ref;
}

export default useSectionReveal;
