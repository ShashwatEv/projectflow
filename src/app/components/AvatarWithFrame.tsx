import type { CSSProperties } from 'react';

export type AvatarFrameId =
  | 'none'
  | 'blue-sparkles'
  | 'gold-clockwise'
  | 'silver-clockwise'
  | 'orange-clockwise';

export interface AvatarFrameOption {
  id: AvatarFrameId;
  name: string;
  tagline: string;
  baseColor: string;
  highlightColor: string;
  sparkleColor: string;
  ringGlow: string;
}

export const AVATAR_FRAMES: AvatarFrameOption[] = [
  {
    id: 'blue-sparkles',
    name: 'Blue Sparkles',
    tagline: 'Electric blue frame with clockwise white loading stars',
    baseColor: '#2563eb',
    highlightColor: '#93c5fd',
    sparkleColor: '#ffffff',
    ringGlow: 'shadow-[0_0_14px_rgba(59,130,246,0.38)]',
  },
  {
    id: 'gold-clockwise',
    name: 'Royal Gold',
    tagline: '24k gold frame with clockwise white loading stars',
    baseColor: '#d97706',
    highlightColor: '#fef08a',
    sparkleColor: '#fffbeb',
    ringGlow: 'shadow-[0_0_14px_rgba(245,158,11,0.38)]',
  },
  {
    id: 'silver-clockwise',
    name: 'Chrome Silver',
    tagline: 'Metallic silver frame with clockwise white loading stars',
    baseColor: '#64748b',
    highlightColor: '#ffffff',
    sparkleColor: '#ffffff',
    ringGlow: 'shadow-[0_0_12px_rgba(148,163,184,0.35)]',
  },
  {
    id: 'orange-clockwise',
    name: 'Solar Orange',
    tagline: 'Solar orange frame with clockwise white loading stars',
    baseColor: '#ea580c',
    highlightColor: '#fed7aa',
    sparkleColor: '#fff7ed',
    ringGlow: 'shadow-[0_0_14px_rgba(249,115,22,0.38)]',
  },
  {
    id: 'none',
    name: 'Minimal Clean',
    tagline: 'Clean border without sparkles or motion',
    baseColor: 'transparent',
    highlightColor: 'transparent',
    sparkleColor: 'transparent',
    ringGlow: '',
  },
];

interface AvatarWithFrameProps {
  src: string;
  alt: string;
  shape?: 'circle' | 'square';
  frame?: AvatarFrameId;
  size?: number;
  className?: string;
}

const CIRCLE_STARS = [
  { top: '0%', left: '50%', scale: 1.15, opacity: 1 },
  { top: '25%', left: '93.3%', scale: 1.0, opacity: 0.86 },
  { top: '75%', left: '93.3%', scale: 0.92, opacity: 0.72 },
  { top: '100%', left: '50%', scale: 0.84, opacity: 0.58 },
  { top: '75%', left: '6.7%', scale: 0.76, opacity: 0.44 },
  { top: '25%', left: '6.7%', scale: 0.68, opacity: 0.32 },
];

const SQUARE_STARS = [
  { top: '0%', left: '50%', scale: 1.15, opacity: 1 },
  { top: '0%', left: '100%', scale: 1.0, opacity: 0.86 },
  { top: '50%', left: '100%', scale: 0.92, opacity: 0.72 },
  { top: '100%', left: '100%', scale: 0.84, opacity: 0.58 },
  { top: '100%', left: '50%', scale: 0.76, opacity: 0.44 },
  { top: '100%', left: '0%', scale: 0.68, opacity: 0.32 },
];

