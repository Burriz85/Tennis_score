// tennis-screens.jsx — setup screen, match screen, winner overlay

// ──────────────────────────────────────────────────────────────
// Setup screen
// ──────────────────────────────────────────────────────────────
function SetupScreen({ initial, onStart }) {
  const [n1, setN1] = React.useState(initial.names[0]);
  const [n2, setN2] = React.useState(initial.names[1]);
  const [bestOf, setBestOf] = React.useState(initial.bestOf);
  const [server, setServer] = React.useState(0);

  const fieldStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.22)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 18,
    fontWeight: 500,
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    textAlign: 'center',
  };

  const Segment = ({ value, onChange, options }) => (
    <div style={{
      display: 'inline-flex',
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: 999,
      padding: 3,
    }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          background: value === o.value ? '#d8ff5e' : 'transparent',
          color: value === o.value ? '#13260b' : '#fff',
          border: 'none',
          padding: '8px 18px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: 0.02,
          minWidth: 100,
        }}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px 40px', boxSizing: 'border-box',
    }}>
      <div style={{
        fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
        opacity: 0.7, marginBottom: 4,
      }}>Tennis Score</div>
      <div style={{
        fontSize: 22, fontWeight: 600, marginBottom: 20,
        letterSpacing: '-0.01em',
      }}>Ny kamp</div>

      <div style={{ display: 'flex', gap: 14, width: '100%', maxWidth: 560, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65, display: 'block', marginBottom: 6, textAlign: 'center' }}>Spiller 1</label>
          <input value={n1} onChange={(e) => setN1(e.target.value)} maxLength={14} style={fieldStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65, display: 'block', marginBottom: 6, textAlign: 'center' }}>Spiller 2</label>
          <input value={n2} onChange={(e) => setN2(e.target.value)} maxLength={14} style={fieldStyle} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65 }}>Kamp</label>
          <Segment value={bestOf} onChange={setBestOf} options={[
            { value: 3, label: 'Best av 3' },
            { value: 5, label: 'Best av 5' },
          ]} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65 }}>Server</label>
          <Segment value={server} onChange={setServer} options={[
            { value: 0, label: n1 || 'Spiller 1' },
            { value: 1, label: n2 || 'Spiller 2' },
          ]} />
        </div>
      </div>

      <button onClick={() => onStart({
        names: [n1.trim() || 'Spiller 1', n2.trim() || 'Spiller 2'],
        bestOf, server,
      })} style={{
        background: 'linear-gradient(180deg, #d8ff5e 0%, #b6e636 100%)',
        color: '#13260b',
        border: '3px solid rgba(255,255,255,0.85)',
        padding: '14px 48px',
        fontSize: 18, fontWeight: 700,
        borderRadius: 999,
        cursor: 'pointer',
        letterSpacing: 0.02,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}>Start kamp</button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// One side of the active match
// ──────────────────────────────────────────────────────────────
function MatchSide({ state, p, onPoint }) {
  const [pts1, pts2] = formatPoints(state);
  const myPts = p === 0 ? pts1 : pts2;
  const isServer = state.server === p;
  const setsWon = state.setsWon[p];
  const setsToWin = state.setsToWin;

  // sets row: completed sets games for this player
  const setBoxes = state.completedSets.map((s, i) => {
    const my = s[p], theirs = s[1 - p];
    const won = my > theirs;
    return (
      <div key={i} style={{
        minWidth: 26, padding: '2px 6px',
        borderRadius: 4,
        background: won ? 'rgba(216,255,94,0.85)' : 'rgba(255,255,255,0.12)',
        color: won ? '#13260b' : '#fff',
        border: '1px solid ' + (won ? 'transparent' : 'rgba(255,255,255,0.22)'),
        fontSize: 14, fontWeight: 700, textAlign: 'center',
        fontVariantNumeric: 'tabular-nums',
      }}>{my}</div>
    );
  });
  // current set games
  setBoxes.push(
    <div key="cur" style={{
      minWidth: 26, padding: '2px 6px',
      borderRadius: 4,
      background: 'rgba(255,255,255,0.20)',
      border: '1px solid rgba(255,255,255,0.35)',
      color: '#fff',
      fontSize: 14, fontWeight: 700, textAlign: 'center',
      fontVariantNumeric: 'tabular-nums',
    }}>{state.games[p]}</div>
  );

  // sets-won pips
  const pips = [];
  for (let i = 0; i < setsToWin; i++) {
    const won = i < setsWon;
    pips.push(
      <div key={i} style={{
        width: 9, height: 9, borderRadius: '50%',
        background: won ? '#fff' : 'transparent',
        border: '1.5px solid rgba(255,255,255,0.7)',
      }} />
    );
  }

  return (
    <div
      onClick={() => onPoint(p)}
      style={{
        flex: 1, position: 'relative',
        padding: '14px 22px', boxSizing: 'border-box',
        color: '#fff', cursor: 'pointer',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
      {/* big score — positioned in the upper service-box area, shifted toward the net */}
      <div style={{
        position: 'absolute',
        top: '18%',
        ...(p === 0 ? { right: '10%' } : { left: '10%' }),
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        {/* name + server indicator + sets-won pips */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(0,0,0,0.38)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          padding: '6px 14px', borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.18)',
          marginBottom: 10,
        }}>
          {isServer && (
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: '#e3ff5b', border: '1.5px solid #fff',
              boxShadow: '0 0 8px rgba(227,255,91,0.6)',
            }} title="Server" />
          )}
          <span style={{ fontSize: 13, fontWeight: 600 }}>{state.names[p]}</span>
          <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', gap: 4 }}>{pips}</div>
        </div>

        {/* score number */}
        <div style={{
          fontSize: myPts.length >= 3 ? 96 : 124,
          fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em',
          textShadow: '0 4px 24px rgba(0,0,0,0.4)',
          fontVariantNumeric: 'tabular-nums',
        }}>{myPts}</div>

        {/* set row */}
        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85,
        }}>
          <span style={{ opacity: 0.7 }}>Sett</span>
          <div style={{ display: 'flex', gap: 3 }}>{setBoxes}</div>
        </div>
      </div>

      {/* tap hint button — lower portion of court */}
      <div style={{
        position: 'absolute', bottom: '14%', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(180deg, #d8ff5e 0%, #b6e636 100%)',
          color: '#13260b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38, fontWeight: 300, lineHeight: 1,
          boxShadow: '0 8px 22px rgba(0,0,0,0.4), inset 0 -3px 0 rgba(0,0,0,0.12)',
          border: '3px solid rgba(255,255,255,0.85)',
        }}>+</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Center controls (status pill on top, undo/reset on bottom)
// ──────────────────────────────────────────────────────────────
function CenterControls({ state, onUndo, onReset, canUndo }) {
  const Btn = ({ onClick, children, title, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 38, height: 38, borderRadius: '50%',
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.22)',
        color: '#fff', fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        padding: 0,
      }}>{children}</button>
  );
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: 0, bottom: 0,
      transform: 'translateX(-50%)',
      width: 112,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0 18px',
      pointerEvents: 'none',
    }}>
      {/* status pill */}
      <div style={{
        background: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 999,
        padding: '6px 12px',
        color: '#fff',
        fontSize: 10.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>{statusLine(state)}</div>

      {/* spacer (visual balance — the net is here) */}
      <div />

      {/* bottom buttons */}
      <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
        <Btn onClick={onUndo} disabled={!canUndo} title="Angre">↶</Btn>
        <Btn onClick={onReset} title="Nullstill">⟳</Btn>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Match winner overlay
// ──────────────────────────────────────────────────────────────
function WinnerOverlay({ state, onNewMatch, onRematch }) {
  const w = state.matchWinner;
  if (w == null) return null;
  const summary = state.completedSets
    .map(s => `${s[0]}–${s[1]}`)
    .join('  ·  ');
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      zIndex: 5, padding: '24px 40px', boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>Kamp ferdig</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>{state.names[w]} vant</div>
      <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 22, fontVariantNumeric: 'tabular-nums' }}>{summary}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onRematch} style={{
          background: 'transparent',
          color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
          padding: '11px 26px', fontSize: 14, fontWeight: 600,
          borderRadius: 999, cursor: 'pointer',
        }}>Omkamp</button>
        <button onClick={onNewMatch} style={{
          background: 'linear-gradient(180deg, #d8ff5e 0%, #b6e636 100%)',
          color: '#13260b', border: '3px solid rgba(255,255,255,0.85)',
          padding: '10px 26px', fontSize: 14, fontWeight: 700,
          borderRadius: 999, cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
        }}>Ny kamp</button>
      </div>
    </div>
  );
}

Object.assign(window, { SetupScreen, MatchSide, CenterControls, WinnerOverlay });
