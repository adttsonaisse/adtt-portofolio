'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from '../types/i18n';
import { messages } from '../lib/messages';

const STORAGE_KEY = 'locale';

const isLocale = (v: unknown): v is Locale => v === 'en' || v === 'id';

const detectLocale = (): Locale => {
	if (typeof window === 'undefined') return 'en';
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (isLocale(stored)) return stored;
		const nav = window.navigator.language.toLowerCase();
		if (nav.startsWith('id')) return 'id';
	} catch {
		/* abaikan — fallback ke en */
	}
	return 'en';
};

const applyLocale = (locale: Locale) => {
	if (typeof window === 'undefined') return;
	document.documentElement.setAttribute('lang', locale);
	document.title = messages[locale].meta.title;
	let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
	if (!desc) {
		desc = document.createElement('meta');
		desc.name = 'description';
		document.head.appendChild(desc);
	}
	desc.content = messages[locale].meta.description;
};

interface LanguageContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function useLanguage() {
	const ctx = useContext(LanguageContext);
	if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
	return ctx;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(detectLocale);

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next);
		try {
			window.localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* abaikan — mode privat */
		}
		applyLocale(next);
	}, []);

	const toggleLocale = useCallback(() => {
		setLocaleState((prev) => {
			const next: Locale = prev === 'en' ? 'id' : 'en';
			try {
				window.localStorage.setItem(STORAGE_KEY, next);
			} catch {
				/* abaikan */
			}
			applyLocale(next);
			return next;
		});
	}, []);

	useEffect(() => {
		applyLocale(locale);
	}, [locale]);

	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === STORAGE_KEY && isLocale(e.newValue)) setLocaleState(e.newValue);
		};
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);

	const value = useMemo(() => ({ locale, setLocale, toggleLocale }), [locale, setLocale, toggleLocale]);

	return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
