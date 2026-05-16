// tennis-app.jsx — orientation handled purely by CSS (no JS re-render on rotate)

function AppStyles() {
  return (
    <style>{`
      /* Courts */
      .court-portrait  { position: absolute; inset: 0; }
      .court-landscape { position: absolute; inset: 0; display: none; }
      @media (orientation: landscape) {
        .court-portrait  { display: none; }
        .court-landscape { display: block; }
      }

      /* Match halves */
      .match-halves { position: absolute; inset: 0; display: flex; flex-direction: column; }
      @media (orientation: landscape) { .match-halves { flex-direction: row; } }

      /* Center controls */
      .center-controls-wrap {
        position: absolute; left: 0; right: 0; z-index: 4;
        top: 50%; transform: translateY(-50%);
        display: grid; grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 0 clamp(8px,2.5vw,16px); gap: 8px;
        pointer-events: none;
      }
      .center-controls-wrap .cc-left  { display: flex; justify-content: flex-start; }
      .center-controls-wrap .cc-mid   { display: flex; justify-content: center; }
      .center-controls-wrap .cc-right { display: flex; justify-content: flex-end; gap: 6px; }
      @media (orientation: landscape) {
        .center-controls-wrap {
          top: 0; transform: none;
          padding: 8px clamp(8px,2.5vw,16px);
          background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%);
        }
      }

      /* Score number */
      .score-num      { font-size: min(26vh, 40vw); }
      .score-num-long { font-size: min(20vh, 28vw); }
      @media (orientation: landscape) {
        .score-num      { font-size: min(20vh, 16vw); }
        .score-num-long { font-size: min(14vh, 11vw); }
      }

      /* Player 0: rotated in portrait, normal in landscape */
      .side-rotated { transform: rotate(180deg); }
      @media (orientation: landscape) { .side-rotated { transform: none; } }

      /* + button wrapper */
      .plus-btn-wrap {
        position: absolute;
        bottom: clamp(12px,3vh,22px); left: 0; right: 0;
        display: flex; justify-content: center;
      }
      @media (orientation: landscape) {
        .plus-btn-wrap {
          bottom: clamp(10px,2.5vh,18px); left: clamp(10px,2.5vw,20px); right: auto;
          justify-content: flex-start; align-items: center;
        }
        .match-side-p1 .plus-btn-wrap {
          left: auto; right: clamp(10px,2.5vw,20px); justify-content: flex-end;
        }
      }

      /* + button */
      .plus-btn {
        width: min(11vh,18vw); height: min(11vh,18vw);
        min-width: 48px; min-height: 48px; max-width: 80px; max-height: 80px;
        border-radius: 50%;
        background: linear-gradient(180deg, #d8ff5e 0%, #b6e636 100%);
        color: #13260b;
        display: flex; align-items: center; justify-content: center;
        font-size: min(7vh,11vw); font-weight: 300; line-height: 1;
        box-shadow: 0 8px 22px rgba(0,0,0,0.4), inset 0 -3px 0 rgba(0,0,0,0.12);
        border: 3px solid rgba(255,255,255,0.85); cursor: pointer;
      }
      @media (orientation: landscape) {
        .plus-btn { width: min(13vw,14vh); height: min(13vw,14vh); font-size: min(8vw,9vh); }
      }

      /* Sound buttons — portrait: bottom-right (player 2 side, clear of net controls)
                          landscape: right side vertically centred */
      .sound-buttons-wrap {
        position: absolute; z-index: 5; pointer-events: none;
        bottom: clamp(70px,14vh,110px); right: clamp(8px,1.5vw,16px);
        display: flex; flex-direction: column; align-items: flex-end;
        gap: clamp(6px,1.2vh,10px);
      }
      .sound-buttons-wrap button { pointer-events: auto; }
      @media (orientation: landscape) {
        .sound-buttons-wrap {
          bottom: auto;
          top: 50%; transform: translateY(-50%);
        }
      }

      /* Hamburger button */
      .hamburger-btn {
        position: absolute; top: clamp(10px,2.2vh,18px); right: clamp(10px,2.2vw,18px);
        z-index: 5; width: 36px; height: 36px;
        background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.22);
        color: #fff; font-size: 17px; border-radius: 9px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        pointer-events: auto;
      }

      /* Setup screen names */
      .setup-names {
        display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 340px;
      }
      @media (orientation: landscape) { .setup-names { flex-direction: row; max-width: 560px; } }

      /* Setup options */
      .setup-options { display: flex; flex-direction: column; gap: 14px; align-items: center; }
      @media (orientation: landscape) { .setup-options { flex-direction: row; gap: 24px; } }
    `}</style>
  );
}

