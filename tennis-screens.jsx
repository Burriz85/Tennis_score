// tennis-screens.jsx — setup, match, winner overlay

// ──────────────────────────────────────────────────────────────
// Setup screen
// ──────────────────────────────────────────────────────────────
function SetupScreen({ initial, onStart }) {
  const [n1, setN1] = React.useState(initial.names[0]);
  const [n2, setN2] = React.useState(initial.names[1]);
  const [bestOf, setBestOf] = React.useState(initial.bestOf);
  const [server, setServer] = React.useState(0);
  const [showCoin, setShowCoin] = React.useState(false);

  const fieldStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.22)',
    borderRadius: 12, padding: '12px 16px',
    color: '#fff', fontSize: 17, fontWeight: 500,
    fontFamily: 'inherit', width: '100%',
    boxSizing: 'border-box', outline: 'none', textAlign: 'center',
  };

  const Segment = ({ value, onChange, options }) => (
    <div style={{
      display: 'inline-flex', background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: 3,
    }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          background: value === o.value ? '#d8ff5e' : 'transparent',
          color: value === o.value ? '#13260b' : '#fff',
          border: 'none', padding: '8px 14px', borderRadius: 999,
          fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 80,
        }}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      padding: 'clamp(12px,3vh,24px) clamp(16px,5vw,32px)',
      boxSizing: 'border-box', gap: 'clamp(8px,1.6vh,14px)',
      overflowY: 'auto', overflowX: 'hidden',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>Tennis Score</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>Ny kamp</div>
      </div>
      <div className="setup-names">
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65, display: 'block', marginBottom: 6, textAlign: 'center' }}>Spiller 1</label>
          <input value={n1} onChange={(e) => setN1(e.target.value)} maxLength={14} style={fieldStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65, display: 'block', marginBottom: 6, textAlign: 'center' }}>Spiller 2</label>
          <input value={n2} onChange={(e) => setN2(e.target.value)} maxLength={14} style={fieldStyle} />
        </div>
      </div>
      <div className="setup-options">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.65 }}>Kamp</label>
          <Segment value={bestOf} onChange={setBestOf} options={[
            { value: 3, label: 'Best av 3' }, { value: 5, label: 'Best av 5' },
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
        names: [n1.trim() || 'Spiller 1', n2.trim() || 'Spiller 2'], bestOf, server,
      })} style={{
        background: 'linear-gradient(180deg,#d8ff5e 0%,#b6e636 100%)',
        color: '#13260b', border: '3px solid rgba(255,255,255,0.85)',
        padding: '14px 48px', fontSize: 17, fontWeight: 700,
        borderRadius: 999, cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)', marginTop: 4,
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
// One half of the match court.
// Portrait: p=0 top (rotated 180°), p=1 bottom.
// Landscape: p=0 left, p=1 right (no rotation).
// ──────────────────────────────────────────────────────────────
function MatchSide({ state, p, onPoint }) {
  const [pts1, pts2] = formatPoints(state);
  const myPts = p === 0 ? pts1 : pts2;
  const isServer = state.server === p;
  const setsWon = state.setsWon[p];
  const setsToWin = state.setsToWin;

  const setBoxStyle = (won, current) => ({
    minWidth: 'clamp(22px,4vw,28px)',
    padding: '2px clamp(4px,1vw,6px)',
    borderRadius: 4,
    background: current ? 'rgba(255,255,255,0.20)' : (won ? 'rgba(216,255,94,0.85)' : 'rgba(255,255,255,0.12)'),
    border: '1px solid ' + (current ? 'rgba(255,255,255,0.35)' : (won ? 'transparent' : 'rgba(255,255,255,0.22)')),
    color: (!current && won) ? '#13260b' : '#fff',
    fontSize: 'clamp(12px,1.8vh,14px)', fontWeight: 700,
    textAlign: 'center', fontVariantNumeric: 'tabular-nums',
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
        width: 'clamp(7px,1.2vh,9px)', height: 'clamp(7px,1.2vh,9px)',
        borderRadius: '50%',
        background: i < setsWon ? '#fff' : 'transparent',
        border: '1.5px solid rgba(255,255,255,0.7)', flexShrink: 0,
      }} />
    );
  }

  return (
    <div className={`match-side match-side-p${p}`} style={{
      flex: 1, position: 'relative', color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden',
    }}>
      <div className={p === 0 ? 'side-rotated' : undefined}
        style={{ position: 'absolute', inset: 0 }}>

        {/* Name pill — pinned to top of this half */}
        <div style={{
          position: 'absolute', top: 'clamp(10px,2.5vh,18px)',
          left: 0, right: 0, display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            gap: 'clamp(6px,1.5vw,10px)',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            padding: 'clamp(4px,1vh,6px) clamp(10px,3vw,14px)',
            borderRadius: 999, border: '1px solid rgba(255,255,255,0.18)',
          }}>
            {isServer && (
              <div style={{
                width: 'clamp(9px,1.5vh,11px)', height: 'clamp(9px,1.5vh,11px)',
                borderRadius: '50%', background: '#e3ff5b',
                border: '1.5px solid #fff', boxShadow: '0 0 8px rgba(227,255,91,0.6)',
                flexShrink: 0,
              }} />
            )}
            <span style={{ fontSize: 'clamp(11px,1.8vh,14px)', fontWeight: 600 }}>{state.names[p]}</span>
            <div style={{ width: 1, height: 'clamp(10px,1.6vh,12px)', background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ display: 'flex', gap: 'clamp(3px,0.6vw,4px)' }}>{pips}</div>
          </div>
        </div>

        {/* Score + set boxes — centered */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div className={myPts.length >= 3 ? 'score-num-long' : 'score-num'} style={{
            fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em',
            textShadow: '0 4px 24px rgba(0,0,0,0.35)',
            fontVariantNumeric: 'tabular-nums',
            marginBottom: 'clamp(8px,1.5vh,14px)',
          }}>{myPts}</div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 'clamp(6px,1.5vw,8px)',
            fontSize: 'clamp(9px,1.4vh,11px)', letterSpacing: '0.16em',
            textTransform: 'uppercase', opacity: 0.85,
          }}>
            <span style={{ opacity: 0.7 }}>Sett</span>
            <div style={{ display: 'flex', gap: 3 }}>{setBoxes}</div>
          </div>
        </div>

        {/* + button */}
        <div className="plus-btn-wrap">
          <button className="plus-btn" onClick={() => onPoint(p)}>+</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Center controls
