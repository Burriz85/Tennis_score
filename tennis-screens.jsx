// tennis-screens.jsx — setup, match, winner overlay

// ──────────────────────────────────────────────────────────────
// Setup screen — preset-driven with Single / Double toggle
// ──────────────────────────────────────────────────────────────
function SetupScreen({ initial, onStart }) {
  const init = initial || {};
  const presets = window.MATCH_PRESETS || [];

  // ── derive initial state from `initial` (back-compat with old shape) ──
  const initIsDoubles =
    init.mode === 'doubles' ||
    (Array.isArray(init.players) && Array.isArray(init.players[0]) && init.players[0].length > 1);
  const initT1 = Array.isArray(init.players?.[0]) ? init.players[0] : [init.players?.[0] ?? init.names?.[0] ?? 'Spiller 1', ''];
  const initT2 = Array.isArray(init.players?.[1]) ? init.players[1] : [init.players?.[1] ?? init.names?.[1] ?? 'Spiller 2', ''];

  const [mode, setMode] = React.useState(initIsDoubles ? 'doubles' : 'singles');
  const [t1a, setT1a] = React.useState(initT1[0] || 'Spiller 1');
  const [t1b, setT1b] = React.useState(initT1[1] || '');
  const [t2a, setT2a] = React.useState(initT2[0] || 'Spiller 2');
  const [t2b, setT2b] = React.useState(initT2[1] || '');
  const [presetId, setPresetId] = React.useState(init.presetId || presets[0]?.id || 'std3');
  const [server, setServer] = React.useState(init.server ?? 0);
  const [showCoin, setShowCoin] = React.useState(false);

  const fieldStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.22)',
    borderRadius: 12, padding: '11px 14px',
    color: '#fff', fontSize: 16, fontWeight: 500,
    fontFamily: 'inherit', width: '100%',
    boxSizing: 'border-box', outline: 'none', textAlign: 'center',
  };
  const labelCSS = {
    fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
    opacity: 0.62, display: 'block', marginBottom: 6, textAlign: 'center',
  };

  // ── Mode toggle (sliding-thumb segmented control) ──
  const ModeSlider = () => (
    <div style={{
      position: 'relative', display: 'inline-flex',
      background: 'rgba(0,0,0,0.38)', border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: 999, padding: 4, width: 240,
    }}>
      <div style={{
        position: 'absolute', top: 4, bottom: 4,
        left: mode === 'singles' ? 4 : '50%',
        width: 'calc(50% - 4px)',
        background: 'linear-gradient(180deg,#d8ff5e 0%,#b6e636 100%)',
        borderRadius: 999, transition: 'left 0.22s cubic-bezier(.4,1.4,.6,1)',
        boxShadow: '0 2px 8px rgba(216,255,94,0.35)',
      }} />
      {[
        { v: 'singles', label: 'Single' },
        { v: 'doubles', label: 'Double' },
      ].map(o => (
        <button key={o.v} onClick={() => setMode(o.v)} style={{
          position: 'relative', flex: 1, zIndex: 1,
          background: 'transparent', border: 'none',
          color: mode === o.v ? '#13260b' : '#fff',
          padding: '9px 0', fontSize: 14, fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer',
          letterSpacing: '0.02em',
          transition: 'color 0.2s ease',
        }}>{o.label}</button>
      ))}
    </div>
  );

  // ── Preset card (selectable rule pack) ──
  const PresetCard = ({ p }) => {
    const active = presetId === p.id;
    return (
      <button onClick={() => setPresetId(p.id)} style={{
        textAlign: 'left',
        background: active ? 'rgba(216,255,94,0.16)' : 'rgba(255,255,255,0.05)',
        border: '1.5px solid ' + (active ? '#d8ff5e' : 'rgba(255,255,255,0.13)'),
        borderRadius: 13, padding: '10px 12px',
        color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 11, width: '100%',
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '2px solid ' + (active ? '#d8ff5e' : 'rgba(255,255,255,0.42)'),
          background: active ? '#d8ff5e' : 'transparent',
          flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 1 }}>{p.label}</div>
          <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.35 }}>{p.sub}</div>
        </div>
      </button>
    );
  };

  // Server segmented control — labels swap based on mode
  const ServerSeg = () => {
    const leftLabel  = mode === 'doubles' ? (t1a || 'Lag 1') : (t1a || 'Spiller 1');
    const rightLabel = mode === 'doubles' ? (t2a || 'Lag 2') : (t2a || 'Spiller 2');
    const opts = [
      { value: 0, label: leftLabel.length > 9 ? leftLabel.slice(0, 9) + '…' : leftLabel },
      { value: 1, label: rightLabel.length > 9 ? rightLabel.slice(0, 9) + '…' : rightLabel },
      { value: 'coin', label: '🪙' },
    ];
    return (
      <div style={{
        display: 'inline-flex', background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: 3,
      }}>
        {opts.map(o => (
          <button key={String(o.value)} onClick={() => o.value === 'coin' ? setShowCoin(true) : setServer(o.value)} style={{
            background: server === o.value ? '#d8ff5e' : 'transparent',
            color: server === o.value ? '#13260b' : '#fff',
            border: 'none', padding: '7px 12px', borderRadius: 999,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>{o.label}</button>
        ))}
      </div>
    );
  };

  const handleStart = () => {
    const clean = (s, fb) => (s || '').trim() || fb;
    const players = mode === 'doubles'
      ? [
          [clean(t1a, 'A1'), clean(t1b, 'A2')],
          [clean(t2a, 'B1'), clean(t2b, 'B2')],
        ]
      : [clean(t1a, 'Spiller 1'), clean(t2a, 'Spiller 2')];
    const preset = presets.find(p => p.id === presetId) || presets[0];
    onStart({ mode, players, rules: preset?.rules, presetId, server });
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0c1424 0%, #050a14 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: 'clamp(16px,4vh,32px) clamp(16px,5vw,28px)',
      boxSizing: 'border-box',
      overflowY: 'auto', overflowX: 'hidden',
      color: '#fff',
    }}>
      {/* Subtle decorative court silhouette behind everything */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(120% 60% at 50% 0%, rgba(31,95,168,0.22) 0%, transparent 60%),' +
          'radial-gradient(120% 60% at 50% 100%, rgba(216,255,94,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 400,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(12px,2vh,16px)',
      }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 4 }}>Tennis Score</div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' }}>Ny kamp</div>
      </div>

      <ModeSlider />

      {/* Player name fields — adapt to mode */}
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'singles' ? (
          <>
            <div>
              <label style={labelCSS}>Spiller 1 (øverst)</label>
              <input value={t1a} onChange={(e) => setT1a(e.target.value)} maxLength={14} style={fieldStyle} />
            </div>
            <div>
              <label style={labelCSS}>Spiller 2 (nederst)</label>
              <input value={t2a} onChange={(e) => setT2a(e.target.value)} maxLength={14} style={fieldStyle} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={labelCSS}>Lag 1 (øverst)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={t1a} onChange={(e) => setT1a(e.target.value)} maxLength={10} placeholder="Spiller A" style={fieldStyle} />
                <input value={t1b} onChange={(e) => setT1b(e.target.value)} maxLength={10} placeholder="Spiller B" style={fieldStyle} />
              </div>
            </div>
            <div>
              <label style={labelCSS}>Lag 2 (nederst)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={t2a} onChange={(e) => setT2a(e.target.value)} maxLength={10} placeholder="Spiller A" style={fieldStyle} />
                <input value={t2b} onChange={(e) => setT2b(e.target.value)} maxLength={10} placeholder="Spiller B" style={fieldStyle} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Format preset cards */}
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 6, paddingLeft: 2 }}>Format</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {presets.map(p => <PresetCard key={p.id} p={p} />)}
        </div>
      </div>

      {/* Server */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <label style={{ ...labelCSS, marginBottom: 0 }}>Server</label>
        <ServerSeg />
      </div>

      <button onClick={handleStart} style={{
        background: 'linear-gradient(180deg,#d8ff5e 0%,#b6e636 100%)',
        color: '#13260b', border: '3px solid rgba(255,255,255,0.85)',
        padding: '13px 44px', fontSize: 16, fontWeight: 700,
        borderRadius: 999, cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)', marginTop: 2,
      }}>Start kamp</button>

      {showCoin && (
        <CoinToss
          names={[
            mode === 'doubles' ? `${t1a} / ${t1b}` : (t1a || 'Spiller 1'),
            mode === 'doubles' ? `${t2a} / ${t2b}` : (t2a || 'Spiller 2'),
          ]}
          onDone={(w) => { setServer(w); setShowCoin(false); }}
        />
      )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Serve pips — two dots showing 1st/2nd serve state
// ──────────────────────────────────────────────────────────────
function ServePips({ active, fault, small }) {
  if (!active) return null;
  const size = small ? 'clamp(7px,1.2vh,9px)' : 'clamp(9px,1.5vh,11px)';
  const dot = (lit) => (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: lit ? '#e3ff5b' : 'transparent',
      border: '1.5px solid ' + (lit ? '#e3ff5b' : 'rgba(255,255,255,0.55)'),
      boxShadow: lit ? '0 0 8px rgba(227,255,91,0.55)' : 'none',
      flexShrink: 0,
    }} />
  );
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}
      title={fault ? '2. serve' : '1. serve'}>
      {dot(!fault)}
      {dot(fault)}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// One half of the match court.
