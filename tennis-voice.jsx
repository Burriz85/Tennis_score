// tennis-voice.jsx — Web Speech API for "Spiller 1/2 poeng" voice commands

// Parses Norwegian voice command, returns:
//   { player: 0|1, kind: 'point' }   on a match
//   null                              on no match
// Accepts variations: "spiller 1 poeng", "spiller en poeng", "punkt 1",
// "poeng 1", "1 poeng", "spiller en", "én poeng", "to poeng", "spiller to", etc.
function parseVoiceCommand(text) {
  if (!text) return null;
  let s = text.toLowerCase().trim();
  // normalize digits and Norwegian number words
  s = s.replace(/\béin\b/g, 'en').replace(/\bén\b/g, 'en').replace(/\bett\b/g, 'en');
  s = s.replace(/\btwo\b/g, 'to').replace(/\bone\b/g, 'en');

  // detect player number
  let player = null;
  if (/\b(1|en|først[ae])\b/.test(s)) player = 0;
  if (/\b(2|to|andre)\b/.test(s)) player = (player === 0) ? null : 1;
  if (player == null) return null;

  // detect intent — "poeng", "punkt", "point"
  const hasIntent = /(poeng|punkt|point|score)/.test(s) || /\bspiller\b/.test(s);
  if (!hasIntent) return null;

  return { player, kind: 'point' };
}

// ──────────────────────────────────────────────────────────────
// useVoice — manages SpeechRecognition lifecycle
// ──────────────────────────────────────────────────────────────
function useVoice({ enabled, onCommand }) {
  const [listening, setListening] = React.useState(false);
  const [lastHeard, setLastHeard] = React.useState(null); // {text, ts, recognized}
  const [supported, setSupported] = React.useState(true);
  const [error, setError] = React.useState(null);

  // keep refs stable across renders so cleanup works
  const recRef = React.useRef(null);
  const onCmdRef = React.useRef(onCommand);
  const enabledRef = React.useRef(enabled);
  const restartTimerRef = React.useRef(null);
  const lastFiredRef = React.useRef({ key: null, ts: 0 });

  React.useEffect(() => { onCmdRef.current = onCommand; }, [onCommand]);
  React.useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  React.useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);

    if (!enabled) {
      // stop any active session
      if (recRef.current) {
        try { recRef.current.stop(); } catch (e) {}
        recRef.current = null;
      }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      setListening(false);
      setError(null);
      return;
    }

    function start() {
      if (!enabledRef.current) return;
      const rec = new SR();
      rec.lang = 'nb-NO';     // Norwegian Bokmål
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;

      rec.onstart = () => setListening(true);
      rec.onerror = (e) => {
        const err = e.error || 'unknown';
        setError(err);
        setLastHeard({
          text: err === 'not-allowed' ? 'Mikrofon ikke tillatt'
              : err === 'service-not-allowed' ? 'Mikrofon-tjeneste blokkert'
              : err === 'no-speech' ? 'Hørte ingenting'
              : err === 'audio-capture' ? 'Ingen mikrofon funnet'
              : err === 'network' ? 'Nettverksfeil'
              : 'Feil: ' + err,
          ts: Date.now(),
          recognized: false,
          error: true,
        });
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          // permission denied — stop entirely
          enabledRef.current = false;
        }
      };
      rec.onend = () => {
        setListening(false);
        recRef.current = null;
        // auto-restart while enabled — handles Chrome's ~minute timeout
        if (enabledRef.current) {
          restartTimerRef.current = setTimeout(start, 250);
        }
      };
      rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          // check all alternatives
          let parsed = null;
          let bestText = '';
          for (let j = 0; j < result.length; j++) {
            const t = result[j].transcript;
            const p = parseVoiceCommand(t);
            if (!bestText) bestText = t;
            if (p) { parsed = p; bestText = t; break; }
          }
          if (result.isFinal) {
            setLastHeard({ text: bestText, ts: Date.now(), recognized: !!parsed });
            if (parsed) {
              // debounce duplicate fires (Chrome sometimes repeats)
              const key = `${parsed.player}-${parsed.kind}`;
              const now = Date.now();
              if (lastFiredRef.current.key === key && now - lastFiredRef.current.ts < 1500) {
                return;
              }
              lastFiredRef.current = { key, ts: now };
              onCmdRef.current && onCmdRef.current(parsed);
            }
          } else {
            // interim — just show what's being heard
            setLastHeard({ text: bestText, ts: Date.now(), recognized: !!parsed, interim: true });
          }
        }
      };

      try {
        recRef.current = rec;
        rec.start();
      } catch (e) {
        setError(String(e));
      }
    }

    start();

    return () => {
      enabledRef.current = false;
      if (recRef.current) {
        try { recRef.current.stop(); } catch (e) {}
        recRef.current = null;
      }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
    };
  }, [enabled]);

  return { listening, lastHeard, supported, error };
}

