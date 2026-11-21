import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import { IconMoon, IconSun } from './Icons';

export default function ThemeToggle() {
	const { theme, toggle } = useTheme();
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const tt = m.themeToggle;
	return (
		<button
			onClick={toggle}
			aria-label={theme === 'dark' ? tt.ariaDark : tt.ariaLight}
			className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors hover:opacity-90"
			style={{
				borderColor: 'var(--border)',
				background: 'var(--surface)',
				color: 'var(--fg)',
			}}
			title={theme === 'dark' ? tt.titleToLight : tt.titleToDark}
		>
			<span aria-hidden="true" className="inline-flex">
				{theme === 'dark' ? <IconMoon size={16} /> : <IconSun size={16} />}
			</span>
		</button>
	);
}
