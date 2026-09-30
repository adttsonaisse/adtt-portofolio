import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

export interface DepthTextProps {
  text?: string;
  layers?: number;
  depth?: number;
  faceColor?: string;
  depthColor?: string;
  tilt?: number;
  pointerTracking?: boolean;
  smoothing?: number;
  perspective?: number;
  autoOrbit?: boolean;
  orbitSpeed?: number;
  fontSize?: string;
  fontWeight?: number | string;
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Naikkan untuk memicu "kick" playful (gelombang). 0 = diam. */
  pulseKey?: number;
  /** Tunda kick (ms) — untuk stagger per huruf. */
  pulseDelay?: number;
}

interface DepthLayer {
  index: number;
  color: string;
  transform: string;
}

const MAX_LAYERS = 64;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const getLayerColor = (faceColor: string, depthColor: string, index: number, total: number): string => {
  const progress = total <= 1 ? 1 : index / total;
  const eased = progress * progress;
  const faceMix = Math.round((1 - eased) * 72 + 4);
  return `color-mix(in srgb, ${faceColor} ${faceMix}%, ${depthColor})`;
};

const getTransform = (rotateX: number, rotateY: number): string =>
  `rotateX(${rotateX.toFixed(3)}deg) rotateY(${rotateY.toFixed(3)}deg)`;