// ──────────────────────────────────────────────────────────────
// VoiceToast — small floating pill that shows last heard phrase
// ──────────────────────────────────────────────────────────────
function VoiceToast({ heard }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!heard || !heard.text) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), heard.recognized ? 1800 : 1400);
    return () => clearTimeout(t);
  }, [heard?.text, heard?.ts]);

  if (!heard || !visible) return null;
  const bg = heard.error
    ? 'rgba(232,74,74,0.92)'
    : heard.recognized
      ? 'rgba(216,255,94,0.92)'
      : (heard.interim ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.18)');
  const fg = heard.error
    ? '#fff'
    : heard.recognized ? '#13260b' : '#fff';
  return (
    <div style={{
      position: 'absolute',
      left: '50%', bottom: 'calc(50% + 60px)',
      transform: 'translateX(-50%)',
      background: bg, color: fg,
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      padding: '6px 14px', borderRadius: 999,
      fontSize: 'clamp(11px, 1.8vh, 13px)',
      fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif',
      border: '1px solid rgba(255,255,255,0.25)',
      whiteSpace: 'nowrap',
      maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis',
      zIndex: 9,
      boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
      pointerEvents: 'none',
    }}>
      {heard.error ? '⚠ ' : heard.recognized ? '✓ ' : ''}
      "{heard.text.trim()}"
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// MicButton — toggle button with pulsing indicator when listening
// ──────────────────────────────────────────────────────────────
function MicButton({ enabled, listening, supported, onToggle }) {
  const disabled = !supported;
  const active = enabled && supported;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={!supported
        ? 'Stemmegjenkjenning støttes ikke her'
        : enabled ? 'Slå av stemmestyring' : 'Slå på stemmestyring'}
      style={{
        width: 'clamp(34px, 5.5vh, 42px)', height: 'clamp(34px, 5.5vh, 42px)',
        borderRadius: '50%',
        background: active ? '#e84a4a' : 'rgba(0,0,0,0.6)',
        border: active
          ? '1px solid rgba(255,255,255,0.55)'
          : '1px solid rgba(255,255,255,0.22)',
        color: '#fff', fontSize: 'clamp(13px, 2vh, 16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        padding: 0, position: 'relative',
        opacity: disabled ? 0.55 : 1,
        boxShadow: active && listening
          ? '0 0 0 0 rgba(232,74,74,0.6), 0 0 12px rgba(232,74,74,0.5)'
          : 'none',
        animation: active && listening ? 'micPulse 1.4s ease-in-out infinite' : 'none',
      }}>
      <svg width="50%" height="50%" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z"/>
        {!active && (
          <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        )}
      </svg>
      <style>{`
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,74,74,0.6), 0 0 12px rgba(232,74,74,0.5); }
          50%      { box-shadow: 0 0 0 8px rgba(232,74,74,0), 0 0 12px rgba(232,74,74,0.5); }
        }
      `}</style>
    </button>
  );
}

Object.assign(window, {
  useVoice, VoiceToast, MicButton, parseVoiceCommand,
});
