import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { site } from '../../data/site';
import { FaFacebook, FaGithub, FaLinkedinIn, FaTelegram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { FiLink, FiMail } from 'react-icons/fi';
import { BsInstagram } from 'react-icons/bs';
import { useTheme } from '../../hooks/useTheme';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import { useLanguage } from '../../hooks/useLanguage';
import { useMessages } from '../../lib/messages';
import { burst } from '../../lib/particles';

const SIZE = 76;
const RADIUS = 188;

type Node = { icon: React.ReactNode; bg: string; color: string; border: string; label: string; shadow: string };

const nodes: Node[] = [
  { icon: <FaWhatsapp size={20} />, bg: 'var(--surface)', color: '#25D366', border: 'rgba(37,211,102,0.40)', label: 'whatsapp', shadow: 'rgba(37,211,102,0.22)' },
  { icon: <FaGithub size={20} />, bg: 'var(--surface)', color: '#181717', border: 'rgba(24,23,23,0.22)', label: 'github', shadow: 'rgba(24,23,23,0.14)' },
  { icon: <FaTiktok size={20} />, bg: 'var(--surface)', color: '#000000', border: 'rgba(0,0,0,0.18)', label: 'tiktok', shadow: 'rgba(0,0,0,0.12)' },
  { icon: <FaFacebook size={20} />, bg: 'var(--surface)', color: '#1877F2', border: 'rgba(24,119,242,0.35)', label: 'facebook', shadow: 'rgba(24,119,242,0.20)' },
  { icon: <FaTelegram size={18} />, bg: 'var(--surface)', color: '#26A5E4', border: 'rgba(38,165,228,0.35)', label: 'telegram', shadow: 'rgba(38,165,228,0.20)' },
  { icon: <FaLinkedinIn size={18} />, bg: 'var(--surface)', color: '#0A66C2', border: 'rgba(10,102,194,0.35)', label: 'linkedin', shadow: 'rgba(10,102,194,0.20)' },
  { icon: <BsInstagram size={20} />, bg: 'var(--surface)', color: '#E4405F', border: 'rgba(228,64,95,0.35)', label: 'instagram', shadow: 'rgba(228,64,95,0.20)' },
  { icon: <FiMail size={18} />, bg: 'var(--surface)', color: '#EA4335', border: 'rgba(234,67,53,0.35)', label: 'mail', shadow: 'rgba(234,67,53,0.20)' },
];

const _link = <FiLink size={18} />;

export default function Contact() {
	const sectionRef = useSectionReveal<HTMLElement>();
	const [copied, setCopied] = useState(false);
	const groupRef = useRef<HTMLDivElement>(null);
	const { theme } = useTheme();
	const { locale } = useLanguage();
	const m = useMessages(locale);
	const email = site[locale].links.email.replace('mailto:', '');
	const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
	const toastTimer = useRef(0);
	const showToast = (msg: string) => {
		window.clearTimeout(toastTimer.current);
		setToast({ msg, key: Date.now() });
		toastTimer.current = window.setTimeout(() => setToast(null), 1600);
	};
	useEffect(() => () => window.clearTimeout(toastTimer.current), []);
	const copy = () => {
		try {
			navigator.clipboard?.writeText(email);
		} catch {
			/* abaikan */
		}
		setCopied(true);
		showToast(m.contact.copied);
		setTimeout(() => setCopied(false), 1800);
	};

  // href nyata per node. facebook ("Adttnewbie" = nama, bukan username),
  // telegram & linkedin menyusul — ketiganya tanpa href sampai URL pasti.
  const hrefByLabel: Record<string, string | undefined> = {
    whatsapp: 'https://wa.me/6283180830722',
    github: site[locale].links.github,
    tiktok: 'https://www.tiktok.com/@asanewbie',
    facebook: undefined,
    telegram: undefined,
    linkedin: site[locale].links.linkedin,
    instagram: 'https://www.instagram.com/adttsonaisse/',
    mail: site[locale].links.email,
  };
  // adapt hitam di dark mode biar tetap kontras (native GitHub/TikTok putih di dark)
  const displayNodes = nodes.map((n) => {
    if (theme === 'dark' && (n.label === 'github' || n.label === 'tiktok')) {
      return { ...n, color: '#ffffff', border: 'rgba(255,255,255,0.22)', shadow: 'rgba(255,255,255,0.12)' };
    }
    return n;
  });

  // smooth hover pause: hanya saat hover item (orbit-node), bukan hover area orbit kosong
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let target = 1;
    let current = 1;
    let raf = 0;
    let ticking = false;
    let hoveredCount = 0;

    const allAnims = () =>
      [
        ...Array.from(group.querySelectorAll<HTMLElement>('.orbit-rotor')),
        ...Array.from(group.querySelectorAll<HTMLElement>('.orbit-node')),
      ].flatMap((el) => (el.getAnimations ? [...el.getAnimations()] : []));

    const tick = () => {
      ticking = true;
      current += (target - current) * 0.06;
      if (Math.abs(target - current) < 0.01) current = target;
      for (const a of allAnims()) {
        try {
          (a as any).playbackRate = current;
        } catch {}
      }
      if (Math.abs(target - current) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        ticking = false;
      }
    };
    const enter = () => {
      hoveredCount++;
      target = 0;
      if (!ticking) tick();
    };
    const leave = () => {
      hoveredCount = Math.max(0, hoveredCount - 1);
      if (hoveredCount === 0) {
        target = 1;
        if (!ticking) tick();
      }
    };

    const items = Array.from(group.querySelectorAll<HTMLElement>('.orbit-node'));
    for (const el of items) {
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      el.addEventListener('focusin', enter as any);
      el.addEventListener('focusout', leave as any);
    }
    return () => {
      cancelAnimationFrame(raf);
      for (const el of items) {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
        el.removeEventListener('focusin', enter as any);
        el.removeEventListener('focusout', leave as any);
      }
    };
  }, []);

  // Magnetis playful: isi node tertarik ke kursor dalam radius,
  // kembali pegas saat kursor menjauh. Diterapkan ke .orbit-magnet
  // (bukan .orbit-node) agar tidak bentrok dengan animasi counter-rotate.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    const RADIUS_PX = 150;
    const PULL = 14;
    const pointer = { x: 0, y: 0, inside: false };
    const offs = new Map<Element, { x: number; y: number }>();
    let raf = 0;
    let visible = true;

    const loop = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      const magnets = group.querySelectorAll<HTMLElement>('.orbit-magnet');
      let settled = true;
      magnets.forEach((el) => {
        const cur = offs.get(el) ?? { x: 0, y: 0 };
        let tx = 0;
        let ty = 0;
        if (pointer.inside) {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = pointer.x - cx;
          const dy = pointer.y - cy;
          const dist = Math.hypot(dx, dy);
          if (dist > 1 && dist < RADIUS_PX) {
            const f = (1 - dist / RADIUS_PX) * PULL;
            tx = (dx / dist) * f;
            ty = (dy / dist) * f;
          }
        }
        cur.x += (tx - cur.x) * 0.18;
        cur.y += (ty - cur.y) * 0.18;
        if (Math.abs(tx - cur.x) > 0.1 || Math.abs(ty - cur.y) > 0.1) settled = false;
        offs.set(el, cur);
        el.style.transform = `translate(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px)`;
      });
      if (!settled || pointer.inside) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (!visible) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (pointer.inside) {
          kick();
        }
      },
      { threshold: 0 },
    );
    io.observe(group);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      kick();
    };
    const onLeave = () => {
      pointer.inside = false;
      kick();
    };
    group.addEventListener('pointermove', onMove, { passive: true });
    group.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      group.removeEventListener('pointermove', onMove);
      group.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section id="contact" ref={sectionRef} data-reveal className="py-10 md:py-14" style={{ scrollMarginTop: 80 }}>
      <div className="mx-auto flex w-full max-w-340 flex-col justify-center px-4 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-6 lg:gap-10">
          <div data-reveal-item>
            <p className="font-mono text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--fg-muted)' }}>
               {m.contact.label}
            </p>
            <h2
              className="mt-4 text-[2.55rem] leading-[0.9] tracking-[-0.04em] md:text-[3.6rem] lg:text-[4.4rem]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, color: 'var(--fg)' }}
            >
              <span className="block font-normal italic">{m.contact.heading}</span>
              <span className="block font-normal italic">{m.contact.subheading}</span>
            </h2>
            <p className="mt-5 max-w-105 text-sm leading-6" style={{ color: 'var(--fg-muted)' }}>
              {m.contact.pitch}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={site[locale].links.email}
                className="inline-flex items-center gap-3 rounded-full px-2 py-2 pr-6 text-sm font-semibold transition"
                style={{ background: 'var(--fg)', color: 'var(--bg)' }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
                  →
                </span>
                {m.contact.cta}
              </a>
              <button
                onClick={copy}
                className="inline-flex items-center rounded-full border px-5 py-3 text-sm font-medium transition"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--fg)' }}
              >
                {copied ? m.contact.copied : email}
              </button>
            </div>
          </div>

          <div ref={groupRef} data-reveal-item className="group relative mx-auto flex h-[420px] w-full max-w-[520px] items-center justify-center overflow-clip md:h-[500px] md:max-w-none">
            <div className="pointer-events-none absolute rounded-full border" style={{ width: RADIUS * 2, height: RADIUS * 2, borderColor: 'var(--border)', opacity: 0.9 }} />
            <div className="pointer-events-none absolute rounded-full border border-dashed" style={{ width: RADIUS * 2 + 46, height: RADIUS * 2 + 46, borderColor: 'var(--border)', opacity: 0.5 }} />
            <div className="pointer-events-none absolute rounded-full blur-3xl" style={{ width: 220, height: 220, background: 'radial-gradient(circle, rgba(88,85,246,0.14) 0%, transparent 70%)' }} aria-hidden />

            <div className="orbit-rotor absolute inset-0">
              {displayNodes.map((n, i) => {
                const angle = (i / displayNodes.length) * 360 - 90;
                const isSphere = n.icon === null;
                const href = hrefByLabel[n.label];
                const isMailTo = href?.startsWith('mailto:') ?? false;
                const onNodeClick = (e: React.MouseEvent) => {
                  burst(e.clientX, e.clientY, { count: 16 });
                };
                const nodeStyle: CSSProperties = {
                  width: SIZE,
                  height: SIZE,
                  minWidth: SIZE,
                  minHeight: SIZE,
                  background: n.bg,
                  color: n.color,
                  border: `1px solid ${n.border}`,
                  borderRadius: '50%',
                  aspectRatio: '1 / 1',
                  boxShadow: `0 8px 20px ${n.shadow}`,
                  cursor: href ? 'pointer' : 'default',
                };
                const inner = isSphere ? (
                  <span className="block h-full w-full rounded-full" style={{ background: 'var(--surface)', borderRadius: '50%', border: '1px dashed var(--border)' }} />
                ) : (
                  <span className="orbit-magnet inline-flex items-center justify-center will-change-transform">{n.icon}</span>
                );
                return (
                  <div
                    key={n.label}
                    className="absolute flex items-center justify-center"
                    style={{
                      width: SIZE,
                      height: SIZE,
                      left: '50%',
                      top: '50%',
                      marginLeft: -SIZE / 2,
                      marginTop: -SIZE / 2,
                      transform: `rotate(${angle}deg) translate(${RADIUS}px) rotate(${-angle}deg)`,
                    }}
                  >
                    {href ? (
                      <a
                        href={href}
                        target={isMailTo ? undefined : '_blank'}
                        rel={isMailTo ? undefined : 'noreferrer'}
                        className="orbit-node flex h-full w-full items-center justify-center rounded-full transition hover:scale-105"
                        style={nodeStyle}
                        aria-label={n.label}
                        onClick={onNodeClick}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div
                        className="orbit-node flex h-full w-full items-center justify-center rounded-full"
                        style={nodeStyle}
                        aria-label={n.label}
                        onClick={onNodeClick}
                      >
                        {inner}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <style>{`@keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes orbitCounter { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } } .orbit-rotor { animation: orbitSpin 42s linear infinite; } .orbit-node { animation: orbitCounter 42s linear infinite; } @media (prefers-reduced-motion: reduce) { .orbit-rotor, .orbit-node { animation: none !important; } }`}</style>
            <span className="hidden">{_link}</span>
            {/* Toast playful — mis. konfirmasi email tersalin. */}
            {toast && (
              <div
                key={toast.key}
                role="status"
                aria-live="polite"
                className="toast-pop absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.06em] whitespace-nowrap"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--fg)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
              >
                ✦ {toast.msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
