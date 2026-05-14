// tennis-screens.jsx — setup, match, winner overlay (portrait + landscape)

// ──────────────────────────────────────────────────────────────
// Setup screen
// ──────────────────────────────────────────────────────────────
function SetupScreen({ initial, onStart, isLandscape }) {
  const [n1, setN1] = React.useState(initial.names[0]);
  const [n2, setN2] = React.useState(initial.names[1]);
  const [bestOf, setBestOf] = React.useState(initial.bestOf);
  const [server, setServer] = React.useState(0);
  const [showCoin, setShowCoin] = React.useState(false);

  const fieldStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.22)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 17,
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
          padding: '8px 14px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: isLandscape ? 70 : 90,
        }}>{o.label}</button>
      ))}
    </div>
  );

  if (isLandscape) {
    // ── Landscape setup: two-column layout ──
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
        padding: '12px 24px',
        boxSizing: 'border-box',
        gap: 12,
        overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 2 }}>Tennis Score</div>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Ny kamp</div>
        </div>

        {/* Player names side by side */}
        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 560 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65, display: 'block', marginBottom: 4, textAlign: 'center' }}>Spiller 1 (venstre)</label>
            <input value={n1} onChange={(e) => setN1(e.target.value)} maxLength={14} style={{ ...fieldStyle, fontSize: 15, padding: '10px 12px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65, display: 'block', marginBottom: 4, textAlign: 'center' }}>Spiller 2 (høyre)</label>
            <input value={n2} onChange={(e) => setN2(e.target.value)} maxLength={14} style={{ ...fieldStyle, fontSize: 15, padding: '10px 12px' }} />
          </div>
        </div>

        {/* Options row */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65 }}>Kamp</label>
            <Segment value={bestOf} onChange={setBestOf} options={[
              { value: 3, label: 'Best av 3' },
              { value: 5, label: 'Best av 5' },
            ]} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65 }}>Server</label>
            <Segment value={server} onChange={(v) => {
              if (v === 'coin') { setShowCoin(true); } else { setServer(v); }
            }} options={[
              { value: 0, label: n1 || 'Spiller 1' },
              { value: 1, label: n2 || 'Spiller 2' },
              { value: 'coin', label: '🪙 Mynt' },
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
          padding: '12px 44px',
          fontSize: 16, fontWeight: 700,
          borderRadius: 999,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}>Start kamp</button>

        {showCoin && (
          <CoinToss
            names={[n1.trim() || 'Spiller 1', n2.trim() || 'Spiller 2']}
            onDone={(w) => { setServer(w); setShowCoin(false); }}
          />
        )}
      </div>
    );
  }

  // ── Portrait setup ──
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      padding: 'clamp(16px, 4vh, 28px) clamp(20px, 6vw, 36px)',
      boxSizing: 'border-box',
      gap: 'clamp(10px, 1.8vh, 16px)',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>Tennis Score</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>Ny kamp</div>
      </div>

      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65, display: 'block', marginBottom: 6, textAlign: 'center' }}>Spiller 1 (øverst)</label>
          <input value={n1} onChange={(e) => setN1(e.target.value)} maxLength={14} style={fieldStyle} />
        </div>
        <div>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65, display: 'block', marginBottom: 6, textAlign: 'center' }}>Spiller 2 (nederst)</label>
          <input value={n2} onChange={(e) => setN2(e.target.value)} maxLength={14} style={fieldStyle} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65 }}>Kamp</label>
          <Segment value={bestOf} onChange={setBestOf} options={[
            { value: 3, label: 'Best av 3' },
            { value: 5, label: 'Best av 5' },
          ]} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65 }}>Server</label>
          <Segment value={server} onChange={(v) => {
            if (v === 'coin') { setShowCoin(true); } else { setServer(v); }
          }} options={[
            { value: 0, label: n1 || 'Spiller 1' },
            { value: 1, label: n2 || 'Spiller 2' },
            { value: 'coin', label: '🪙 Mynt' },
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
        fontSize: 17, fontWeight: 700,
        borderRadius: 999,
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        marginTop: 6,
      }}>Start kamp</button>

      {showCoin && (
        <CoinToss
          names={[n1.trim() || 'Spiller 1', n2.trim() || 'Spiller 2']}
          onDone={(w) => { setServer(w); setShowCoin(false); }}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// One side of the match.
// Portrait: p=0 top (rotated 180°), p=1 bottom.
// Landscape: p=0 left (rotated 180°), p=1 right.
// ──────────────────────────────────────────────────────────────
function MatchSide({ state, p, onPoint, isLandscape }) {
  const [pts1, pts2] = formatPoints(state);
  const myPts = p === 0 ? pts1 : pts2;
  const isServer = state.server === p;
  const setsWon = state.setsWon[p];
  const setsToWin = state.setsToWin;

  const setBoxStyle = (won, current) => ({
    minWidth: 'clamp(22px, 4vw, 28px)',
    padding: '2px clamp(4px, 1vw, 6px)',
    borderRadius: 4,
    background: current
      ? 'rgba(255,255,255,0.20)'
      : (won ? 'rgba(216,255,94,0.85)' : 'rgba(255,255,255,0.12)'),
    border: '1px solid ' + (current
      ? 'rgba(255,255,255,0.35)'
      : (won ? 'transparent' : 'rgba(255,255,255,0.22)')),
    color: (!current && won) ? '#13260b' : '#fff',
    fontSize: 'clamp(12px, 1.8vh, 14px)',
    fontWeight: 700, textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  });

  const setBoxes = state.completedSets.map((s, i) => {
    const my = s[p], theirs = s[1 - p];
    return <div key={i} style={setBoxStyle(my > theirs, false)}>{my}</div>;
  });
  setBoxes.push(<div key="cur" style={setBoxStyle(false, true)}>{state.games[p]}</div>);

  const pips = [];
  for (let i = 0; i < setsToWin; i++) {
    pips.push(
      <div key={i} style={{
        width: 'clamp(7px, 1.2vh, 9px)', height: 'clamp(7px, 1.2vh, 9px)',
        borderRadius: '50%',
        background: i < setsWon ? '#fff' : 'transparent',
        border: '1.5px solid rgba(255,255,255,0.7)',
        flexShrink: 0,
      }} />
    );
  }

  const rotated = p === 0;

  // Score font size: landscape has less height, so use vw-biased sizing
  const scoreSize = isLandscape
    ? (myPts.length >= 3 ? 'min(14vh, 11vw)' : 'min(20vh, 16vw)')
    : (myPts.length >= 3 ? 'min(20vh, 28vw)' : 'min(26vh, 40vw)');

  // + button: portrait = bottom edge, landscape = net edge (left in unrotated coords → right after rotate for p=0)
  const btnWrapStyle = isLandscape ? {
    position: 'absolute',
    left: 'clamp(10px, 2.5vw, 20px)',
    top: 0, bottom: 0,
    display: 'flex', alignItems: 'center',
  } : {
    position: 'absolute',
    bottom: 'clamp(12px, 3vh, 22px)', left: 0, right: 0,
    display: 'flex', justifyContent: 'center',
  };

  const btnSize = isLandscape
    ? 'min(13vw, 14vh)'
    : 'min(11vh, 18vw)';

  return (
    <div
      onClick={() => onPoint(p)}
      style={{
        flex: 1, position: 'relative',
        color: '#fff', cursor: 'pointer',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}>
      <div style={{
        position: 'absolute', inset: 0,
        transform: rotated ? 'rotate(180deg)' : 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: isLandscape
          ? 'clamp(10px, 2vh, 18px) clamp(12px, 5vw, 32px)'
          : 'clamp(12px, 3vh, 24px) clamp(10px, 3vw, 24px)',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}>
        {/* name + server + pips */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 10px)',
          background: 'rgba(0,0,0,0.40)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          padding: 'clamp(4px, 1vh, 6px) clamp(10px, 3vw, 14px)',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.18)',
        }}>
          {isServer && (
            <div style={{
              width: 'clamp(10px, 1.6vh, 12px)', height: 'clamp(10px, 1.6vh, 12px)',
              borderRadius: '50%',
              background: '#e3ff5b', border: '1.5px solid #fff',
              boxShadow: '0 0 8px rgba(227,255,91,0.6)',
              flexShrink: 0,
            }} title="Server" />
          )}
          <span style={{ fontSize: 'clamp(11px, 1.8vh, 14px)', fontWeight: 600 }}>{state.names[p]}</span>
          <div style={{ width: 1, height: 'clamp(10px, 1.6vh, 12px)', background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', gap: 'clamp(3px, 0.6vw, 4px)' }}>{pips}</div>
        </div>

        {/* big score */}
        <div style={{
          fontSize: scoreSize,
          fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em',
          textShadow: '0 4px 24px rgba(0,0,0,0.4)',
          fontVariantNumeric: 'tabular-nums',
          marginTop: 'clamp(6px, 1.5vh, 12px)',
          marginBottom: 'clamp(6px, 1.2vh, 10px)',
        }}>{myPts}</div>

        {/* set row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 8px)',
          fontSize: 'clamp(9px, 1.4vh, 11px)', letterSpacing: '0.16em',
          textTransform: 'uppercase', opacity: 0.85,
        }}>
          <span style={{ opacity: 0.7 }}>Sett</span>
          <div style={{ display: 'flex', gap: 3 }}>{setBoxes}</div>
        </div>

        {/* tap hint + button */}
        <div style={btnWrapStyle}>
          <div style={{
            width: btnSize, height: btnSize,
            minWidth: 48, minHeight: 48,
            maxWidth: 80, maxHeight: 80,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #d8ff5e 0%, #b6e636 100%)',
            color: '#13260b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isLandscape ? 'min(8vw, 9vh)' : 'min(7vh, 11vw)',
            fontWeight: 300, lineHeight: 1,
            boxShadow: '0 8px 22px rgba(0,0,0,0.4), inset 0 -3px 0 rgba(0,0,0,0.12)',
            border: '3px solid rgba(255,255,255,0.85)',
          }}>+</div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Center controls — portrait: horizontal bar at y=50% (net).
//                   landscape: horizontal bar at top of screen.
// ──────────────────────────────────────────────────────────────
function CenterControls({ state, onUndo, onReset, canUndo, voiceProps, isLandscape }) {
  const Btn = ({ onClick, children, title, disabled }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      title={title}
      style={{
        width: 'clamp(34px, 5.5vh, 42px)', height: 'clamp(34px, 5.5vh, 42px)',
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.22)',
        color: '#fff', fontSize: 'clamp(14px, 2.3vh, 18px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        padding: 0,
      }}>{children}</button>
  );

  const containerStyle = isLandscape ? {
    // Top bar in landscape — visible above both halves
    position: 'absolute',
    left: 0, right: 0, top: 0,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px clamp(8px, 2.5vw, 16px)',
    gap: 8,
    pointerEvents: 'none',
    zIndex: 4,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)',
  } : {
    // Net line in portrait
    position: 'absolute',
    left: 0, right: 0, top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 clamp(8px, 2.5vw, 16px)',
    gap: 8,
    pointerEvents: 'none',
    zIndex: 4,
  };

  return (
    <div style={containerStyle}>
      <div style={{ pointerEvents: 'auto', flexShrink: 0 }}>
        <Btn onClick={onUndo} disabled={!canUndo} title="Angre">↶</Btn>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 999,
        padding: 'clamp(4px, 1vh, 6px) clamp(8px, 2.5vw, 14px)',
        color: '#fff',
        fontSize: 'clamp(9px, 1.6vh, 11px)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 'calc(100% - 100px)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>{statusLine(state)}</div>

      <div style={{ pointerEvents: 'auto', flexShrink: 0, display: 'flex', gap: 6 }}>
        {voiceProps && (
          <MicButton
            enabled={voiceProps.enabled}
            listening={voiceProps.listening}
            supported={voiceProps.supported}
            onToggle={voiceProps.onToggle}
          />
        )}
        <Btn onClick={onReset} title="Nullstill">⟳</Btn>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Winner overlay
// ──────────────────────────────────────────────────────────────
function WinnerOverlay({ state, onNewMatch, onRematch }) {
  const w = state.matchWinner;
  React.useEffect(() => {
    if (w != null) playMatchSound();
  }, [w]);
  if (w == null) return null;
  const summary = state.completedSets.map(s => `${s[0]}–${s[1]}`).join('  ·  ');
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      zIndex: 6, padding: '24px 32px', boxSizing: 'border-box',
      textAlign: 'center',
    }}>
      <Confetti active={true} />
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6, zIndex: 8 }}>Kamp ferdig</div>
      <div style={{ fontSize: 'clamp(22px, 4vh, 30px)', fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em', zIndex: 8 }}>{state.names[w]} vant!</div>
      <div style={{ fontSize: 'clamp(12px, 2vh, 14px)', opacity: 0.75, marginBottom: 22, fontVariantNumeric: 'tabular-nums', zIndex: 8 }}>{summary}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 240, zIndex: 8 }}>
        <button onClick={onRematch} style={{
          background: 'linear-gradient(180deg, #d8ff5e 0%, #b6e636 100%)',
          color: '#13260b', border: '3px solid rgba(255,255,255,0.85)',
          padding: '12px 26px', fontSize: 15, fontWeight: 700,
          borderRadius: 999, cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
        }}>Omkamp</button>
        <button onClick={onNewMatch} style={{
          background: 'transparent',
          color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
          padding: '11px 26px', fontSize: 14, fontWeight: 600,
          borderRadius: 999, cursor: 'pointer',
        }}>Ny kamp</button>
      </div>
    </div>
  );
}

Object.assign(window, { SetupScreen, MatchSide, CenterControls, WinnerOverlay });
