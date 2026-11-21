import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import DeferredSection from './components/ui/DeferredSection';
import { useLanguage } from './hooks/useLanguage';
import { useMessages } from './lib/messages';
import Splash from './components/ui/Splash';
import { begin, trackImage } from './lib/loadProgress';

const About = lazy(() => import('./components/sections/About'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Contact = lazy(() => import('./components/sections/Contact'));
const Cursor = lazy(() => import('./components/ui/Cursor'));

const SPLASH_KEY = 'splash-seen';

export default function App() {
	const { locale } = useLanguage();
	const m = useMessages(locale);
	// Splash hanya sekali per session
	const [splashDone, setSplashDone] = useState(() => {
		if (typeof window === 'undefined') return true;
		try {
			if (sessionStorage.getItem(SPLASH_KEY)) return true;
		} catch {
			/* abaikan — tetap tampilkan splash */
		}
		return false;
	});
	// Cursor kustom hanya dimuat di desktop pointer halus saat mouse pertama bergerak.
	const [cursorEnabled, setCursorEnabled] = useState(false);

	const handleSplashDone = useCallback(() => {
		try {
			sessionStorage.setItem(SPLASH_KEY, '1');
		} catch {
			/* abaikan */
		}
		setSplashDone(true);
	}, []);

	// Pantau logo + foto Hero asli yang dipilih <picture> (AVIF/WebP) tanpa fetch duplikat.
	useEffect(() => {
		begin([{ url: '/logo.webp', mode: 'img' }]);
		trackImage('hero-portrait', document.querySelector<HTMLImageElement>('#home img.hero-base'));
	}, []);

	// Aktifkan Cursor lazy hanya pada mouse desktop — nol byte di mobile/touch.
	useEffect(() => {
		if (cursorEnabled) return;
		if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
		const onMove = (e: PointerEvent) => {
			if (e.pointerType === 'mouse') setCursorEnabled(true);
		};
		window.addEventListener('pointermove', onMove, { passive: true, once: true });
		return () => window.removeEventListener('pointermove', onMove);
	}, [cursorEnabled]);

	// kunci scroll selama splash tampil (scrollbar-gutter: stable mencegah layout shift)
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
			{cursorEnabled && (
				<Suspense fallback={null}>
					<Cursor />
				</Suspense>
			)}
			{!splashDone && <Splash onDone={handleSplashDone} />}
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
			>
				{m.nav.skip}
			</a>
			<Header />
			<main id="main">
				<Hero />
				<DeferredSection id="about" minHeight="660px" rootMargin="150px 0px">
					<About />
				</DeferredSection>
				<DeferredSection id="skills" minHeight="520px">
					<Skills />
				</DeferredSection>
				<DeferredSection id="projects" minHeight="740px">
					<Projects />
				</DeferredSection>
				<DeferredSection id="contact" minHeight="540px">
					<Contact />
				</DeferredSection>
			</main>
			<Footer />
		</>
	);
}
