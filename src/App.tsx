import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
// About EAGER — di dalamnya ada Lanyard 3D yang harus muncul cepat.
// Skills/Projects/Contact tetap lazy, masing-masing boundary sendiri supaya
// loading satu section tidak menarik section lain ke fallback.
import About from './components/sections/About';
const Skills = lazy(() => import('./components/sections/Skills'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Contact = lazy(() => import('./components/sections/Contact'));
import Splash from './components/ui/Splash';
import cardGLBUrl from './assets/lanyard/card.glb';
import lanyardTexUrl from './assets/lanyard/lanyard.png';

const SPLASH_KEY = 'splash-seen';

export default function App() {
	// Splash hanya sekali per session; skip total jika reduced-motion
	const [splashDone, setSplashDone] = useState(() => {
		if (typeof window === 'undefined') return true;
		try {
			if (sessionStorage.getItem(SPLASH_KEY)) return true;
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
		} catch {
			/* abaikan — tetap tampilkan splash */
		}
		return false;
	});

	const handleSplashDone = useCallback(() => {
		try {
			sessionStorage.setItem(SPLASH_KEY, '1');
		} catch {
			/* abaikan */
		}
		setSplashDone(true);
	}, []);

	// Preload gambar Hero + logo + aset Lanyard selama splash tampil, supaya
	// saat Hero/About mount tidak ada decode dingin yang bikin jank.
	// card.glb di-warm via fetch (HTTP cache) tanpa menarik drei ke chunk utama.
	useEffect(() => {
		const srcs = ['/logo.png', '/adtt-600.webp', '/adtt.webp', '/lanyard-biodata-front.png'];
		srcs.forEach((src) => {
			const img = new Image();
			img.decoding = 'async';
			img.src = src;
		});
		[lanyardTexUrl, cardGLBUrl].forEach((url) => {
			try {
				fetch(url, { credentials: 'same-origin' }).catch(() => {});
			} catch {
				/* abaikan */
			}
		});
	}, []);

	// kunci scroll selama splash tampil
	useEffect(() => {
		if (splashDone) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	}, [splashDone]);

	return (
		<>
			{!splashDone && <Splash onDone={handleSplashDone} />}
			{/* konten di-mount setelah splash selesai supaya intro Hero
			    dan ScrollTrigger section mulai fresh, bukan di balik splash */}
			{splashDone && (
				<>
					<a
						href="#main"
						className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
					>
						Skip to content
					</a>
					<Header />
					<main id="main">
						<Hero />
						<About />
						<Suspense
							fallback={<div aria-hidden="true" className="min-h-[60vh] w-full animate-pulse" style={{ background: 'transparent' }} />}
						>
							<Skills />
						</Suspense>
						<Suspense
							fallback={<div aria-hidden="true" className="min-h-[60vh] w-full animate-pulse" style={{ background: 'transparent' }} />}
						>
							<Projects />
						</Suspense>
						<Suspense
							fallback={<div aria-hidden="true" className="min-h-[40vh] w-full animate-pulse" style={{ background: 'transparent' }} />}
						>
							<Contact />
						</Suspense>
					</main>
					<Footer />
				</>
			)}
		</>
	);
}
