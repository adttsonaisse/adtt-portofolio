import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function IconGitHub({ size = 15, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M12 0.3a12 12 0 0 0-3.79 23.39c0.6 0.11 0.82-0.26 0.82-0.58v-2.03c-3.34 0.73-4.04-1.61-4.04-1.61-0.55-1.39-1.33-1.76-1.33-1.76-1.09-0.75 0.08-0.73 0.08-0.73 1.2 0.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 0.11-0.78 0.42-1.3 0.76-1.6-2.67-0.3-5.47-1.33-5.47-5.93 0-1.31 0.47-2.38 1.24-3.22-0.12-0.3-0.54-1.52 0.12-3.18 0 0 1.01-0.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23 0.66 1.66 0.24 2.88 0.12 3.18 0.77 0.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92 0.43 0.37 0.81 1.1 0.81 2.22v3.29c0 0.32 0.22 0.69 0.82 0.58A12 12 0 0 0 12 0.3Z" />
		</svg>
	);
}

export function IconLinkedIn({ size = 15, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M4.98 3.5a2.49 2.49 0 1 1 0 4.98 2.49 2.49 0 0 1 0-4.98ZM3 9h3.96v12H3V9Zm6.32 0h3.8v1.64h0.05c0.53-1 1.82-2.06 3.75-2.06 4.01 0 4.75 2.64 4.75 6.07V21h-3.96v-5.63c0-1.34-0.02-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97V21H9.32V9Z" />
		</svg>
	);
}

export function IconMail({ size = 15, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
			<rect x="2" y="4" width="20" height="16" rx="2" />
			<path d="m22 6-10 7L2 6" />
		</svg>
	);
}

export function IconGlobe({ size = 14, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
			<circle cx="12" cy="12" r="10" />
			<line x1="2" y1="12" x2="22" y2="12" />
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</svg>
	);
}

export function IconChevronDown({ size = 14, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
			<polyline points="6 9 12 15 18 9" />
		</svg>
	);
}

export function IconCheck({ size = 14, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

export function IconSun({ size = 16, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
			<circle cx="12" cy="12" r="5" />
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</svg>
	);
}

export function IconMoon({ size = 16, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	);
}

export function IconArrowUp({ size = 14, ...props }: IconProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
			<line x1="12" y1="19" x2="12" y2="5" />
			<polyline points="5 12 12 5 19 12" />
		</svg>
	);
}