// Portrait: p=0 top (rotated 180°), p=1 bottom.
// Landscape: p=0 left, p=1 right (no rotation).
// ──────────────────────────────────────────────────────────────
function MatchSide({ state, p, side, onPoint }) {
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
    <div className={`match-side match-side-p${p} match-side-${side || (p === 0 ? 'left' : 'right')}`} style={{
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
            {state.mode !== 'doubles' && (
              <ServePips active={isServer} fault={state.serveFault} />
            )}
            {state.mode === 'doubles' ? (
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                gap: 'clamp(5px,1.2vw,8px)',
                fontSize: 'clamp(11px,1.8vh,14px)', fontWeight: 600,
              }}>
                {(state.players?.[p] || [state.names[p]]).map((nm, idx, arr) => {
                  const activeHere = isServer && (state.serverPlayer?.[p] ?? 0) === idx;
                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <span style={{ opacity: 0.35, fontSize: '0.9em' }}>·</span>
                      )}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        gap: 'clamp(4px,1vw,6px)',
                        opacity: activeHere ? 1 : 0.55,
                      }}>
                        {activeHere && (
                          <ServePips active={true} fault={state.serveFault} small />
                        )}
                        {nm}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <span style={{ fontSize: 'clamp(11px,1.8vh,14px)', fontWeight: 600 }}>{state.names[p]}</span>
            )}
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
      <div className="cc-left" style={{ pointerEvents: 'auto', gap: 6 }}>
        <Btn onClick={onUndo} disabled={!canUndo} title="Angre">↶</Btn>
        {voiceProps && (
          <MicButton
            enabled={voiceProps.enabled} listening={voiceProps.listening}
            supported={voiceProps.supported} onToggle={voiceProps.onToggle}
          />
        )}
        <Btn onClick={onReset} title="Nullstill">⟳</Btn>
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
      <div className="cc-right" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sound buttons — also fire engine actions for FAULT and LET.