const DepthText = ({
  text = 'Elevate',
  layers = 34,
  depth = 2.4,
  faceColor = '#f8fafc',
  depthColor = '#7c3aed',
  tilt = 7.5,
  pointerTracking = true,
  smoothing = 0.14,
  perspective = 900,
  autoOrbit = true,
  orbitSpeed = 0.35,
  fontSize = 'clamp(3rem, 12vw, 7rem)',
  fontWeight = 900,
  shadow = true,
  className = '',
  style = {},
  pulseKey = 0,
  pulseDelay = 0,
}: DepthTextProps) => {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const stageRef = useRef<HTMLSpanElement | null>(null);
  const [isLite, setIsLite] = useState(false);
  // Kick playful: target + expiry yang dibaca loop rAF.
  const kickRef = useRef({ x: 0, y: 0, until: 0 });

  // Deteksi mobile / pointer kasar sekali — lapis dipangkas adaptif biar ringan.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)');
    const sync = () => setIsLite(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  const safeLayers = clamp(Math.round(Number(layers) || 1), 2, MAX_LAYERS);
  // Desktop: cap 14 lapis, mobile/coarse: cap 8 lapis. Visual tetap tebal, cost turun ~50-70%.
  const effectiveLayers = isLite ? Math.min(safeLayers, 8) : Math.min(safeLayers, 14);
  const safeDepth = clamp(Number(depth) || 0, 0, 12);
  const safeTilt = clamp(Number(tilt) || 0, 0, 12);
  const safeSmoothing = clamp(Number(smoothing) || 0.14, 0.02, 0.35);
  const safePerspective = clamp(Number(perspective) || 900, 300, 2000);
  const safeOrbitSpeed = clamp(Number(orbitSpeed) || 0, 0, 2);

  const baseRotation = useMemo(() => ({ x: -safeTilt * 0.32, y: safeTilt * 0.42 }), [safeTilt]);

  const depthLayers = useMemo<DepthLayer[]>(
    () =>
      Array.from({ length: effectiveLayers }, (_, layerIndex) => {
        const index = effectiveLayers - layerIndex;
        return {
          index,
          color: getLayerColor(faceColor, depthColor, index, effectiveLayers),
          transform: `translateZ(${-index * safeDepth}px)`
        };
      }),
    [effectiveLayers, safeDepth, faceColor, depthColor]
  );

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || typeof window === 'undefined') return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const canTrackPointer = pointerTracking && finePointer && !reducedMotion;

    let frameId = 0;
    let activePointer = false;
    let inViewport = true;
    const startTime = performance.now();
    const current = { ...baseRotation };
    const target = { ...baseRotation };

    const applyTransform = () => {
      stage.style.transform = getTransform(current.x, current.y);
    };

    if (reducedMotion) {
      stage.style.transform = getTransform(baseRotation.x, baseRotation.y);
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      activePointer = true;
      const x = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.8), -1, 1);
      const y = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.8), -1, 1);

      target.x = baseRotation.x - y * safeTilt;
      target.y = baseRotation.y + x * safeTilt;
    };

    const handlePointerLeave = () => {
      activePointer = false;
      target.x = baseRotation.x;
      target.y = baseRotation.y;
    };

    // Pointer hanya di root (bukan window) — hemat event + tidak ganggu Hero spotlight.
    if (canTrackPointer) {
      root.addEventListener('pointermove', handlePointerMove, { passive: true });
      root.addEventListener('pointerleave', handlePointerLeave);
      window.addEventListener('blur', handlePointerLeave);
    }

    // Pause rAF saat off-screen / tab hidden — penghemat utama saat scroll.
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              inViewport = entries[0]?.isIntersecting ?? true;
            },
            { threshold: 0 }
          )
        : null;
    io?.observe(root);

    const onVisibility = () => {
      // diamkan orbit sejenak saat tab kembali biar tidak lompat
      if (!document.hidden) activePointer = false;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const tick = (now: number) => {
      // Skip kerja saat tidak terlihat — cukup schedule frame berikutnya.
      if (!inViewport || document.hidden) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      const kicking = now < kickRef.current.until;
      if (kicking) {
        target.x = kickRef.current.x;
        target.y = kickRef.current.y;
      } else if ((!canTrackPointer || !activePointer) && autoOrbit) {
        const elapsed = (now - startTime) / 1000;
        const orbit = elapsed * safeOrbitSpeed * Math.PI * 2;
        const fallbackAmount = canTrackPointer ? 0.18 : 0.55;
        target.x = baseRotation.x + Math.sin(orbit) * safeTilt * fallbackAmount;
        target.y = baseRotation.y + Math.cos(orbit * 0.85) * safeTilt * fallbackAmount;
      }

      const dx = target.x - current.x;
      const dy = target.y - current.y;
      // Jika sudah settle dan tidak auto-orbit, skip tulis DOM.
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001 && (!autoOrbit || !inViewport)) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      current.x += dx * safeSmoothing;
      current.y += dy * safeSmoothing;
      applyTransform();
      frameId = requestAnimationFrame(tick);
    };

    applyTransform();
    frameId = requestAnimationFrame(tick);

    return () => {
      if (canTrackPointer) {
        root.removeEventListener('pointermove', handlePointerMove);
        root.removeEventListener('pointerleave', handlePointerLeave);
        window.removeEventListener('blur', handlePointerLeave);
      }
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(frameId);
    };
  }, [autoOrbit, baseRotation, pointerTracking, safeOrbitSpeed, safeSmoothing, safeTilt]);

  // Pulse dari luar (klik): tendang target sesaat, smoothing mengayun kembali.
  // Dihormati reduced-motion (diam). Stagger diatur pemanggil via pulseDelay.
  useEffect(() => {
    if (pulseKey === 0) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(
      () => {
        kickRef.current = {
          x: baseRotation.x - safeTilt * 1.8,
          y: baseRotation.y + safeTilt * 1.8,
          until: performance.now() + 380,
        };
      },
      Math.max(0, pulseDelay),
    );
    return () => window.clearTimeout(timer);
  }, [pulseKey, pulseDelay, baseRotation, safeTilt]);

  const rootStyle: CSSProperties = {
    ...style,
    perspective: `${safePerspective}px`,
    perspectiveOrigin: '50% 48%',
    contain: 'layout',
    isolation: 'isolate',
    overflow: 'visible',
  };

  const stageStyle: CSSProperties = {
    transformStyle: 'preserve-3d',
    transform: getTransform(baseRotation.x, baseRotation.y),
    transformOrigin: '50% 50%',
    willChange: 'transform'
  };

  const textStyle: CSSProperties = {
    fontSize,
    fontWeight,
    lineHeight: 0.86,
    letterSpacing: '-0.065em',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden',
    fontKerning: 'normal',
    textRendering: 'geometricPrecision'
  };

  return (
    <span ref={rootRef} className={`inline-block overflow-visible ${className}`.trim()} style={rootStyle}>
      <span ref={stageRef} className="relative inline-grid place-items-center overflow-visible" style={stageStyle}>
        {depthLayers.map(layer => (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 inline-block brightness-95 saturate-95"
            key={layer.index}
            style={{ ...textStyle, color: layer.color, transform: layer.transform }}
          >
            {text}
          </span>
        ))}
        <span
          className="relative z-10 inline-block"
          style={{
            ...textStyle,
            color: faceColor,
            textShadow: shadow
              ? `0 22px 34px color-mix(in srgb, ${depthColor} 36%, transparent), 0 4px 8px rgba(0, 0, 0, 0.28)`
              : 'none',
            transform: 'translateZ(0.6px)'
          }}
        >
          {text}
        </span>
      </span>
    </span>
  );
};

export default DepthText;
