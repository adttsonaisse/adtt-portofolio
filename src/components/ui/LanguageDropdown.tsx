import { useEffect, useId, useRef, useState } from 'react';
import { FiCheck, FiChevronDown, FiGlobe } from 'react-icons/fi';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import type { Locale } from '../../types/i18n';

const OPTIONS: { value: Locale; code: 'EN' | 'ID' }[] = [
	{ value: 'en', code: 'EN' },
	{ value: 'id', code: 'ID' },
];

export default function LanguageDropdown({ compact = false }: { compact?: boolean }) {
	const { locale, setLocale } = useLanguage();
	const m = useMessages(locale);
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const listId = useId();
	const activeIndex = OPTIONS.findIndex((o) => o.value === locale);

	const labelFor = (value: Locale) => (value === 'en' ? m.nav.english : m.nav.indonesian);

	useEffect(() => {
		if (!open) return;
		const onPointer = (e: PointerEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('pointerdown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [open ]);

	const choose = (value: Locale) => {
		if (value !== locale) setLocale(value);
		setOpen(false);
	};

	const onButtonKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			setOpen((v) => !v);
		}
	};

	const onOptionKeyDown = (e: React.KeyboardEvent, value: Locale) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			choose(value);
		}
	};

	return (
		<div ref={rootRef} className="relative">
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-label={`${m.nav.language} — ${m.nav.currentLanguage}: ${labelFor(locale)}`}
				title={m.nav.language}
				onClick={() => setOpen((v) => !v)}
				onKeyDown={onButtonKeyDown}
				className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition hover:opacity-80 ${
					compact ? 'h-8 px-2.5 text-[10px]' : 'h-9 px-3 text-xs'
				}`}
				style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--fg)' }}
			>
				<FiGlobe size={compact ? 12 : 14} aria-hidden="true" />
				<span aria-hidden="true">{locale === 'en' ? 'EN' : 'ID'}</span>
				<FiChevronDown
					size={compact ? 12 : 14}
					aria-hidden="true"
					className="transition-transform"
					style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
				/>
			</button>

			{open && (
				<ul
					id={listId}
					role="listbox"
					aria-label={m.nav.language}
					className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border p-1 shadow-xl"
					style={{
						borderColor: 'var(--border)',
						background: 'var(--surface)',
						boxShadow: '0 16px 40px rgba(0,0,0,0.16)',
					}}
				>
					{OPTIONS.map((opt, i) => {
						const selected = opt.value === locale;
						return (
							<li key={opt.value} role="presentation">
								<button
									type="button"
									role="option"
									aria-selected={selected}
									tabIndex={i === activeIndex || (!selected && i === 0) ? 0 : -1}
									onClick={() => choose(opt.value)}
									onKeyDown={(e) => onOptionKeyDown(e, opt.value)}
									className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition"
									style={{
										background: selected ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent',
										color: 'var(--fg)',
									}}
								>
									<span className="flex items-center gap-2">
										<span
											className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
											style={{
												background: 'var(--color-primary)',
												color: '#fff',
											}}
											aria-hidden="true"
										>
											{opt.code}
										</span>
										{labelFor(opt.value)}
									</span>
									{selected && <FiCheck size={14} aria-hidden="true" style={{ color: 'var(--color-primary)' }} />}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
