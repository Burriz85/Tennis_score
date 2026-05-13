// tennis-app.jsx — root component, screen routing, state + history

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  // 'setup' | 'match'
  const [screen, setScreen] = React.useState('setup');
  const [lastSetup, setLastSetup] = React.useState({
    names: ['Spiller 1', 'Spiller 2'], bestOf: 5, server: 0,
  });
  const [history, setHistory] = React.useState([]); // stack of prior states
  const [state, setState] = React.useState(makeInitialMatch(['Spiller 1', 'Spiller 2'], 5, 0));

  // Responsive scaling — fit a 920x430 design into available viewport.
  const DESIGN_W = 920, DESIGN_H = 430;
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    function onResize() {
      const pad = 48;
      const sx = (window.innerWidth - pad) / DESIGN_W;
      const sy = (window.innerHeight - pad) / DESIGN_H;
      setScale(Math.min(1.4, Math.max(0.4, Math.min(sx, sy))));
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function startMatch(cfg) {
    setLastSetup(cfg);
    setState(makeInitialMatch(cfg.names, cfg.bestOf, cfg.server));
    setHistory([]);
    setScreen('match');
  }

  function handlePoint(p) {
    if (state.matchWinner != null) return;
    setHistory((h) => [...h, state]);
    setState((s) => awardPoint(s, p));
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

  function handleNewMatch() {
    setScreen('setup');
  }

  function handleRematch() {
    setState(makeInitialMatch(lastSetup.names, lastSetup.bestOf, lastSetup.server));
    setHistory([]);
  }

  return (
    <div style={{
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      transition: 'transform 0.15s ease',
    }}>
      <LandscapeAndroid width={920} height={430} showFrame={t.showFrame}>
        <CourtBackground palette={t.court} />
        {screen === 'setup' && (
          <SetupScreen initial={lastSetup} onStart={startMatch} />
        )}
        {screen === 'match' && (
          <>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'row' }}>
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
      </LandscapeAndroid>

      <TweaksPanel>
        <TweakSection label="Bane" />
        <TweakRadio
          label="Underlag"
          value={t.court}
          options={['hard', 'clay', 'grass']}
          onChange={(v) => setTweak('court', v)}
        />
        <TweakSection label="Visning" />
        <TweakToggle
          label="Vis telefonramme"
          value={t.showFrame}
          onChange={(v) => setTweak('showFrame', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('stage')).render(<App />);
