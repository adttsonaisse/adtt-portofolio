/**
 * Progress loading aset nyata untuk Splash.
 * App mendaftarkan aset (img/fetch); Splash berlangganan progress 0..1.
 * Tanpa dependensi. Aman dipanggil berkali-kali (idempoten per URL).
 */

type Listener = (p: number) => void;

const listeners = new Set<Listener>();
const seen = new Set<string>();
let total = 0;
let done = 0;

function emit() {
	const p = total === 0 ? 1 : Math.min(1, done / total);
	for (const fn of listeners) {
		try {
			fn(p);
		} catch {
			/* abaikan */
		}
	}
}

function markDone(url: string) {
	if (seen.has(url)) return;
	seen.add(url);
	done += 1;
	emit();
}

export type AssetJob = { url: string; mode: 'img' | 'fetch' };

export function begin(jobs: AssetJob[]) {
	const fresh = jobs.filter((j) => !seen.has(j.url));
	if (fresh.length === 0) {
		emit();
		return;
	}
	total += fresh.length;
	emit();
	for (const { url, mode } of fresh) {
		try {
			if (mode === 'img') {
				const img = new Image();
				img.decoding = 'async';
				img.onload = () => markDone(url);
				img.onerror = () => markDone(url);
				img.src = url;
			} else {
				fetch(url, { credentials: 'same-origin' })
					.then(() => markDone(url))
					.catch(() => markDone(url));
			}
		} catch {
			markDone(url);
		}
	}
}

export function getProgress(): number {
	return total === 0 ? 1 : Math.min(1, done / total);
}

export function subscribe(fn: Listener): () => void {
	listeners.add(fn);
	fn(getProgress());
	return () => {
		listeners.delete(fn);
	};
}
