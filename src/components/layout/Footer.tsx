import { FiArrowUp } from 'react-icons/fi';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import { site } from '../../data/site';

export default function Footer() {
	const { locale } = useLanguage();
	const m = useMessages(locale);

	return (
		<footer className="border-t py-8 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}>
			<div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 md:px-6">
				<p>© {new Date().getFullYear()} {site[locale].name}. {m.footer.credit}</p>
				{/* Ikon panah fungsional: kembali ke atas. */}
				<a href="#home" className="inline-flex items-center gap-1.5 font-medium transition hover:opacity-70" style={{ color: 'var(--fg)' }}>
					<FiArrowUp size={14} aria-hidden="true" /> {locale === 'id' ? 'Atas' : 'Top'}
				</a>
			</div>
		</footer>
	);
}
