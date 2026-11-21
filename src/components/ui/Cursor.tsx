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

		const pos = { x: -100, y: -100 };
		const ringPos = { x: -100, y: -100 };
		let raf = 0;
		let visible = false;

		const loop = () => {
			raf = 0;
			if (document.hidden || !visible) return;
			const dx = pos.x - ringPos.x;
			const dy = pos.y - ringPos.y;
			ringPos.x += dx * 0.16;
			ringPos.y += dy * 0.16;
			const hot = ring.dataset.hot === '1';
			const s = hot ? 1.9 : 1;
			ring.style.transform = `translate3d(${ringPos.x.toFixed(1)}px, ${ringPos.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${s})`;
			if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15) {
				raf = requestAnimationFrame(loop);
			}
		};

		const kick = () => {
			if (!raf && visible && !document.hidden) {
				raf = requestAnimationFrame(loop);
			}
		};

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
			if (raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		};

		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') {
				hide();
				return;
			}
			if (!visible) {
				ringPos.x = e.clientX;
				ringPos.y = e.clientY;
			}
			pos.x = e.clientX;
			pos.y = e.clientY;
			show();
			dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
			kick();
		};

		const onOver = (e: MouseEvent) => {
			const t = e.target as Element | null;
			const hot = !!t?.closest?.(INTERACTIVE);
			const next = hot ? '1' : '';
			if (ring.dataset.hot !== next) {
				ring.dataset.hot = next;
				kick();
			}
		};

		document.addEventListener('pointermove', onMove, { passive: true });
		document.addEventListener('mouseover', onOver, { passive: true });
		document.documentElement.addEventListener('mouseleave', hide);

		const onVis = () => {
			if (document.hidden && raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		};
		document.addEventListener('visibilitychange', onVis);

		return () => {
			if (raf) cancelAnimationFrame(raf);
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
