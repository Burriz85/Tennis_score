// tennis-app-fullscreen.jsx — portrait, no phone frame, fullscreen

function AppFull() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  const [screen, setScreen] = React.useState('setup');
  const [lastSetup, setLastSetup] = React.useState({
    names: ['Spiller 1', 'Spiller 2'], bestOf: 5, server: 0,
  });
  const [history, setHistory] = React.useState([]);
  const [state, setState] = React.useState(makeInitialMatch(['Spiller 1', 'Spiller 2'], 5, 0));

  // Keep screen awake during match
  useWakeLock(screen === 'match' && state.matchWinner == null);

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

    // Detect transitions for sound effects
    const gameWon = nextState.games[0] + nextState.games[1] >
                    prevState.games[0] + prevState.games[1];
    const setWon  = nextState.completedSets.length > prevState.completedSets.length;
    const matchWon = nextState.matchWinner != null && prevState.matchWinner == null;
    // Match sound is fired inside WinnerOverlay; play game/set here.
    if (matchWon) return;
    if (setWon) playSetSound();
    else if (gameWon) playGameSound();
  }
  function handleUndo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setState(prev);
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000' }}>
      <CourtBackground palette={t.court} />
      {screen === 'setup' && (
        <SetupScreen initial={lastSetup} onStart={startMatch} />
      )}
      {screen === 'match' && (
        <>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
            <MatchSide state={state} p={0} onPoint={handlePoint} />
            <MatchSide state={state} p={1} onPoint={handlePoint} />
          </div>
          <CenterControls
            state={state}
            onUndo={handleUndo}
            onReset={handleReset}
            canUndo={history.length > 0}
          />
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
