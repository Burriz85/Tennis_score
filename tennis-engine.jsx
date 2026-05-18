// tennis-engine.jsx — pure scoring engine with configurable rules
//
// State shape:
// {
//   names: [string, string],
//   rules: {
//     bestOf: 1 | 3 | 5,
//     gamesPerSet: 4 | 6 | 8,   // games needed to win a set (with 2-game lead)
//     noAd: boolean,            // sudden death at deuce
//     finalSetTb: boolean,      // play a tiebreak in the deciding set (or play to 2-game lead)
//     superTb: boolean,         // deciding "set" is replaced by a first-to-10 tiebreak
//   },
//   setsToWin: number,                  // derived: ceil(bestOf/2)
//   points: [number, number],           // current game points (raw counts)
//   games:  [number, number],           // current set games
//   completedSets: [[a,b], ...],
//   setsWon: [number, number],
//   server: 0 | 1,
//   serveFault: boolean,                  // 1st serve has been a fault → on 2nd serve
//   startedAt: number,                    // ms timestamp
//   endedAt: number | null,
//   totalGames: number,                   // games played across whole match (for changeover)
//   changeover: boolean,                  // true ← most recent point triggered a side change
//   inTiebreak: boolean,
//   tiebreakTarget: 7 | 10,             // first to N (with lead by 2)
//   tiebreakServer: 0 | 1,              // who started the current tiebreak
//   pointsInTiebreak: number,
//   matchWinner: null | 0 | 1,
// }

const DEFAULT_RULES = {
  bestOf: 3,
  gamesPerSet: 6,
  noAd: false,
  finalSetTb: true,
  superTb: false,
};

// Built-in presets — exported so the setup screen can use them
const MATCH_PRESETS = [
  {
    id: 'std3', label: 'Standard',
    sub: 'Best av 3 · 6 games · Tiebreak ved 6–6',
    rules: { bestOf: 3, gamesPerSet: 6, noAd: false, finalSetTb: true,  superTb: false },
  },
  {
    id: 'std5', label: 'Best av 5',
    sub: 'Slam-format. Tiebreak i alle sett.',
    rules: { bestOf: 5, gamesPerSet: 6, noAd: false, finalSetTb: true,  superTb: false },
  },
  {
    id: 'shootout', label: 'Match-tiebreak',
    sub: '2 sett, så super-tiebreak til 10. ITF-doubles.',
    rules: { bestOf: 3, gamesPerSet: 6, noAd: false, finalSetTb: true,  superTb: true  },
  },
  {
    id: 'pro', label: 'Pro Set',
    sub: 'Ett langt sett til 8 games · No-ad.',
    rules: { bestOf: 1, gamesPerSet: 8, noAd: true,  finalSetTb: true,  superTb: false },
  },
  {
    id: 'fast4', label: 'Fast 4',
    sub: 'Best av 3. Sett til 4 · No-ad · Tiebreak ved 3–3.',
    rules: { bestOf: 3, gamesPerSet: 4, noAd: true,  finalSetTb: true,  superTb: false },
  },
];

// Players can be either:
//   - an array of two strings: ['A', 'B']             (singles)
//   - an array of two arrays:  [['A','B'],['C','D']]  (doubles)
// makeInitialMatch normalises this into a `players` array and derives `names`
// (display labels per side) so the rest of the app can stay agnostic.
function makeInitialMatch(playersIn, rulesOrBestOf, server = 0) {
  // Back-compat: if a number is passed, treat it as bestOf
  const rules = typeof rulesOrBestOf === 'number'
    ? { ...DEFAULT_RULES, bestOf: rulesOrBestOf }
    : { ...DEFAULT_RULES, ...(rulesOrBestOf || {}) };

  const normTeam = (t) => Array.isArray(t) ? t.filter(Boolean) : [t];
  const teams = [normTeam(playersIn[0]), normTeam(playersIn[1])];
  const mode = (teams[0].length > 1 || teams[1].length > 1) ? 'doubles' : 'singles';
  const names = teams.map(t => t.join(' / '));

  return {
    mode,
    players: teams,         // [[a (,b)], [c (,d)]]
    names,                  // display labels per side
    rules,
    bestOf: rules.bestOf,   // legacy mirror
    setsToWin: Math.ceil(rules.bestOf / 2),
    points: [0, 0],
    games: [0, 0],
    completedSets: [],
    setsWon: [0, 0],
    server,
    serverPlayer: [0, 0],   // which player WITHIN each team currently serves
    serveFault: false,
    inTiebreak: false,
    tiebreakTarget: 7,
    tiebreakServer: 0,
    pointsInTiebreak: 0,
    matchWinner: null,
    startedAt: Date.now(),
    endedAt: null,
    totalGames: 0,
    totalPoints: 0,
    changeover: false,
  };
}

