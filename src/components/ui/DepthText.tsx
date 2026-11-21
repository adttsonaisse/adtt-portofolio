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
  // Desktop: cap 10 lapis, mobile/coarse: cap 6 lapis — tetap tebal tapi hemat GPU compositor.
  const effectiveLayers = isLite ? Math.min(safeLayers, 6) : Math.min(safeLayers, 10);
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

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const canTrackPointer = pointerTracking && finePointer;

    let frameId = 0;
    let activePointer = false;
    let inViewport = true;
    let cachedRect: DOMRect | null = null;
    const startTime = performance.now();
    const current = { ...baseRotation };
    const target = { ...baseRotation };

    const applyTransform = () => {
      stage.style.transform = getTransform(current.x, current.y);
    };

    const invalidateRect = () => {
      cachedRect = null;
    };

    const tick = (now: number) => {
      frameId = 0;
      if (!inViewport || document.hidden) return;

      const kicking = now < kickRef.current.until;
      if (kicking) {
        target.x = kickRef.current.x;
        target.y = kickRef.current.y;
      } else if (autoOrbit && (!canTrackPointer || !activePointer)) {
        const elapsed = (now - startTime) / 1000;
        const orbit = elapsed * safeOrbitSpeed * Math.PI * 2;
        const fallbackAmount = canTrackPointer ? 0.18 : 0.55;
        target.x = baseRotation.x + Math.sin(orbit) * safeTilt * fallbackAmount;
        target.y = baseRotation.y + Math.cos(orbit * 0.85) * safeTilt * fallbackAmount;
      } else if (!canTrackPointer || !activePointer) {
        target.x = baseRotation.x;
        target.y = baseRotation.y;
      }

      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const settled = Math.abs(dx) < 0.002 && Math.abs(dy) < 0.002;
      if (!settled) {
        current.x += dx * safeSmoothing;
        current.y += dy * safeSmoothing;
        applyTransform();
      }
      if (!settled || autoOrbit || kicking) {
        frameId = requestAnimationFrame(tick);
      }
    };

    const startLoop = () => {
      if (!frameId && inViewport && !document.hidden) {
        frameId = requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!inViewport || document.hidden) return;
      cachedRect = cachedRect ?? root.getBoundingClientRect();
      if (!cachedRect.width || !cachedRect.height) return;

      activePointer = true;
      const spanX = Math.max(cachedRect.width * 0.8, 220);
      const spanY = Math.max(cachedRect.height * 0.8, 160);
      const x = clamp((event.clientX - (cachedRect.left + cachedRect.width / 2)) / spanX, -1, 1);
      const y = clamp((event.clientY - (cachedRect.top + cachedRect.height / 2)) / spanY, -1, 1);

      target.x = baseRotation.x - y * safeTilt;
      target.y = baseRotation.y + x * safeTilt;
      startLoop();
    };

    const handlePointerLeave = () => {
      activePointer = false;
      target.x = baseRotation.x;
      target.y = baseRotation.y;
      startLoop();
    };

    if (canTrackPointer) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.documentElement.addEventListener('mouseleave', handlePointerLeave);
      window.addEventListener('blur', handlePointerLeave);
    }
    window.addEventListener('resize', invalidateRect, { passive: true });
    window.addEventListener('scroll', invalidateRect, { passive: true });

    // Hentikan rAF total saat off-screen / tab hidden — 0% CPU saat scroll ke bawah.
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              inViewport = entries[0]?.isIntersecting ?? true;
              cachedRect = null;
              if (inViewport) startLoop();
              else stopLoop();
            },
            { threshold: 0 }
          )
        : null;
    io?.observe(root);

    const onVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        activePointer = false;
        cachedRect = null;
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Expose kicker untuk pulseKey agar bisa membangunkan loop jika sedang idle.
    const onKick = () => startLoop();
    root.addEventListener('depth-kick', onKick);

    applyTransform();
    // Tunda autoOrbit sesaat agar 6 loop rAF tidak berebut main-thread/GPU tepat saat initial paint & splash.
    const orbitTimer = autoOrbit ? window.setTimeout(startLoop, 900) : 0;

    return () => {
      if (orbitTimer) window.clearTimeout(orbitTimer);
      if (canTrackPointer) {
        window.removeEventListener('pointermove', handlePointerMove);
        document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
        window.removeEventListener('blur', handlePointerLeave);
      }
      window.removeEventListener('resize', invalidateRect);
      window.removeEventListener('scroll', invalidateRect);
      root.removeEventListener('depth-kick', onKick);
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      stopLoop();
    };
  }, [autoOrbit, baseRotation, pointerTracking, safeOrbitSpeed, safeSmoothing, safeTilt]);

  // Pulse dari luar (klik): tendang target sesaat, smoothing mengayun kembali.
  // Stagger diatur pemanggil via pulseDelay.
  useEffect(() => {
    if (pulseKey === 0) return;
    if (typeof window === 'undefined') return;
    const timer = window.setTimeout(
      () => {
        kickRef.current = {
          x: baseRotation.x - safeTilt * 1.8,
          y: baseRotation.y + safeTilt * 1.8,
          until: performance.now() + 380,
        };
        rootRef.current?.dispatchEvent(new Event('depth-kick'));
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
            className="pointer-events-none absolute inset-0 z-0 inline-block"
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
