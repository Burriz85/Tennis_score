// tennis-court.jsx — court background SVG + landscape phone frame

const COURT_PALETTES = {
  hard:  { out: ['#3a7a3a', '#2f6b2f'], in: ['#1f5fa8', '#174c89'] },
  clay:  { out: ['#3d6235', '#2d4a26'], in: ['#c75a2e', '#a64623'] },
  grass: { out: ['#5e7d3d', '#3f5a26'], in: ['#3d7a3a', '#2c5e29'] },
};

function CourtBackground({ palette = 'hard' }) {
  const p = COURT_PALETTES[palette] || COURT_PALETTES.hard;
  const lineColor = '#ffffff';
  const lineW = 3;
  const id = 'court_' + palette;
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
      <rect x="0" y="0" width="1000" height="500" fill={`url(#${id}_out)`} />
      <rect x="60" y="40" width="880" height="420" fill={`url(#${id}_in)`} />
      <rect x="60" y="40" width="880" height="420" fill="none" stroke={lineColor} strokeWidth={lineW} />
      <line x1="60" y1="90" x2="940" y2="90" stroke={lineColor} strokeWidth={lineW} />
      <line x1="60" y1="410" x2="940" y2="410" stroke={lineColor} strokeWidth={lineW} />
      <line x1="240" y1="90" x2="240" y2="410" stroke={lineColor} strokeWidth={lineW} />
      <line x1="760" y1="90" x2="760" y2="410" stroke={lineColor} strokeWidth={lineW} />
      <line x1="240" y1="250" x2="760" y2="250" stroke={lineColor} strokeWidth={lineW} />
      <line x1="60" y1="245" x2="80" y2="245" stroke={lineColor} strokeWidth={lineW} />
      <line x1="60" y1="255" x2="80" y2="255" stroke={lineColor} strokeWidth={lineW} />
      <line x1="920" y1="245" x2="940" y2="245" stroke={lineColor} strokeWidth={lineW} />
      <line x1="920" y1="255" x2="940" y2="255" stroke={lineColor} strokeWidth={lineW} />
      {/* net */}
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

function LandscapeAndroid({ children, width = 920, height = 430, showFrame = true }) {
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
      width, height, borderRadius: 22, overflow: 'hidden',
      background: '#0a0a0a',
      border: `9px solid #1a1a1a`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'row', boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Left edge status bar */}
      <div style={{
        width: 30, background: 'rgba(0,0,0,0.55)', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 0',
        fontFamily: 'Roboto, system-ui, sans-serif', fontSize: 11, letterSpacing: 0.25,
        position: 'relative', zIndex: 10,
      }}>
        <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>9:30</span>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#1d1d1d' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z" fill="#fff"/>
          </svg>
          <svg width="13" height="13" viewBox="0 0 16 16" style={{ transform: 'rotate(-90deg)' }}>
            <rect x="3.75" y="2" width="8.5" height="13" rx="1.5" fill="#fff"/>
            <rect x="5.5" y="0.9" width="5" height="2" rx="0.5" fill="#fff"/>
          </svg>
        </div>
      </div>
      {/* Main canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
      {/* Right edge nav pill */}
      <div style={{
        width: 20, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ width: 3, height: 80, borderRadius: 2, background: '#fff', opacity: 0.5 }} />
      </div>
    </div>
  );
}

Object.assign(window, { CourtBackground, LandscapeAndroid, COURT_PALETTES });
