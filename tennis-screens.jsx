// tennis-screens.jsx — setup, match, winner overlay
// Orientation handled by CSS classes defined in tennis-app.jsx (AppStyles)

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
          minWidth: 80,
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
      padding: 'clamp(12px, 3vh, 24px) clamp(16px, 5vw, 32px)',
      boxSizing: 'border-box',
      gap: 'clamp(8px, 1.6vh, 14px)',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>Tennis Score</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>Ny kamp</div>
      </div>

      {/* .setup-names: column in portrait, row in landscape (CSS) */}
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

      {/* .setup-options: column in portrait, row in landscape (CSS) */}
      <div className="setup-options">
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
        marginTop: 4,
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
// Landscape: p=0 left (rotated 180°), p=1 right.
// Layout switching is CSS-driven (.match-halves flex-direction).
// ──────────────────────────────────────────────────────────────
function MatchSide({ state, p, onPoint }) {
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

  return (
    <div
      className={`match-side match-side-p${p}`}
      style={{
        flex: 1, position: 'relative',
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}>
      <div className={p === 0 ? 'side-rotated' : undefined} style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(12px, 3vh, 24px) clamp(10px, 3vw, 24px)',
        boxSizing: 'border-box',
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

        {/* big score — CSS classes handle font-size per orientation */}
        <div
          className={myPts.length >= 3 ? 'score-num-long' : 'score-num'}
          style={{
            fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em',
            textShadow: '0 4px 24px rgba(0,0,0,0.4)',
            fontVariantNumeric: 'tabular-nums',
            marginTop: 'clamp(8px, 2vh, 14px)',
            marginBottom: 'clamp(8px, 1.5vh, 12px)',
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

        {/* + button — only tappable element that awards a point */}
        <div className="plus-btn-wrap">
          <button className="plus-btn" onClick={() => onPoint(p)}>+</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Center controls — .center-controls-wrap positions via CSS
// ──────────────────────────────────────────────────────────────
function CenterControls({ state, onUndo, onReset, canUndo, voiceProps }) {
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

  const soundBtns = [
    { label: 'Ute',  play: playOutSound,  say: 'Out',   lang: 'en-GB', color: '#ff5e5e' },
    { label: 'Let',  play: playLetSound,  say: 'Let',   lang: 'en-GB', color: '#d8ff5e' },
    { label: 'Feil', play: playFoulSound, say: 'Fault', lang: 'en-GB', color: '#ff9d3a' },
  ];

  return (
    <div className="center-controls-wrap">
      {/* row 1: undo / status / mic+reset */}
      <div style={{ pointerEvents: 'auto', flexShrink: 0 }}>
        <Btn onClick={onUndo} disabled={!canUndo} title="Angre">↶</Btn>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
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
          maxWidth: '100%',
          fontFamily: 'Inter, system-ui, sans-serif',
          pointerEvents: 'none',
        }}>{statusLine(state)}</div>

        {/* row 2: sound buttons */}
        <div style={{ display: 'flex', gap: 'clamp(6px,1.5vw,10px)', pointerEvents: 'auto' }}>
          {soundBtns.map(({ label, play, say, lang, color }) => (
            <button key={label}
              onClick={(e) => { e.stopPropagation(); play(); speak(say, lang); }}
              style={{
                background: 'rgba(0,0,0,0.60)',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                border: `1.5px solid ${color}88`,
                color,
                borderRadius: 999,
                padding: 'clamp(4px,1vh,6px) clamp(10px,2.5vw,16px)',
                fontSize: 'clamp(10px,1.6vh,13px)',
                fontWeight: 700,
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}>{label}</button>
          ))}
        </div>
      </div>

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
// Sound buttons — Out / Let / Foul
// ──────────────────────────────────────────────────────────────
function SoundButtons() {
  const btns = [
    { label: 'Ute',  play: playOutSound,  say: 'Out',  lang: 'en-GB', color: '#ff5e5e' },
    { label: 'Let',  play: playLetSound,  say: 'Let',  lang: 'en-GB', color: '#d8ff5e' },
    { label: 'Feil', play: playFoulSound, say: 'Fault', lang: 'en-GB', color: '#ff9d3a' },
  ];
  return (
    <div className="sound-buttons-wrap">
      {btns.map(({ label, play, say, color }) => (
        <button
          key={label}
          onClick={(e) => { e.stopPropagation(); play(); speak(say, lang); }}
          style={{
            background: 'rgba(0,0,0,0.60)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            border: `1.5px solid ${color}55`,
            color,
            borderRadius: 999,
            padding: 'clamp(5px,1.2vh,8px) clamp(12px,3vw,20px)',
            fontSize: 'clamp(11px,1.8vh,14px)',
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}>{label}</button>
      ))}
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

Object.assign(window, { SetupScreen, MatchSide, CenterControls, WinnerOverlay, SoundButtons });
