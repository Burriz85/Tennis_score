// tennis-app.jsx — portrait + landscape adaptive app

// Detects orientation using matchMedia — fires after viewport has settled
function useOrientation() {
  const [isLandscape, setIsLandscape] = React.useState(
    () => window.matchMedia('(orientation: landscape)').matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)');
    const handler = (e) => setIsLandscape(e.matches);
    // Modern API
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    // Fallback for older Android WebView
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);
  return isLandscape;
}

function AppFull() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const isLandscape = useOrientation();

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

  // Landscape: players side by side (row), portrait: top/bottom (column)
  const matchLayout = isLandscape
    ? { flexDirection: 'row' }
    : { flexDirection: 'column' };

  // Background matches court surround so rotation never shows a black flash
  const courtBg = { hard: '#2f6b2f', clay: '#2d4a26', grass: '#3f5a26' }[t.court] || '#2d4a26';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: courtBg }}>
      <Court palette={t.court} landscape={isLandscape} />

      {screen === 'setup' && (
        <SetupScreen initial={lastSetup} onStart={startMatch} isLandscape={isLandscape} />
      )}
      {screen === 'match' && (
        <>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', ...matchLayout }}>
            <MatchSide state={state} p={0} onPoint={handlePoint} isLandscape={isLandscape} />
            <MatchSide state={state} p={1} onPoint={handlePoint} isLandscape={isLandscape} />
          </div>
          <CenterControls
            state={state}
            onUndo={handleUndo}
            onReset={handleReset}
            canUndo={history.length > 0}
            isLandscape={isLandscape}
            voiceProps={{
              enabled: voiceOn,
              listening: voice.listening,
              supported: voice.supported,
              onToggle: toggleVoice,
            }}
          />
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