export default function AvatarWithFrame({
  src,
  alt,
  shape = 'circle',
  frame = 'blue-sparkles',
  size = 40,
  className = '',
}: AvatarWithFrameProps) {
  const frameConfig =
    AVATAR_FRAMES.find((item) => item.id === frame) ?? AVATAR_FRAMES[0]!;
  const isCircle = shape === 'circle';
  const outerRadius = isCircle ? '9999px' : '11px';
  const innerRadius = isCircle ? '9999px' : '8px';
  const borderWidth = size <= 36 ? 2.5 : 3.5;
  const starSize = size <= 36 ? 7 : 9;
  const hasFrame = frame !== 'none';

  const containerStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: outerRadius,
  };

  const conicSweep = `conic-gradient(from 0deg, ${frameConfig.baseColor} 0deg, ${frameConfig.highlightColor} 55deg, ${frameConfig.baseColor} 125deg, ${frameConfig.baseColor} 360deg)`;

  return (
    <>
      <style>{`
        @keyframes pfFrameSpinCw {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .pf-anim-cw {
          animation-name: pfFrameSpinCw !important;
          animation-duration: 3.6s !important;
          animation-timing-function: linear !important;
          animation-iteration-count: infinite !important;
          animation-direction: normal !important;
          animation-fill-mode: none !important;
          animation-play-state: running !important;
          transform-origin: center center;
          will-change: transform;
        }
      `}</style>

      <div
        style={containerStyle}
        className={`relative inline-flex shrink-0 items-center justify-center select-none ${
          hasFrame ? frameConfig.ringGlow : ''
        } ${className}`}
      >
        {/* Border Layer: rotates full circle for circle avatar; sweeps cleanly inside fixed square for square avatar */}
        {hasFrame && (
          <span
            aria-hidden="true"
            style={{ borderRadius: outerRadius }}
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
          >
            <span
              style={{
                background: conicSweep,
                inset: isCircle ? '0px' : '-50%',
                width: isCircle ? '100%' : '200%',
                height: isCircle ? '100%' : '200%',
              }}
              className="pf-anim-cw block h-full w-full"
            />
          </span>
        )}

        {/* Centered Inner Avatar */}
        <div
          style={{
            borderRadius: innerRadius,
            width: hasFrame ? `calc(100% - ${borderWidth * 2}px)` : '100%',
            height: hasFrame ? `calc(100% - ${borderWidth * 2}px)` : '100%',
          }}
          className="relative z-[2] overflow-hidden bg-white dark:bg-[#0d1117]"
        >
          <img
            src={src || '/pfp.jpg'}
            onError={(e) => {
              e.currentTarget.src = '/pfp.jpg';
            }}
            alt={alt}
            className="block h-full w-full object-cover object-center"
          />
        </div>

        {/* Clockwise Orbiting Stars */}
        {hasFrame && isCircle && (
          <span
            aria-hidden="true"
            style={{ borderRadius: outerRadius }}
            className="pf-anim-cw pointer-events-none absolute inset-0 z-[5]"
          >
            {CIRCLE_STARS.map((star, idx) => {
              const pxSize = starSize * star.scale;
              return (
                <svg
                  key={idx}
                  viewBox="0 0 16 16"
                  style={{
                    top: star.top,
                    left: star.left,
                    width: `${pxSize}px`,
                    height: `${pxSize}px`,
                    marginLeft: `${-pxSize / 2}px`,
                    marginTop: `${-pxSize / 2}px`,
                    opacity: star.opacity,
                  }}
                  className="absolute"
                >
                  <path
                    fill={frameConfig.sparkleColor}
                    d="M8 0 L9.7 6.3 L16 8 L9.7 9.7 L8 16 L6.3 9.7 L0 8 L6.3 6.3 Z"
                  />
                </svg>
              );
            })}
          </span>
        )}

        {hasFrame && !isCircle && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5]"
          >
            {SQUARE_STARS.map((star, idx) => {
              const pxSize = starSize * star.scale;
              return (
                <svg
                  key={idx}
                  viewBox="0 0 16 16"
                  style={{
                    top: star.top,
                    left: star.left,
                    width: `${pxSize}px`,
                    height: `${pxSize}px`,
                    marginLeft: `${-pxSize / 2}px`,
                    marginTop: `${-pxSize / 2}px`,
                    opacity: star.opacity,
                    animationName: 'pfFrameSpinCw',
                    animationDuration: '4.8s',
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDirection: 'normal',
                    animationFillMode: 'none',
                    animationPlayState: 'running',
                  }}
                  className="pf-anim-cw absolute"
                >
                  <path
                    fill={frameConfig.sparkleColor}
                    d="M8 0 L9.7 6.3 L16 8 L9.7 9.7 L8 16 L6.3 9.7 L0 8 L6.3 6.3 Z"
                  />
                </svg>
              );
            })}
          </span>
        )}
      </div>
    </>
  );
}