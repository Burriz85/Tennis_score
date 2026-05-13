// Static illustration of the tennis scoring app, landscape Android.

function LandscapeAndroid({ children, width = 880, height = 412 }) {
  // Landscape: status bar on the LEFT edge (rotated), gesture bar on RIGHT edge.
  const C = {
    onSurface: '#171d1b',
    onSurfaceVar: '#49454f',
    frameBorder: 'rgba(116,119,117,0.5)',
  };
  return (
    <div style={{
      width, height, borderRadius: 18, overflow: 'hidden',
      background: '#000',
      border: `8px solid ${C.frameBorder}`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'row', boxSizing: 'border-box',
    }}>
      {/* Left edge: status bar rotated -90° */}
      <div style={{
        width: 32, background: '#0f3d1f', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 0',
        fontFamily: 'Roboto, system-ui, sans-serif', fontSize: 12, letterSpacing: 0.25,
      }}>
        <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>9:30</span>
        {/* camera punch-hole positioned at top-center of landscape (= mid of left edge) */}
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#1d1d1d' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z" fill="#fff"/>
          </svg>
          <svg width="14" height="14" viewBox="0 0 16 16" style={{ transform: 'rotate(-90deg)' }}>
            <rect x="3.75" y="2" width="8.5" height="13" rx="1.5" fill="#fff"/>
            <rect x="5.5" y="0.9" width="5" height="2" rx="0.5" fill="#fff"/>
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>

      {/* Right edge: gesture pill */}
      <div style={{
        width: 22, background: '#0f3d1f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 4, height: 90, borderRadius: 2,
          background: '#fff', opacity: 0.5,
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tennis court background (top-down). Net runs VERTICAL.
// ─────────────────────────────────────────────────────────────
function CourtBackground() {
  const lineColor = '#ffffff';
  const lineW = 3;
  return (
    <svg viewBox="0 0 1000 500" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="surface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a7a3a" />
          <stop offset="100%" stopColor="#2f6b2f" />
        </linearGradient>
        <linearGradient id="court" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f5fa8" />
          <stop offset="100%" stopColor="#174c89" />
        </linearGradient>
      </defs>
      {/* outer surround (grass-ish dark green) */}
      <rect x="0" y="0" width="1000" height="500" fill="url(#surface)" />
      {/* playable area (hard court blue) */}
      <rect x="60" y="40" width="880" height="420" fill="url(#court)" />
      {/* outer doubles lines */}
      <rect x="60" y="40" width="880" height="420" fill="none" stroke={lineColor} strokeWidth={lineW} />
      {/* singles sidelines */}
      <line x1="60" y1="90" x2="940" y2="90" stroke={lineColor} strokeWidth={lineW} />
      <line x1="60" y1="410" x2="940" y2="410" stroke={lineColor} strokeWidth={lineW} />
      {/* service boxes */}
      <line x1="240" y1="90" x2="240" y2="410" stroke={lineColor} strokeWidth={lineW} />
      <line x1="760" y1="90" x2="760" y2="410" stroke={lineColor} strokeWidth={lineW} />
      {/* center service line */}
      <line x1="240" y1="250" x2="760" y2="250" stroke={lineColor} strokeWidth={lineW} />
      {/* center marks on baseline */}
      <line x1="60" y1="245" x2="80" y2="245" stroke={lineColor} strokeWidth={lineW} />
      <line x1="60" y1="255" x2="80" y2="255" stroke={lineColor} strokeWidth={lineW} />
      <line x1="920" y1="245" x2="940" y2="245" stroke={lineColor} strokeWidth={lineW} />
      <line x1="920" y1="255" x2="940" y2="255" stroke={lineColor} strokeWidth={lineW} />
      {/* net */}
      <rect x="497" y="20" width="6" height="460" fill="#111" opacity="0.85" />
      <rect x="494" y="20" width="12" height="6" fill="#f5f5f5" />
      <rect x="494" y="474" width="12" height="6" fill="#f5f5f5" />
      {/* net mesh hint */}
      <g stroke="#000" strokeWidth="0.5" opacity="0.25">
        {Array.from({length: 30}).map((_, i) => (
          <line key={i} x1={497} y1={26 + i*15} x2={503} y2={26 + i*15} />
        ))}
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// One side of the scoreboard (player + score + tap button)
// ─────────────────────────────────────────────────────────────
function Side({ name, score, sets, setsWonIdx, mirror = false }) {
  // sets won/lost as dots underneath name
  const totalSets = 3; // best of 3
  const dots = [];
  for (let i = 0; i < totalSets; i++) {
    const won = setsWonIdx.includes(i);
    dots.push(
      <div key={i} style={{
        width: 10, height: 10, borderRadius: '50%',
        background: won ? '#fff' : 'transparent',
        border: '2px solid rgba(255,255,255,0.7)',
      }} />
    );
  }

  return (
    <div style={{
      flex: 1, position: 'relative',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 28px', boxSizing: 'border-box',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* top chip: player name + set dots */}
      <div style={{
        position: 'absolute', top: 14, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(6px)',
          padding: '6px 14px', borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.18)',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.02 }}>{name}</span>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', gap: 5 }}>{dots}</div>
        </div>
      </div>

      {/* Big score */}
      <div style={{
        fontSize: 132, fontWeight: 700,
        lineHeight: 1, letterSpacing: '-0.04em',
        textShadow: '0 4px 24px rgba(0,0,0,0.35)',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontVariantNumeric: 'tabular-nums',
      }}>{score}</div>

      {/* Sets bar */}
      <div style={{
        marginTop: 6, display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
        opacity: 0.8,
      }}>
        <span>Sett</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {sets.map((s, i) => (
            <div key={i} style={{
              minWidth: 22, padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.25)',
              fontSize: 13, fontWeight: 600, textAlign: 'center',
              letterSpacing: 0,
            }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Big tap button anchor — bottom */}
      <div style={{
        position: 'absolute',
        bottom: 22,
        left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: 'linear-gradient(180deg, #d8ff5e 0%, #b6e636 100%)',
          color: '#13260b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, fontWeight: 300, lineHeight: 1,
          boxShadow: '0 10px 30px rgba(0,0,0,0.35), inset 0 -3px 0 rgba(0,0,0,0.15)',
          border: '3px solid rgba(255,255,255,0.85)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>+</div>
      </div>

      {/* "Trykk hvor som helst" hint */}
      <div style={{
        position: 'absolute', bottom: 6, left: 0, right: 0,
        textAlign: 'center', fontSize: 10, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
      }}>Trykk for poeng</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Center "net" overlay: match controls + match info
// ─────────────────────────────────────────────────────────────
function CenterControls() {
  const Btn = ({ children, sub }) => (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: 'rgba(0,0,0,0.45)',
      border: '1px solid rgba(255,255,255,0.18)',
      color: '#fff', fontSize: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }} title={sub}>{children}</div>
  );
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: 0, bottom: 0,
      transform: 'translateX(-50%)',
      width: 110,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between',
      pointerEvents: 'none',
      padding: '14px 0 22px',
    }}>
      {/* Top: match status pill */}
      <div style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 999,
        padding: '6px 12px',
        color: '#fff',
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontFamily: 'Inter, system-ui, sans-serif',
        whiteSpace: 'nowrap',
      }}>Sett 3 · Game</div>

      {/* Middle: serve indicator (ball icon pointing to server) */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#e3ff5b',
          border: '2px solid #fff',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 4, borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.7)',
            borderRight: 'none', borderBottom: 'none',
            transform: 'rotate(45deg)',
          }} />
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.85 }}>Server</div>
      </div>

      {/* Bottom: undo + reset buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn sub="Angre">↶</Btn>
        <Btn sub="Nullstill">⟳</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mock app screen
// ─────────────────────────────────────────────────────────────
function MockApp() {
  return (
    <LandscapeAndroid width={920} height={430}>
      <CourtBackground />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'row',
      }}>
        <Side
          name="Marius"
          score="40"
          sets={['6','4','3']}
          setsWonIdx={[0]}
        />
        <Side
          name="Erik"
          score="Ad"
          sets={['3','6','4']}
          setsWonIdx={[1]}
        />
      </div>
      <CenterControls />
    </LandscapeAndroid>
  );
}

const root = ReactDOM.createRoot(document.getElementById('stage'));
root.render(<MockApp />);