// Is the upcoming/current set the deciding one?
function isFinalSet(s) {
  return s.setsWon[0] === s.setsToWin - 1 && s.setsWon[1] === s.setsToWin - 1;
}

function formatPoints(state) {
  if (state.matchWinner != null) return ['—', '—'];
  if (state.inTiebreak) {
    return [String(state.points[0]), String(state.points[1])];
  }
  const [a, b] = state.points;
  const label = (n) => ['0', '15', '30', '40'][n] ?? '40';
  if (state.rules.noAd) {
    // No-ad: at 40-40 the next point wins. Show "40" both sides.
    return [label(Math.min(a, 3)), label(Math.min(b, 3))];
  }
  if (a >= 3 && b >= 3) {
    if (a === b) return ['40', '40'];
    if (a === b + 1) return ['Ad', '40'];
    if (b === a + 1) return ['40', 'Ad'];
  }
  return [label(a), label(b)];
}

function statusLine(state) {
  if (state.matchWinner != null) return `${state.names[state.matchWinner]} vant kampen`;
  const setNum = state.completedSets.length + 1;
  if (state.inTiebreak) {
    return state.tiebreakTarget === 10
      ? `Match-tiebreak`
      : `Sett ${setNum} · Tiebreak`;
  }
  const [a, b] = state.points;
  if (!state.rules.noAd && a >= 3 && b >= 3) {
    if (a === b) return `Sett ${setNum} · Deuce`;
    if (Math.abs(a - b) === 1) {
      const ad = a > b ? 0 : 1;
      return `Sett ${setNum} · Fordel ${state.names[ad]}`;
    }
  }
  if (state.rules.noAd && a === 3 && b === 3) {
    return `Sett ${setNum} · Avgjørende poeng`;
  }
  return `Sett ${setNum} av ${state.rules.bestOf}`;
}