function AppFull() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  const [screen, setScreen] = React.useState('setup');
  const [lastSetup, setLastSetup] = React.useState({
    names: ['Spiller 1', 'Spiller 2'], bestOf: 5, server: 0,
  });
  const [history, setHistory] = React.useState([]);
  const [state, setState] = React.useState(makeInitialMatch(['Spiller 1', 'Spiller 2'], 5, 0));
  const [voiceOn, setVoiceOn] = React.useState(false);

  useWakeLock(screen === 'match' && state.matchWinner == null);

  const handlePointRef = React.useRef(null);

  const handleVoiceCommand = React.useCallback((cmd) => {
    if (cmd && cmd.kind === 'point') {
      handlePointRef.current && handlePointRef.current(cmd.player);
    }
  }, []);
  const voice = useVoice({
    enabled: voiceOn && screen === 'match' && state.matchWinner == null,
    onCommand: handleVoiceCommand,
  });

  function toggleVoice() {
    if (!voice.supported) {
      alert('Stemmegjenkjenning støttes ikke i denne nettleseren. Test på telefonen i Chrome.');
      return;
    }
    setVoiceOn(v => !v);
  }

  function startMatch(cfg) {
    setLastSetup(cfg);
    setState(makeInitialMatch(cfg.names, cfg.bestOf, cfg.server));
    setHistory([]);
    setScreen('match');
  }
  function handlePoint(p) {
    if (state.matchWinner != null) return;
    const prevState = state;
    const nextState = awardPoint(state, p);
    setHistory((h) => [...h, prevState]);
    setState(nextState);
    const gameWon  = nextState.games[0] + nextState.games[1] > prevState.games[0] + prevState.games[1];
    const setWon   = nextState.completedSets.length > prevState.completedSets.length;
    const matchWon = nextState.matchWinner != null && prevState.matchWinner == null;
    if (matchWon) return;
    if (setWon) playSetSound();
    else if (gameWon) playGameSound();
  }
  handlePointRef.current = handlePoint;

  function handleUndo() {
    if (history.length === 0) return;
    setState(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  }
  function handleReset() {
    if (!confirm('Vil du nullstille kampen og gå tilbake til oppsett?')) return;
    setScreen('setup');
  }
  function handleNewMatch() { setScreen('setup'); }
  function handleRematch() {
    setState(makeInitialMatch(lastSetup.names, lastSetup.bestOf, lastSetup.server));
    setHistory([]);
  }

  const courtBg = { hard: '#1a4a80', clay: '#2d4a26', grass: '#3f5a26' }[t.court] || '#1a4a80';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: courtBg }}>
      <AppStyles />

      <div className="court-portrait"><CourtBackground palette={t.court} /></div>
      <div className="court-landscape"><CourtBackgroundLandscape palette={t.court} /></div>

      {screen === 'setup' && (
        <SetupScreen initial={lastSetup} onStart={startMatch} />
      )}
      {screen === 'match' && (
        <>
          <div className="match-halves">
            <MatchSide state={state} p={0} onPoint={handlePoint} />
            <MatchSide state={state} p={1} onPoint={handlePoint} />
          </div>
          <CenterControls
            state={state}
            onUndo={handleUndo}
            onReset={handleReset}
            canUndo={history.length > 0}
            voiceProps={{
              enabled: voiceOn, listening: voice.listening,
              supported: voice.supported, onToggle: toggleVoice,
            }}
          />
          <SoundButtons />
          <VoiceToast heard={voice.lastHeard} />
          <WinnerOverlay state={state} onNewMatch={handleNewMatch} onRematch={handleRematch} />
        </>
      )}

      <HamburgerMenu court={t.court} onChange={(v) => setTweak('court', v)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('stage')).render(<AppFull />);
