// tennis-court.jsx — court background SVG (portrait + landscape)

const COURT_PALETTES = {
  hard:  { out: ['#3a7a3a', '#2f6b2f'], in: ['#1f5fa8', '#174c89'] },
  clay:  { out: ['#3d6235', '#2d4a26'], in: ['#c75a2e', '#a64623'] },
  grass: { out: ['#5e7d3d', '#3f5a26'], in: ['#3d7a3a', '#2c5e29'] },
};

// PORTRAIT court — net runs horizontally across the middle.
// viewBox: 500 wide × 1000 tall.
function CourtBackground({ palette = 'hard' }) {
  const p = COURT_PALETTES[palette] || COURT_PALETTES.hard;
  const lineColor = '#ffffff';
  const lineW = 3;
  const id = 'court_' + palette;
  return (
    <svg viewBox="0 0 500 1000" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={id + '_out'} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={p.out[0]} />
          <stop offset="100%" stopColor={p.out[1]} />
        </linearGradient>
        <linearGradient id={id + '_in'} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={p.in[0]} />
          <stop offset="100%" stopColor={p.in[1]} />
        </linearGradient>
      </defs>
      {/* surround */}
      <rect x="0" y="0" width="500" height="1000" fill={`url(#${id}_out)`} />
      {/* playable area */}
      <rect x="40" y="60" width="420" height="880" fill={`url(#${id}_in)`} />
      <rect x="40" y="60" width="420" height="880" fill="none" stroke={lineColor} strokeWidth={lineW} />
      {/* singles sidelines (vertical) */}
      <line x1="90" y1="60" x2="90" y2="940" stroke={lineColor} strokeWidth={lineW} />
      <line x1="410" y1="60" x2="410" y2="940" stroke={lineColor} strokeWidth={lineW} />
      {/* service lines (horizontal) */}
      <line x1="90" y1="240" x2="410" y2="240" stroke={lineColor} strokeWidth={lineW} />
      <line x1="90" y1="760" x2="410" y2="760" stroke={lineColor} strokeWidth={lineW} />
      {/* center service line (vertical between service lines) */}
      <line x1="250" y1="240" x2="250" y2="760" stroke={lineColor} strokeWidth={lineW} />
      {/* center marks on baselines */}
      <line x1="245" y1="60" x2="255" y2="60" stroke={lineColor} strokeWidth={lineW} />
      <line x1="245" y1="940" x2="255" y2="940" stroke={lineColor} strokeWidth={lineW} />
      {/* net — horizontal */}
      <rect x="20" y="497" width="460" height="6" fill="#111" opacity="0.85" />
      <rect x="20" y="494" width="6" height="12" fill="#f5f5f5" />
      <rect x="474" y="494" width="6" height="12" fill="#f5f5f5" />
      <g stroke="#000" strokeWidth="0.5" opacity="0.25">
        {Array.from({length: 30}).map((_, i) => (
          <line key={i} x1={26 + i*15} y1={497} x2={26 + i*15} y2={503} />
        ))}
      </g>
    </svg>
  );
}

// Portrait phone frame (optional)
function PortraitFrame({ children, width = 420, height = 820, showFrame = true }) {
  if (!showFrame) {
    return (
      <div style={{
        width, height, position: 'relative', overflow: 'hidden',
        borderRadius: 14, background: '#000',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
      }}>{children}</div>
    );
  }
  return (
    <div style={{
      width, height, borderRadius: 38, overflow: 'hidden',
      background: '#0a0a0a',
      border: `9px solid #1a1a1a`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)',
      position: 'relative', boxSizing: 'border-box',
    }}>
      {/* Camera punch-hole */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 14, borderRadius: '50%', background: '#1d1d1d',
        zIndex: 10,
      }} />
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// LANDSCAPE court — net runs vertically across the middle.
// viewBox: 1000 wide × 500 tall. (portrait court rotated 90°)
function CourtBackgroundLandscape({ palette = 'hard' }) {
  const p = COURT_PALETTES[palette] || COURT_PALETTES.hard;
  const lineColor = '#ffffff';
  const lineW = 3;
  const id = 'courtL_' + palette;
  return (
    <svg viewBox="0 0 1000 500" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={id + '_out'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.out[0]} />
          <stop offset="100%" stopColor={p.out[1]} />
        </linearGradient>
        <linearGradient id={id + '_in'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.in[0]} />
          <stop offset="100%" stopColor={p.in[1]} />
        </linearGradient>
      </defs>
      {/* surround */}
      <rect x="0" y="0" width="1000" height="500" fill={`url(#${id}_out)`} />
      {/* playable area */}
      <rect x="60" y="40" width="880" height="420" fill={`url(#${id}_in)`} />
      <rect x="60" y="40" width="880" height="420" fill="none" stroke={lineColor} strokeWidth={lineW} />
      {/* singles sidelines (horizontal) */}
      <line x1="60" y1="90" x2="940" y2="90" stroke={lineColor} strokeWidth={lineW} />
      <line x1="60" y1="410" x2="940" y2="410" stroke={lineColor} strokeWidth={lineW} />
      {/* service lines (vertical) */}
      <line x1="240" y1="90" x2="240" y2="410" stroke={lineColor} strokeWidth={lineW} />
      <line x1="760" y1="90" x2="760" y2="410" stroke={lineColor} strokeWidth={lineW} />
      {/* center service line (horizontal between service lines) */}
      <line x1="240" y1="250" x2="760" y2="250" stroke={lineColor} strokeWidth={lineW} />
      {/* center marks on baselines */}
      <line x1="60" y1="245" x2="60" y2="255" stroke={lineColor} strokeWidth={lineW} />
      <line x1="940" y1="245" x2="940" y2="255" stroke={lineColor} strokeWidth={lineW} />
      {/* net — vertical */}
      <rect x="497" y="20" width="6" height="460" fill="#111" opacity="0.85" />
      <rect x="494" y="20" width="12" height="6" fill="#f5f5f5" />
      <rect x="494" y="474" width="12" height="6" fill="#f5f5f5" />
      <g stroke="#000" strokeWidth="0.5" opacity="0.25">
        {Array.from({length: 30}).map((_, i) => (
          <line key={i} x1={497} y1={26 + i*15} x2={503} y2={26 + i*15} />
        ))}
      </g>
    </svg>
  );
}

Object.assign(window, { CourtBackground, CourtBackgroundLandscape, PortraitFrame, COURT_PALETTES });
