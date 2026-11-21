import { useEffect, useRef } from 'react';

type Options = {
	/** posisi trigger viewport (dipertahankan untuk kompatibilitas API), default 'top 82%' */
	start?: string;
	/** jarak naik section (px), default 44 */
	y?: number;
	/** jarak naik item (px), default 32 */
	itemY?: number;
	/** durasi section (detik), default 0.9 */
	duration?: number;
	/** jeda stagger antar item (detik), default 0.14 */
	stagger?: number;
	/** kalau true, langsung main saat mount (untuk Hero) */
	immediate?: boolean;
};

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Stagger reveal per section memakai IntersectionObserver + Web Animations API native.
 * - 0KB GSAP/ScrollTrigger di initial bundle maupun di About/Skills/Contact
 * - jalan di GPU compositor, main sekali, tanpa ResizeObserver/ScrollTrigger.refresh()
 * - aman StrictMode dan tetap terlihat jika JS tidak jalan
 */
export function useSectionReveal<T extends HTMLElement = HTMLElement>(options: Options = {}) {
	const { y = 44, itemY = 32, duration = 0.9, stagger = 0.14, immediate = false } = options;
	const ref = useRef<T | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof el.animate !== 'function') return;

		const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal-item]'));
		const activeAnims: Animation[] = [];

		const playImmediate = () => {
			if (items.length === 0) return;
			items.forEach((item, i) => {
				activeAnims.push(
					item.animate(
						[
							{ opacity: 0, transform: `translate3d(0, ${itemY}px, 0)` },
							{ opacity: 1, transform: 'translate3d(0, 0, 0)' },
						],
						{
							duration: Math.round(duration * 1000),
							delay: 50 + Math.round(i * stagger * 1000),
							easing: EASE_OUT,
							fill: 'both',
						},
					),
				);
			});
		};

		if (immediate) {
			playImmediate();
			return () => {
				activeAnims.forEach((a) => a.cancel());
			};
		}

		let played = false;
		const playSection = () => {
			if (played) return;
			played = true;
			el.style.opacity = '';
			el.style.transform = '';
			items.forEach((item) => {
				item.style.opacity = '';
				item.style.transform = '';
			});
			activeAnims.push(
				el.animate(
					[
						{ opacity: 0, transform: `translate3d(0, ${y}px, 0)` },
						{ opacity: 1, transform: 'translate3d(0, 0, 0)' },
					],
					{ duration: Math.round(duration * 1000), easing: EASE_OUT, fill: 'both' },
				),
			);
			const itemBaseDelay = Math.max(0, Math.round((duration - 0.55) * 1000));
			items.forEach((item, i) => {
				activeAnims.push(
					item.animate(
						[
							{ opacity: 0, transform: `translate3d(0, ${itemY}px, 0)` },
							{ opacity: 1, transform: 'translate3d(0, 0, 0)' },
						],
						{
							duration: 700,
							delay: itemBaseDelay + Math.round(i * stagger * 1000),
							easing: EASE_OUT,
							fill: 'both',
						},
					),
				);
			});
		};

		// Jika sudah masuk viewport saat mount, langsung animasikan tanpa menunggu observer.
		const rect = el.getBoundingClientRect();
		if (rect.top < window.innerHeight * 0.9 || typeof IntersectionObserver === 'undefined') {
			playSection();
			return () => {
				activeAnims.forEach((a) => a.cancel());
			};
		}

		// Sembunyikan sebelum masuk viewport, lalu reveal sekali saat mendekati 82% viewport.
		el.style.opacity = '0';
		el.style.transform = `translate3d(0, ${y}px, 0)`;
		items.forEach((item) => {
			item.style.opacity = '0';
			item.style.transform = `translate3d(0, ${itemY}px, 0)`;
		});

		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					io.disconnect();
					playSection();
				}
			},
			{ rootMargin: '0px 0px -15% 0px', threshold: 0.01 },
		);
		io.observe(el);

		return () => {
			io.disconnect();
			activeAnims.forEach((a) => a.cancel());
			el.style.opacity = '';
			el.style.transform = '';
			items.forEach((item) => {
				item.style.opacity = '';
				item.style.transform = '';
			});
		};
	}, [y, itemY, duration, stagger, immediate]);

	return ref;
}

export default useSectionReveal;
