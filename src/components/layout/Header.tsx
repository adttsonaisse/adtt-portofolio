import { useEffect, useMemo, useState } from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageDropdown from '../ui/LanguageDropdown';
import PillNav from '../ui/PillNav';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';

// pakai logo dari public/logo.png — display 1:1 via PillNav container
const logoDataUri = '/logo.png';

export default function Header() {
	const { theme } = useTheme();
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const [activeHref, setActiveHref] = useState('#home');

	// Stabilkan identitas array — kalau inline, tiap render (mis. activeHref
	// berubah saat scroll) bikin array baru dan memicu efek intro PillNav ulang.
	const links = useMemo(
		() => [
			{ href: '#home', label: m.header.home },
			{ href: '#about', label: m.header.about },
			{ href: '#skills', label: m.header.service },
			{ href: '#projects', label: m.header.portfolio },
			{ href: '#contact', label: m.header.contact },
		],
		[m.header.home, m.header.about, m.header.service, m.header.portfolio, m.header.contact],
	);

  useEffect(() => {
    const hrefs = ['#home', '#about', '#skills', '#projects', '#contact'];
    const onHash = () => setActiveHref(window.location.hash || '#home');
    window.addEventListener('hashchange', onHash);
    // also track scroll to update active based on visible section
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    const observed = new Set<Element>();
    const observeAll = () => {
      hrefs.forEach((href) => {
        const el = document.querySelector(href);
        if (el && !observed.has(el)) {
          observed.add(el);
          observer.observe(el);
        }
      });
    };
    observeAll();
    // Skills/Projects/Contact lazy-load setelah Header mount — pantauDOM sampai semua section muncul.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('hashchange', onHash);
      mo.disconnect();
      observer.disconnect();
    };
  }, []);

	const isLight = theme === 'light';
	const baseColor = '#5855F6';
	const pillColor = isLight ? '#ffffff' : '#141416';
	const pillTextColor = isLight ? '#111111' : '#fafafa';
	const hoveredPillTextColor = '#ffffff';

  return (
    <header
      className="sticky top-0 z-50 bg-transparent"
      style={{
        background: 'transparent',
        borderColor: 'transparent',
      }}
    >
      <nav className="relative mx-auto flex max-w-[1360px] items-center gap-3 px-4 py-3 md:px-6">
        <PillNav
          logo={logoDataUri}
          logoAlt="AD"
          items={links}
          activeHref={activeHref}
          ease="power2.easeOut"
          baseColor={baseColor}
          pillColor={pillColor}
          pillTextColor={pillTextColor}
          hoveredPillTextColor={hoveredPillTextColor}
          initialLoadAnimation
          className="flex-1 min-w-0"
        />

        <div className="hidden items-center gap-3 md:flex absolute right-6 top-1/2 -translate-y-1/2 z-10">
          <LanguageDropdown />
          <ThemeToggle />
          <a
            href="#contact"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-[0.96]"
            style={{ background: 'var(--color-primary)', boxShadow: 'var(--shadow-lift)' }}
          >
            {m.header.getInTouch}
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden shrink-0">
          <LanguageDropdown compact />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
