// tennis-extras.jsx — wake lock, confetti, sound, coin toss

// ──────────────────────────────────────────────────────────────
// Wake Lock — keep screen on during match
// ──────────────────────────────────────────────────────────────
function useWakeLock(active) {
  React.useEffect(() => {
    if (!active) return;
    if (!('wakeLock' in navigator)) return;

    let lock = null;
    let cancelled = false;

    async function acquire() {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch (e) {
        // user navigated away or permission denied — silently ignore
      }
    }

    function onVisibility() {
      if (document.visibilityState === 'visible' && !cancelled) acquire();
    }

    acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (lock) lock.release().catch(() => {});
    };
  }, [active]);
}

// ──────────────────────────────────────────────────────────────
// Sound effects via Web Audio API — no asset files needed
// ──────────────────────────────────────────────────────────────
let _audioCtx = null;
function audioCtx() {
  if (_audioCtx) return _audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  _audioCtx = new Ctx();
  return _audioCtx;
}

function beep(freq, durationMs, { type = 'sine', volume = 0.18, start = 0 } = {}) {
  const ctx = audioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.02);
}

function playGameSound() {
  beep(660, 120, { type: 'triangle', volume: 0.15 });
  beep(880, 180, { type: 'triangle', volume: 0.15, start: 0.10 });
}
function playSetSound() {
  beep(523, 120, { type: 'triangle' });
  beep(659, 120, { type: 'triangle', start: 0.12 });
  beep(784, 220, { type: 'triangle', start: 0.24 });
}
function playMatchSound() {
  // simple fanfare
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => beep(f, 200, { type: 'triangle', volume: 0.20, start: i * 0.12 }));
  beep(1047, 500, { type: 'triangle', volume: 0.22, start: 0.55 });
}
function playCoinSound() {
  beep(1200, 60, { type: 'sine', volume: 0.10 });
  beep(900, 60, { type: 'sine', volume: 0.10, start: 0.06 });
  beep(1500, 80, { type: 'sine', volume: 0.12, start: 0.12 });
}

// ──────────────────────────────────────────────────────────────
// Confetti — canvas particle system overlay
// ──────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const colors = ['#d8ff5e', '#e3ff5b', '#ffffff', '#ffd700', '#1f5fa8', '#ff5e5e'];

    // spawn waves
    const particles = [];
    function spawn() {
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: W / 2 + (Math.random() - 0.5) * W * 0.4,
          y: H * 0.3,
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 10 - 5,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.3,
          size: 5 + Math.random() * 7,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          shape: Math.random() < 0.5 ? 'rect' : 'circle',
        });
      }
    }
    spawn();
    setTimeout(spawn, 300);
    setTimeout(spawn, 700);

    let raf;
    let frame = 0;
    function tick() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.vy += 0.25;       // gravity
        p.vx *= 0.99;        // air drag
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;
        p.life -= 0.005;
        if (p.life <= 0) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      // cleanup
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life <= 0 || particles[i].y > H + 50) particles.splice(i, 1);
      }
      if (particles.length > 0 && frame < 600) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [active]);

  if (!active) return null;
  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 7,
    }} />
  );
}

// ──────────────────────────────────────────────────────────────
// Coin toss — overlay that shows a spinning coin, then a result
// onDone(winner: 0|1) is called when reveal finishes
// ──────────────────────────────────────────────────────────────
function CoinToss({ names, onDone }) {
  const [phase, setPhase] = React.useState('spinning'); // 'spinning' | 'revealed'
  const [winner, setWinner] = React.useState(0);

  React.useEffect(() => {
    // pre-decide result
    const w = Math.random() < 0.5 ? 0 : 1;
    setWinner(w);
    playCoinSound();
    const t1 = setTimeout(() => {
      setPhase('revealed');
    }, 2400);
    return () => clearTimeout(t1);
  }, []);

  // After reveal — wait a moment then signal parent
  React.useEffect(() => {
    if (phase !== 'revealed') return;
    const t = setTimeout(() => onDone(winner), 1600);
    return () => clearTimeout(t);
  }, [phase]);

  // Coin design: two sides labeled "1" and "2"
  // spinning state uses CSS animation
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.78)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      zIndex: 8, gap: 22,
    }}>
      <div style={{
        fontSize: 'clamp(10px, 1.6vh, 12px)', letterSpacing: '0.22em',
        textTransform: 'uppercase', opacity: 0.7,
      }}>Myntkast</div>

      <div style={{
        perspective: 800, width: 'min(38vh, 60vw)', height: 'min(38vh, 60vw)',
        maxWidth: 220, maxHeight: 220,
      }}>
        <div style={{
          width: '100%', height: '100%',
          position: 'relative', transformStyle: 'preserve-3d',
          animation: phase === 'spinning'
            ? 'coinSpin 2.4s ease-out forwards'
            : 'none',
          transform: phase === 'revealed'
            ? (winner === 0 ? 'rotateY(0deg)' : 'rotateY(180deg)')
            : undefined,
          transition: phase === 'revealed' ? 'transform 0.4s ease' : undefined,
        }}>
          <CoinFace label="1" name={names[0]} />
          <CoinFace label="2" name={names[1]} back />
        </div>
      </div>

      <div style={{
        fontSize: 'clamp(14px, 2.4vh, 18px)', fontWeight: 600,
        opacity: phase === 'revealed' ? 1 : 0,
        transition: 'opacity 0.3s ease',
        height: 28,
      }}>
        {phase === 'revealed' && `${names[winner]} server`}
      </div>

      <style>{`
        @keyframes coinSpin {
          0%   { transform: rotateY(0deg)   scale(1); }
          50%  { transform: rotateY(900deg) scale(1.05); }
          100% { transform: rotateY(${winner === 0 ? 1800 : 1980}deg) scale(1); }
        }
      `}</style>
    </div>
  );
}

function CoinFace({ label, name, back }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, #ffe27a, #d4a316 70%, #8a6a0c)',
      border: '4px solid #f7d24a',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 -8px 16px rgba(0,0,0,0.2)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transform: back ? 'rotateY(180deg)' : 'none',
      color: '#5a3f00',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        fontSize: 'min(20vh, 32vw)', fontWeight: 800, lineHeight: 1,
        letterSpacing: '-0.04em',
        textShadow: '0 2px 0 rgba(255,255,255,0.4)',
      }}>{label}</div>
      <div style={{
        fontSize: 'clamp(10px, 1.6vh, 13px)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        marginTop: 4, maxWidth: '80%', textAlign: 'center',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{name}</div>
    </div>
  );
}

Object.assign(window, {
  useWakeLock, Confetti, CoinToss,
  playGameSound, playSetSound, playMatchSound, playCoinSound,
});