// OUT stays as a vocal call only (intent is ambiguous; the player
// taps + on their own side to award the point).
// ──────────────────────────────────────────────────────────────
function SoundButtons({ onFault, onLet, serveFault }) {
  const btns = [
    { label: 'OUT',   icon: '✕', file: 'sound-out.mp3',   bg: '#e53935', action: 'sound' },
    { label: 'FAULT', icon: '!', file: 'sound-fault.mp3', bg: '#ef6c00', action: 'fault' },
    { label: 'LET',   icon: '↺', file: 'sound-let.mp3',   bg: '#1976d2', action: 'let' },
  ];
  return (
    <div className="sound-buttons-wrap">
      {btns.map(({ label, icon, file, bg, action }) => {
        const showFaultBadge = action === 'fault' && serveFault;
        return (
          <button key={label}
            onClick={(e) => {
              e.stopPropagation();
              playFile(file);
              if (action === 'fault' && onFault) onFault();
              else if (action === 'let' && onLet) onLet();
            }}
            style={{
              background: bg, color: '#fff', border: 'none',
              borderRadius: 10,
              padding: 'clamp(7px,1.5vh,10px) clamp(14px,2.8vw,20px)',
              fontSize: 'clamp(11px,1.7vh,14px)', fontWeight: 700,
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '0.07em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: showFaultBadge
                ? '0 0 0 2px #e3ff5b, 0 3px 10px rgba(0,0,0,0.35)'
                : '0 3px 10px rgba(0,0,0,0.35)',
              whiteSpace: 'nowrap', position: 'relative',
            }}>
            <span style={{ fontSize: '1em', lineHeight: 1 }}>{icon}</span>
            {label}
            {showFaultBadge && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#e3ff5b', color: '#13260b',
                fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
                padding: '2px 5px', borderRadius: 999,
                border: '1.5px solid #1a1a1a',
                lineHeight: 1,
              }}>1.</span>
            )}
          </button>
        );
      })}
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
// Changeover overlay — appears briefly when players switch sides
// ──────────────────────────────────────────────────────────────
function ChangeoverOverlay({ show, onDismiss }) {
  React.useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDismiss && onDismiss(), 4500);
    return () => clearTimeout(t);
  }, [show, onDismiss]);
  if (!show) return null;
  return (
    <div onClick={onDismiss} style={{
      position: 'absolute', inset: 0,
      background: 'rgba(8,12,20,0.78)',
      backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 18, color: '#fff', zIndex: 7,
      animation: 'changeoverFade 220ms ease-out',
      cursor: 'pointer',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: '#d8ff5e', fontWeight: 700,
      }}>Bytt side</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 28,
        fontSize: 'clamp(40px,7vh,56px)', color: '#d8ff5e',
      }}>
        <div style={{ animation: 'changeoverRight 1.4s ease-in-out infinite' }}>→</div>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          border: '2px dashed rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: 'rgba(255,255,255,0.85)',
        }}>↔</div>
        <div style={{ animation: 'changeoverLeft 1.4s ease-in-out infinite' }}>←</div>
      </div>
      <div style={{
        fontSize: 13, color: 'rgba(255,255,255,0.65)',
        maxWidth: 240, textAlign: 'center', lineHeight: 1.4,
      }}>Spillerne bytter banehalvdel.<br/>Tapp for å lukke.</div>
      <style>{`
        @keyframes changeoverFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes changeoverRight {
          0%,100% { transform: translateX(-8px); opacity: 0.55; }
          50%     { transform: translateX(8px);  opacity: 1; }
        }
        @keyframes changeoverLeft {
          0%,100% { transform: translateX(8px);  opacity: 0.55; }
          50%     { transform: translateX(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Winner overlay — match summary with duration + share-as-image
// ──────────────────────────────────────────────────────────────
function WinnerOverlay({ state, onNewMatch, onRematch }) {
  const w = state.matchWinner;
  // ALL hooks must come before any early return.
  React.useEffect(() => {
    if (w != null) playMatchSound();
  }, [w]);
  const [sharing, setSharing] = React.useState(false);
  if (w == null) return null;

  const totalGames = state.completedSets.reduce((n, s) => n + s[0] + s[1], 0);
  const duration = formatDuration(matchDurationMs(state));
  const summary = state.completedSets.map(s => `${s[0]}–${s[1]}`).join('  ·  ');

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareMatchSummary(state);
    } finally {
      setSharing(false);
    }
  };

  const Stat = ({ label, value }) => (
    <div style={{
      flex: 1, padding: '10px 8px', textAlign: 'center',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 10, minWidth: 80,
    }}>
      <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 'clamp(16px,2.6vh,20px)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.78)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      zIndex: 6, padding: '24px 28px', boxSizing: 'border-box', textAlign: 'center',
      overflowY: 'auto',
    }}>
      <Confetti active={true} />
      <div style={{ position: 'relative', zIndex: 8, width: '100%', maxWidth: 360,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.65 }}>Kamp ferdig</div>
        <div style={{ fontSize: 'clamp(24px,4.2vh,32px)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          {state.names[w]}<br/>
          <span style={{ fontSize: '0.65em', fontWeight: 500, opacity: 0.85 }}>vant kampen</span>
        </div>
        <div style={{
          fontSize: 'clamp(18px,3vh,22px)', fontWeight: 700,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.06em',
          color: '#d8ff5e',
        }}>{summary}</div>

        <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 4 }}>
          <Stat label="Varighet" value={duration} />
          <Stat label="Games" value={totalGames} />
          <Stat label="Sett" value={state.completedSets.length} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 6 }}>
          <button onClick={handleShare} disabled={sharing} style={{
            background: 'transparent', color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.35)',
            padding: '11px 26px', fontSize: 14, fontWeight: 600,
            borderRadius: 999, cursor: sharing ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: sharing ? 0.6 : 1,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            {sharing ? 'Lager bilde…' : 'Del som bilde'}
          </button>
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
    </div>
  );
}

Object.assign(window, {
  SetupScreen, MatchSide, CenterControls, SoundButtons,
  HamburgerMenu, WinnerOverlay, ChangeoverOverlay, ServePips,
});
