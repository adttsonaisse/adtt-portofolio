import { useEffect, useRef } from 'react';

export function useMagnet<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

		let resetTimer = 0;
		const onMove = (e: MouseEvent) => {
			const rect = node.getBoundingClientRect();
			const x = e.clientX - rect.left - rect.width / 2;
			const y = e.clientY - rect.top - rect.height / 2;
			node.style.translate = `${(x * 0.15).toFixed(2)}px ${(y * 0.15).toFixed(2)}px`;
		};
		const onLeave = () => {
			node.style.transition = 'translate 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
			node.style.translate = '0px 0px';
			window.clearTimeout(resetTimer);
			resetTimer = window.setTimeout(() => {
				node.style.transition = '';
				node.style.translate = '';
			}, 420);
		};
		const onEnter = () => {
			window.clearTimeout(resetTimer);
			node.style.transition = 'translate 0.15s ease-out';
		};

		node.addEventListener('mousemove', onMove);
		node.addEventListener('mouseleave', onLeave);
		node.addEventListener('mouseenter', onEnter);
		return () => {
			window.clearTimeout(resetTimer);
			node.removeEventListener('mousemove', onMove);
			node.removeEventListener('mouseleave', onLeave);
			node.removeEventListener('mouseenter', onEnter);
		};
	}, []);
	return ref;
}