function awardPoint(state, p) {
  if (state.matchWinner != null) return state;
  const s = JSON.parse(JSON.stringify(state));
  // legacy fields might be missing on old persisted states
  if (!s.rules) s.rules = { ...DEFAULT_RULES, bestOf: s.bestOf || 3 };
  if (s.tiebreakTarget == null) s.tiebreakTarget = 7;
  if (!s.mode) s.mode = 'singles';
  if (!s.serverPlayer) s.serverPlayer = [0, 0];
  if (!s.players) s.players = [[s.names[0]], [s.names[1]]];
  if (s.serveFault == null) s.serveFault = false;
  if (s.totalGames == null) s.totalGames = s.completedSets.reduce((n, x) => n + x[0] + x[1], 0) + s.games[0] + s.games[1];
  if (s.totalPoints == null) s.totalPoints = 0;
  s.changeover = false;
  s.serveFault = false;   // any awarded point clears the serve-fault flag
  s.totalPoints += 1;
  const o = 1 - p;
  const { rules } = s;

  const rotateServerAway = () => {
    // In doubles, rotate the OUTGOING team's internal server so next time
    // it's their other player. Then flip the team server.
    if (s.mode === 'doubles') {
      s.serverPlayer[s.server] = 1 - s.serverPlayer[s.server];
    }
    s.server = 1 - s.server;
  };

  // ── TIEBREAK ─────────────────────────────────────────────
  if (s.inTiebreak) {
    s.points[p] += 1;
    s.pointsInTiebreak += 1;
    if (s.pointsInTiebreak % 2 === 1) rotateServerAway();
    // changeover every 6 tiebreak points
    if (s.pointsInTiebreak > 0 && s.pointsInTiebreak % 6 === 0) s.changeover = true;

    const target = s.tiebreakTarget;
    if (s.points[p] >= target && s.points[p] - s.points[o] >= 2) {
      if (target === 10) {
        // super-tiebreak: this IS the final "set"
        s.completedSets.push([
          s.setsWon[0] + (p === 0 ? 1 : 0),
          s.setsWon[1] + (p === 1 ? 1 : 0),
        ]);
        s.setsWon[p] += 1;
        s.matchWinner = p;
        s.endedAt = Date.now();
      } else {
        // regular tiebreak: wins the set 7-6
        s.games[p] += 1;
        s.completedSets.push([s.games[0], s.games[1]]);
        s.setsWon[p] += 1;
        // reset for next set
        s.points = [0, 0]; s.games = [0, 0];
        s.inTiebreak = false; s.pointsInTiebreak = 0;
        s.tiebreakTarget = 7;
        // next set: other player serves first
        s.server = 1 - s.tiebreakServer;
        if (s.setsWon[p] >= s.setsToWin) {
          s.matchWinner = p;
          s.endedAt = Date.now();
        } else if (isFinalSet(s) && rules.superTb) {
          // entering deciding "set" → super tiebreak instead
          s.inTiebreak = true;
          s.tiebreakTarget = 10;
          s.tiebreakServer = s.server;
          s.pointsInTiebreak = 0;
        }
      }
    }
    return s;
  }

  // ── REGULAR GAME ────────────────────────────────────────
  s.points[p] += 1;

  const winThreshold = rules.noAd ? 4 : 4; // need 4 pts to win
  const needLead = rules.noAd ? 1 : 2;     // no-ad allows winning at 4-3
  let gameWon = false;

  if (rules.noAd) {
    // No-ad: at 3-3 next point wins. Otherwise standard up to 4.
    if (s.points[p] === 4) gameWon = true;
  } else {
    if (s.points[p] >= winThreshold && s.points[p] - s.points[o] >= needLead) gameWon = true;
  }

  if (gameWon) {
    s.games[p] += 1;
    s.points = [0, 0];
    s.totalGames += 1;
    rotateServerAway();

    // Players change ends after every odd game in a set.
    // (Skip when the set itself just ended — the changeover happens on the
    // FIRST game of the next set instead, but most players just want a
    // visual cue at the end of any odd game total.)
    if (s.totalGames % 2 === 1) s.changeover = true;

    const gps = rules.gamesPerSet;
    const finalSet = isFinalSet(s);
    const skipTbThisSet = finalSet && !rules.finalSetTb && !rules.superTb;

    // Set complete?
    if (s.games[p] >= gps && s.games[p] - s.games[o] >= 2) {
      s.completedSets.push([s.games[0], s.games[1]]);
      s.setsWon[p] += 1;
      s.games = [0, 0];
      if (s.setsWon[p] >= s.setsToWin) {
        s.matchWinner = p;
        s.endedAt = Date.now();
      } else if (isFinalSet(s) && rules.superTb) {
        // entering deciding set → super-tiebreak
        s.inTiebreak = true;
        s.tiebreakTarget = 10;
        s.tiebreakServer = s.server;
        s.pointsInTiebreak = 0;
      }
    } else if (s.games[0] === gps && s.games[1] === gps && !skipTbThisSet) {
      // tiebreak time (regular)
      s.inTiebreak = true;
      s.tiebreakTarget = 7;
      s.tiebreakServer = s.server;
      s.pointsInTiebreak = 0;
    }
  }
  return s;
}

// Record a fault. First fault → serveFault=true. Second → award point to opponent.
function awardFault(state) {
  if (state.matchWinner != null) return state;
  if (state.serveFault) {
    // double fault → point to receiver
    return awardPoint(state, 1 - state.server);
  }
  const s = JSON.parse(JSON.stringify(state));
  s.serveFault = true;
  s.changeover = false;
  return s;
}

// Let → replay the serve (no point change, fault cleared).
function awardLet(state) {
  if (state.matchWinner != null) return state;
  const s = JSON.parse(JSON.stringify(state));
  s.serveFault = false;
  s.changeover = false;
  return s;
}

// Helpers for the post-match summary screen.
function matchDurationMs(state) {
  if (!state.startedAt) return 0;
  const end = state.endedAt || Date.now();
  return Math.max(0, end - state.startedAt);
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}t ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

Object.assign(window, {
  makeInitialMatch, formatPoints, statusLine, awardPoint,
  awardFault, awardLet,
  matchDurationMs, formatDuration,
  DEFAULT_RULES, MATCH_PRESETS, isFinalSet,
});
