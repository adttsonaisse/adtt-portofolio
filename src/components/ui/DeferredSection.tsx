import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
	id: string;
	minHeight: string;
	rootMargin?: string;
	children: ReactNode;
};

/**
 * Tunda download & mount section lazy sampai mendekati viewport (atau diakses via hash/klik nav).
 * Mempertahankan tinggi minimum agar tidak ada CLS dan anchor `#id` tetap valid sebelum mount.
 */
export default function DeferredSection({ id, minHeight, rootMargin = '200px 0px', children }: Props) {
	const hostRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(() => {
		if (typeof window === 'undefined') return true;
		return window.location.hash === `#${id}`;
	});

	useEffect(() => {
		if (mounted) return;
		const el = hostRef.current;
		if (!el) return;

		const activate = () => setMounted(true);

		const onHash = () => {
			if (window.location.hash === `#${id}`) activate();
		};
		const onClick = (e: MouseEvent) => {
			const link = (e.target as Element | null)?.closest?.(`a[href="#${id}"]`);
			if (link) activate();
		};

		window.addEventListener('hashchange', onHash);
		document.addEventListener('click', onClick, true);

		if (typeof IntersectionObserver === 'undefined') {
			activate();
			return () => {
				window.removeEventListener('hashchange', onHash);
				document.removeEventListener('click', onClick, true);
			};
		}

		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					activate();
					io.disconnect();
				}
			},
			{ rootMargin, threshold: 0 },
		);
		io.observe(el);

		return () => {
			io.disconnect();
			window.removeEventListener('hashchange', onHash);
			document.removeEventListener('click', onClick, true);
		};
	}, [id, mounted, rootMargin]);

	if (!mounted) {
		return <div ref={hostRef} id={id} aria-hidden="true" style={{ minHeight, scrollMarginTop: 80 }} />;
	}

	return (
		<Suspense fallback={<div id={id} aria-hidden="true" style={{ minHeight, scrollMarginTop: 80 }} />}>
			{children}
		</Suspense>
	);
}
