import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]';

/**
 * Kursor kustom: dot + ring yang membuntuti.
 * - Hanya pointer halus (hover:hover + pointer:fine), mati total di touch & reduced-motion.
 * - Kursor native tetap tampil (aman untuk usability); ring membesar di elemen interaktif.
 * - Sembunyi saat mouse keluar jendela.
 */
export default function Cursor() {
	const dotRef = useRef<HTMLDivElement>(null);
	const ringRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const dot = dotRef.current;
		const ring = ringRef.current;
		if (!dot || !ring) return;
		if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const pos = { x: -100, y: -100 };
		const ringPos = { x: -100, y: -100 };
		let raf = 0;
		let visible = false;

		const show = () => {
			if (visible) return;
			visible = true;
			dot.style.opacity = '1';
			ring.style.opacity = '1';
		};
		const hide = () => {
			if (!visible) return;
			visible = false;
			dot.style.opacity = '0';
			ring.style.opacity = '0';
		};

		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') {
				hide();
				return;
			}
			pos.x = e.clientX;
			pos.y = e.clientY;
			show();
			dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
		};

		const onOver = (e: MouseEvent) => {
			const t = e.target as Element | null;
			const hot = !!t?.closest?.(INTERACTIVE);
			ring.dataset.hot = hot ? '1' : '';
		};

		const loop = () => {
			ringPos.x += (pos.x - ringPos.x) * 0.16;
			ringPos.y += (pos.y - ringPos.y) * 0.16;
			const hot = ring.dataset.hot === '1';
			const s = hot ? 1.9 : 1;
			ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%) scale(${s})`;
			raf = requestAnimationFrame(loop);
		};

		document.addEventListener('pointermove', onMove, { passive: true });
		document.addEventListener('mouseover', onOver, { passive: true });
		document.documentElement.addEventListener('mouseleave', hide);
		raf = requestAnimationFrame(loop);

		// Pause saat tab disembunyikan — hemat baterai.
		const onVis = () => {
			if (document.hidden) {
				cancelAnimationFrame(raf);
				raf = 0;
			} else if (!raf) {
				raf = requestAnimationFrame(loop);
			}
		};
		document.addEventListener('visibilitychange', onVis);

		return () => {
			cancelAnimationFrame(raf);
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('mouseover', onOver);
			document.documentElement.removeEventListener('mouseleave', hide);
			document.removeEventListener('visibilitychange', onVis);
		};
	}, []);

	return (
		<>
			<div ref={dotRef} className="cursor-dot" aria-hidden="true" />
			<div ref={ringRef} className="cursor-ring" aria-hidden="true" />
		</>
	);
}
