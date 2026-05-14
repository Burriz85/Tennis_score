// tennis-app.jsx — orientation handled purely by CSS (no JS re-render on rotate)

function AppStyles() {
  return (
    <style>{`
      /* Courts: show portrait in portrait, landscape in landscape */
      .court-portrait { position: absolute; inset: 0; }
      .court-landscape { position: absolute; inset: 0; display: none; }
      @media (orientation: landscape) {
        .court-portrait { display: none; }
        .court-landscape { display: block; }
      }

      /* Match halves: stack vertically in portrait, side by side in landscape */
      .match-halves { position: absolute; inset: 0; display: flex; flex-direction: column; }
      @media (orientation: landscape) { .match-halves { flex-direction: row; } }

      /* Center controls: at the net in portrait, top bar in landscape */
      .center-controls-wrap {
        position: absolute; left: 0; right: 0; z-index: 4;
        top: 50%; transform: translateY(-50%);
        display: flex; justify-content: space-between; align-items: center;
        padding: 0 clamp(8px,2.5vw,16px); gap: 8px;
        pointer-events: none;
      }
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

      /* Player 0 side: rotated in portrait (reads from top of net), normal in landscape */
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
          left: auto; right: clamp(10px,2.5vw,20px);
          justify-content: flex-end;
        }
      }

      /* + button */
      .plus-btn {
        width: min(11vh,18vw); height: min(11vh,18vw);
        min-width: 48px; min-height: 48px;
        max-width: 80px; max-height: 80px;
        border-radius: 50%;
        background: linear-gradient(180deg, #d8ff5e 0%, #b6e636 100%);
        color: #13260b;
        display: flex; align-items: center; justify-content: center;
        font-size: min(7vh,11vw); font-weight: 300; line-height: 1;
        box-shadow: 0 8px 22px rgba(0,0,0,0.4), inset 0 -3px 0 rgba(0,0,0,0.12);
        border: 3px solid rgba(255,255,255,0.85);
      }
      @media (orientation: landscape) {
        .plus-btn {
          width: min(13vw,14vh); height: min(13vw,14vh);
          font-size: min(8vw,9vh);
        }
      }

      /* Sound buttons strip — just below the center controls at the net */
      .sound-buttons-wrap {
        position: absolute;
        top: calc(50% + clamp(24px,4.5vh,36px));
        left: 0; right: 0;
        display: flex; justify-content: center; gap: clamp(8px,2vw,14px);
        z-index: 4; pointer-events: none;
      }
      .sound-buttons-wrap button { pointer-events: auto; }
      @media (orientation: landscape) {
        .sound-buttons-wrap {
          top: clamp(44px,7vh,58px);
        }
      }

      /* Setup screen names: stack in portrait, side by side in landscape */
      .setup-names {
        display: flex; flex-direction: column; gap: 14px;
        width: 100%; max-width: 340px;
      }
      @media (orientation: landscape) {
        .setup-names { flex-direction: row; max-width: 560px; }
      }

      /* Setup options row */
      .setup-options {
        display: flex; flex-direction: column; gap: 14px; align-items: center;
      }
      @media (orientation: landscape) {
        .setup-options { flex-direction: row; gap: 24px; }
      }
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

    const gameWon = nextState.games[0] + nextState.games[1] >
                    prevState.games[0] + prevState.games[1];
    const setWon  = nextState.completedSets.length > prevState.completedSets.length;
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

  // Match court surround colour so there is never a black flash during rotation
  const courtBg = { hard: '#2f6b2f', clay: '#2d4a26', grass: '#3f5a26' }[t.court] || '#2d4a26';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: courtBg }}>
      <AppStyles />

      {/* Both courts stay in the DOM — CSS media query shows the right one */}
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
              enabled: voiceOn,
              listening: voice.listening,
              supported: voice.supported,
              onToggle: toggleVoice,
            }}
          />
          <SoundButtons />
          <VoiceToast heard={voice.lastHeard} />
          <WinnerOverlay
            state={state}
            onNewMatch={handleNewMatch}
            onRematch={handleRematch}
          />
        </>
      )}

      <TweaksPanel>
        <TweakSection label="Bane" />
        <TweakRadio
          label="Underlag"
          value={t.court}
          options={['hard', 'clay', 'grass']}
          onChange={(v) => setTweak('court', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('stage')).render(<AppFull />);
