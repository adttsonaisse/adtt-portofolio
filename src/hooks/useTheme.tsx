import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };

const ThemeContext = createContext<Ctx>({ theme: 'dark', toggle: () => {}, setTheme: () => {} });

function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';
	try {
		const stored = localStorage.getItem('theme') as Theme | null;
		return stored ?? 'dark';
	} catch {
		return 'dark';
	}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
	}, [theme]);

	const setTheme = (value: Theme) => {
		document.documentElement.setAttribute('data-theme', value);
		localStorage.setItem('theme', value);
		setThemeState(value);
	};

	const toggle = () => {
		const current = (document.documentElement.getAttribute('data-theme') as Theme | null) ?? theme;
		const next: Theme = current === 'light' ? 'dark' : 'light';
		setTheme(next);
	};

	return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	return useContext(ThemeContext);
}
