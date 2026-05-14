// tennis-engine.jsx — pure tennis scoring engine + helpers

// State shape:
// {
//   names: [string, string],
//   bestOf: 3 | 5,        // sets to play
//   setsToWin: 2 | 3,     // derived: ceil(bestOf/2)
//   points: [number, number],   // current game points (raw; 0..)
//   games: [number, number],    // current set games
//   completedSets: [ [g1,g2], ... ],   // completed sets
//   setsWon: [number, number],
//   server: 0 | 1,
//   inTiebreak: boolean,
//   tiebreakServer: 0 | 1,   // who started serving this tiebreak (used for next set first server)
//   pointsInTiebreak: number, // total tiebreak points played, for serve rotation
//   matchWinner: null | 0 | 1,
// }

function makeInitialMatch(names, bestOf, server = 0) {
  return {
    names: [...names],
    bestOf,
    setsToWin: Math.ceil(bestOf / 2),
    points: [0, 0],
    games: [0, 0],
    completedSets: [],
    setsWon: [0, 0],
    server,
    inTiebreak: false,
    tiebreakServer: 0,
    pointsInTiebreak: 0,
    matchWinner: null,
  };
}

// Format current game points for display.
function formatPoints(state) {
  if (state.matchWinner != null) return ['—', '—'];
  if (state.inTiebreak) {
    return [String(state.points[0]), String(state.points[1])];
  }
  const [a, b] = state.points;
  const label = (n) => ['0', '15', '30', '40'][n] ?? '40';
  // Deuce / advantage when both >= 3
  if (a >= 3 && b >= 3) {
    if (a === b) return ['40', '40'];
    if (a === b + 1) return ['Ad', '40'];
    if (b === a + 1) return ['40', 'Ad'];
    // shouldn't reach here — game would already be won
  }
  return [label(a), label(b)];
}

function statusLine(state) {
  if (state.matchWinner != null) {
    return `${state.names[state.matchWinner]} vant kampen`;
  }
  const setNum = state.completedSets.length + 1;
  const total = state.bestOf;
  if (state.inTiebreak) return `Sett ${setNum} · Tiebreak`;
  // deuce / advantage label
  const [a, b] = state.points;
  if (a >= 3 && b >= 3) {
    if (a === b) return `Sett ${setNum} · Deuce`;
    if (Math.abs(a - b) === 1) {
      const ad = a > b ? 0 : 1;
      return `Sett ${setNum} · Fordel ${state.names[ad]}`;
    }
  }
  return `Sett ${setNum} av ${total}`;
}

// Award a point to player p; return new state (immutable).
function awardPoint(state, p) {
  if (state.matchWinner != null) return state;
  const s = JSON.parse(JSON.stringify(state));
  const o = 1 - p;

  if (s.inTiebreak) {
    s.points[p] += 1;
    s.pointsInTiebreak += 1;
    // tiebreak serve rotation: first point by tiebreakServer,
    // then every 2 points the server flips.
    // After every odd-numbered total point, swap.
    if (s.pointsInTiebreak % 2 === 1) {
      s.server = 1 - s.server;
    }
    // tiebreak win: first to 7, win by 2
    if (s.points[p] >= 7 && s.points[p] - s.points[o] >= 2) {
      // win set 7-6
      s.games[p] += 1; // makes it 7-6
      s.completedSets.push([s.games[0], s.games[1]]);
      s.setsWon[p] += 1;
      // reset for next set
      s.points = [0, 0];
      s.games = [0, 0];
      s.inTiebreak = false;
      s.pointsInTiebreak = 0;
      // next set: the player who DID NOT serve first in this tiebreak serves first
      s.server = 1 - s.tiebreakServer;
      // check match
      if (s.setsWon[p] >= s.setsToWin) {
        s.matchWinner = p;
      }
    }
    return s;
  }

  // Regular game scoring
  s.points[p] += 1;
  // game won if points >= 4 AND lead by 2
  if (s.points[p] >= 4 && s.points[p] - s.points[o] >= 2) {
    s.games[p] += 1;
    s.points = [0, 0];
    // switch server
    s.server = 1 - s.server;

    // set complete?
    if (s.games[p] >= 6 && s.games[p] - s.games[o] >= 2) {
      s.completedSets.push([s.games[0], s.games[1]]);
      s.setsWon[p] += 1;
      s.games = [0, 0];
      if (s.setsWon[p] >= s.setsToWin) {
        s.matchWinner = p;
      }
    } else if (s.games[0] === 6 && s.games[1] === 6) {
      // enter tiebreak
      s.inTiebreak = true;
      s.tiebreakServer = s.server; // current server starts tiebreak
      s.pointsInTiebreak = 0;
    }
  }
  return s;
}

Object.assign(window, {
  makeInitialMatch, formatPoints, statusLine, awardPoint,
});
