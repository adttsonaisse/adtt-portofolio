import React, { useCallback, useEffect, useRef, useState } from 'react';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const hasIntroRef = useRef(false);
  const measuredRef = useRef(false);

  const measureCircles = useCallback(() => {
    circleRefs.current.forEach(circle => {
      if (!circle?.parentElement) return;
      const pill = circle.parentElement as HTMLElement;
      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      if (!w || !h) return;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      pill.style.setProperty('--pill-h', `${Math.round(h)}px`);
      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;
      circle.style.transformOrigin = `50% ${originY}px`;
    });
    measuredRef.current = true;
  }, []);

  // Tunda pembacaan getBoundingClientRect sampai browser idle (atau hover pertama)
  // agar tidak memicu forced layout reflow saat initial paint.
  useEffect(() => {
    measuredRef.current = false;
    let idleId = 0;
    let timerId = 0;
    const schedule = () => {
      const ric = (globalThis as typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }).requestIdleCallback;
      if (typeof ric === 'function') {
        idleId = ric(() => measureCircles(), { timeout: 600 });
      } else {
        timerId = globalThis.setTimeout(measureCircles, 120);
      }
    };
    schedule();
    const onResize = () => measureCircles();
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      const cic = (globalThis as typeof globalThis & {
        cancelIdleCallback?: (id: number) => void;
      }).cancelIdleCallback;
      if (idleId && typeof cic === 'function') {
        cic(idleId);
      }
      if (timerId) globalThis.clearTimeout(timerId);
    };
  }, [items, measureCircles]);

  // Intro jalan sekali saat mount pakai WAAPI (clip-path & transform: 0 CLS, 0 GSAP).
  useEffect(() => {
    if (!initialLoadAnimation || hasIntroRef.current) return;
    hasIntroRef.current = true;
    const logoEl = logoRef.current;
    const navItems = navItemsRef.current;
    const anims: Animation[] = [];

    if (logoEl && typeof logoEl.animate === 'function') {
      anims.push(
        logoEl.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
          duration: 500,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        })
      );
    }

    if (navItems && typeof navItems.animate === 'function') {
      anims.push(
        navItems.animate(
          [
            { transform: 'scale(0.92)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 },
          ],
          {
            duration: 420,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }
        )
      );
    }

    return () => {
      hasIntroRef.current = false;
      anims.forEach(a => a.cancel());
    };
  }, [initialLoadAnimation]);

  const handleEnter = () => {
    if (!measuredRef.current) measureCircles();
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img || typeof img.animate !== 'function') return;
    img.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
      duration: 240,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    onMobileMenuClick?.();
  };

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor,
    ['--nav-h']: '42px',
    ['--logo']: '36px',
    ['--pill-pad-x']: '18px',
    ['--pill-gap']: '3px'
  } as React.CSSProperties;

  return (
    <div className={`w-full ${className}`}>
      <nav
        className="relative w-full flex items-center justify-between box-border"
        aria-label="Primary"
        style={cssVars}
      >
        <a
          href={items?.[0]?.href || '#'}
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          ref={el => {
            logoRef.current = el;
          }}
          className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden shrink-0"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--base, #000)'
          }}
        >
          <img
            src={logo}
            alt={logoAlt}
            ref={logoImgRef}
            width={42}
            height={42}
            decoding="async"
            className="w-full h-full object-cover block"
          />
        </a>

        <div
          ref={navItemsRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center rounded-full hidden md:flex"
          style={{
            height: 'var(--nav-h)',
            background: 'transparent'
          }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-[3px] h-full"
            style={{ gap: 'var(--pill-gap)' }}
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href;

              const pillStyle: React.CSSProperties = {
                background: 'var(--pill-bg, #fff)',
                color: 'var(--pill-text, var(--base, #000))',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)'
              };

              return (
                <li key={item.href} role="none" className="relative flex h-full">
                  <a
                    role="menuitem"
                    href={item.href}
                    className="pill-nav-link relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[14px] leading-[0] uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer px-0"
                    style={pillStyle}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={handleEnter}
                    onFocus={handleEnter}
                  >
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                      style={{
                        background: 'var(--base, #000)',
                        width: '120px',
                        height: '120px',
                      }}
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack relative inline-block leading-[1] z-[2]">
                      <span className="pill-label relative z-[2] inline-block leading-[1]">
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                        style={{ color: 'var(--hover-text, #fff)' }}
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>
                  </a>
                  {isActive && (
                    <span
                      className="pointer-events-none absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
                      style={{ background: 'var(--base, #000)' }}
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative shrink-0"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--base, #000)'
          }}
        >
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center transition-transform duration-300 ease-out"
            style={{
              background: 'var(--pill-bg, #fff)',
              transform: isMobileMenuOpen ? 'translateY(3px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center transition-transform duration-300 ease-out"
            style={{
              background: 'var(--pill-bg, #fff)',
              transform: isMobileMenuOpen ? 'translateY(-3px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </nav>

      <div
        className="md:hidden absolute top-[3em] left-4 right-4 rounded-[20px] border shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[998] origin-top transition-[opacity,transform,visibility] duration-250 ease-out"
        style={{
          ...cssVars,
          background: 'var(--surface, #141416)',
          borderColor: 'var(--border)',
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          opacity: isMobileMenuOpen ? 1 : 0,
          transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(10px)',
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
        }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {items.map(item => {
            const defaultStyle: React.CSSProperties = {
              background: 'var(--pill-bg, #fff)',
              color: 'var(--pill-text, #fff)'
            };
            const hoverIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = 'var(--base)';
              e.currentTarget.style.color = 'var(--hover-text, #fff)';
            };
            const hoverOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = 'var(--pill-bg, #fff)';
              e.currentTarget.style.color = 'var(--pill-text, #fff)';
            };

            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block py-3 px-4 text-[14px] font-medium rounded-[50px] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                  style={defaultStyle}
                  onMouseEnter={hoverIn}
                  onMouseLeave={hoverOut}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