// ──────────────────────────────────────────────────────────────
function CenterControls({ state, onUndo, onReset, canUndo, voiceProps }) {
  const Btn = ({ onClick, children, title, disabled }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled} title={title}
      style={{
        width: 'clamp(34px,5.5vh,42px)', height: 'clamp(34px,5.5vh,42px)',
        borderRadius: '50%', background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.22)',
        color: '#fff', fontSize: 'clamp(14px,2.3vh,18px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1, padding: 0,
      }}>{children}</button>
  );

  return (
    <div className="center-controls-wrap">
      <div className="cc-left" style={{ pointerEvents: 'auto' }}>
        <Btn onClick={onUndo} disabled={!canUndo} title="Angre">↶</Btn>
      </div>
      <div className="cc-mid">
        <div style={{
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999,
          padding: 'clamp(4px,1vh,6px) clamp(8px,2.5vw,14px)',
          color: '#fff', fontSize: 'clamp(9px,1.6vh,11px)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          fontWeight: 600, whiteSpace: 'nowrap',
          fontFamily: 'Inter, system-ui, sans-serif',
          pointerEvents: 'none',
        }}>{statusLine(state)}</div>
      </div>
      <div className="cc-right" style={{ pointerEvents: 'auto' }}>
        {voiceProps && (
          <MicButton
            enabled={voiceProps.enabled} listening={voiceProps.listening}
            supported={voiceProps.supported} onToggle={voiceProps.onToggle}
          />
        )}
        <Btn onClick={onReset} title="Nullstill">⟳</Btn>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sound buttons — floating, portrait=bottom, landscape=right
// ──────────────────────────────────────────────────────────────
function SoundButtons() {
  const btns = [
    { label: 'OUT',   icon: '✕', file: 'sound-out.mp3',   bg: '#e53935' },
    { label: 'FAULT', icon: '!', file: 'sound-fault.mp3', bg: '#ef6c00' },
    { label: 'LET',   icon: '↺', file: 'sound-let.mp3',   bg: '#1976d2' },
  ];
  return (
    <div className="sound-buttons-wrap">
      {btns.map(({ label, icon, file, bg }) => (
        <button key={label}
          onClick={(e) => { e.stopPropagation(); playFile(file); }}
          style={{
            background: bg, color: '#fff', border: 'none',
            borderRadius: 10,
            padding: 'clamp(7px,1.5vh,10px) clamp(14px,2.8vw,20px)',
            fontSize: 'clamp(11px,1.7vh,14px)', fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.07em', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 3px 10px rgba(0,0,0,0.35)',
            whiteSpace: 'nowrap',
          }}>
          <span style={{ fontSize: '1em', lineHeight: 1 }}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Hamburger menu — court surface picker
// ──────────────────────────────────────────────────────────────
function HamburgerMenu({ court, onChange }) {
  const [open, setOpen] = React.useState(false);

  const courts = [
    { value: 'hard',  label: 'Hard',  dot: '#1f5fa8' },
    { value: 'clay',  label: 'Grus',  dot: '#c75a2e' },
    { value: 'grass', label: 'Gress', dot: '#3d7a3a' },
  ];

  return (
    <>
      <button
        className="hamburger-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        title="Innstillinger"
      >☰</button>

      {open && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 9 }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              position: 'absolute', top: 60, right: 14,
              background: 'rgba(10,10,10,0.92)',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 14, padding: '14px 16px',
              minWidth: 170, fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 10,
              letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10,
            }}>Underlag</div>
            {courts.map(c => (
              <button key={c.value}
                onClick={() => { onChange(c.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', marginBottom: 6,
                  background: court === c.value ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: '#fff',
                  border: '1px solid ' + (court === c.value ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'),
                  borderRadius: 8, padding: '9px 12px',
                  fontSize: 14, fontWeight: court === c.value ? 700 : 500,
                  fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
                }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: c.dot, flexShrink: 0,
                }} />
                {c.label}
                {court === c.value && <span style={{ marginLeft: 'auto', opacity: 0.7 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Winner overlay
// ──────────────────────────────────────────────────────────────
function WinnerOverlay({ state, onNewMatch, onRematch }) {
  const w = state.matchWinner;
  React.useEffect(() => { if (w != null) playMatchSound(); }, [w]);
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
      zIndex: 6, padding: '24px 32px', boxSizing: 'border-box', textAlign: 'center',
    }}>
      <Confetti active={true} />
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6, zIndex: 8 }}>Kamp ferdig</div>
      <div style={{ fontSize: 'clamp(22px,4vh,30px)', fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em', zIndex: 8 }}>{state.names[w]} vant!</div>
      <div style={{ fontSize: 'clamp(12px,2vh,14px)', opacity: 0.75, marginBottom: 22, fontVariantNumeric: 'tabular-nums', zIndex: 8 }}>{summary}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 240, zIndex: 8 }}>
        <button onClick={onRematch} style={{
          background: 'linear-gradient(180deg,#d8ff5e 0%,#b6e636 100%)',
          color: '#13260b', border: '3px solid rgba(255,255,255,0.85)',
          padding: '12px 26px', fontSize: 15, fontWeight: 700,
          borderRadius: 999, cursor: 'pointer', boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
        }}>Omkamp</button>
        <button onClick={onNewMatch} style={{
          background: 'transparent', color: '#fff',
          border: '1.5px solid rgba(255,255,255,0.4)',
          padding: '11px 26px', fontSize: 14, fontWeight: 600,
          borderRadius: 999, cursor: 'pointer',
        }}>Ny kamp</button>
      </div>
    </div>
  );
}

Object.assign(window, { SetupScreen, MatchSide, CenterControls, SoundButtons, HamburgerMenu, WinnerOverlay });
