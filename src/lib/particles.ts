/**
 * Semburan partikel ringan untuk momen playful (klik segel, node orbit, dsb).
 * Satu <canvas> fixed per burst, animasi ~700ms, lalu dihapus otomatis.
 * No-op saat prefers-reduced-motion. Tanpa dependensi.
 */

type BurstOptions = {
	count?: number;
	colors?: string[];
	size?: [number, number];
	speed?: [number, number];
	gravity?: number;
	zIndex?: number;
};

const DEFAULT_COLORS = ['#5855F6', '#818CF8', '#fafafa'];

export function burst(x: number, y: number, opts: BurstOptions = {}): () => void {
	if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

	const { count = 18, colors = DEFAULT_COLORS, size = [2, 5], speed = [120, 340], gravity = 520, zIndex = 300 } = opts;

	const canvas = document.createElement('canvas');
	const SPREAD = 160;
	canvas.width = SPREAD * 2;
	canvas.height = SPREAD * 2;
	canvas.style.cssText = `position:fixed;left:${x - SPREAD}px;top:${y - SPREAD}px;width:${SPREAD * 2}px;height:${SPREAD * 2}px;pointer-events:none;z-index:${zIndex};`;
	canvas.setAttribute('aria-hidden', 'true');
	document.body.appendChild(canvas);

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		canvas.remove();
		return () => {};
	}

	type P = { px: number; py: number; vx: number; vy: number; r: number; c: string; rot: number; vr: number; life: number };
	const parts: P[] = Array.from({ length: count }, () => {
		const a = Math.random() * Math.PI * 2;
		const v = speed[0] + Math.random() * (speed[1] - speed[0]);
		return {
			px: SPREAD,
			py: SPREAD,
			vx: Math.cos(a) * v,
			vy: Math.sin(a) * v - 120,
			r: size[0] + Math.random() * (size[1] - size[0]),
			c: colors[(Math.random() * colors.length) | 0],
			rot: Math.random() * Math.PI,
			vr: (Math.random() - 0.5) * 12,
			life: 1,
		};
	});

	let raf = 0;
	let last = performance.now();
	let alive = true;
	const DUR = 0.7;

	const frame = (now: number) => {
		if (!alive) return;
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		let any = false;
		for (const p of parts) {
			p.vy += gravity * dt;
			p.px += p.vx * dt;
			p.py += p.vy * dt;
			p.rot += p.vr * dt;
			p.life -= dt / DUR;
			if (p.life <= 0) continue;
			any = true;
			ctx.save();
			ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
			ctx.translate(p.px, p.py);
			ctx.rotate(p.rot);
			ctx.fillStyle = p.c;
			ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.62);
			ctx.restore();
		}
		if (!any) {
			cleanup();
			return;
		}
		raf = requestAnimationFrame(frame);
	};

	const cleanup = () => {
		alive = false;
		cancelAnimationFrame(raf);
		canvas.remove();
	};

	raf = requestAnimationFrame(frame);
	return cleanup;
}
