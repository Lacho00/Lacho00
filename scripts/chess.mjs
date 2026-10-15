// Draws an animated replay of Morphy's Opera Game (Paris, 1858) as a
// self-contained SVG: board, pieces as monospace tokens, move list and result.
// Only CSS animations, so it plays inside GitHub's <img> rendering.

const GAME = {
  title: 'THE OPERA GAME',
  subtitle: 'Paul Morphy vs. Duke Karl &amp; Count Isouard · Paris, 1858',
  result: 'Checkmate · 1–0',
  // [from, to, san]. Castling lists the king move and carries the rook move.
  moves: [
    ['e2', 'e4', 'e4'], ['e7', 'e5', 'e5'],
    ['g1', 'f3', 'Nf3'], ['d7', 'd6', 'd6'],
    ['d2', 'd4', 'd4'], ['c8', 'g4', 'Bg4'],
    ['d4', 'e5', 'dxe5'], ['g4', 'f3', 'Bxf3'],
    ['d1', 'f3', 'Qxf3'], ['d6', 'e5', 'dxe5'],
    ['f1', 'c4', 'Bc4'], ['g8', 'f6', 'Nf6'],
    ['f3', 'b3', 'Qb3'], ['d8', 'e7', 'Qe7'],
    ['b1', 'c3', 'Nc3'], ['c7', 'c6', 'c6'],
    ['c1', 'g5', 'Bg5'], ['b7', 'b5', 'b5'],
    ['c3', 'b5', 'Nxb5'], ['c6', 'b5', 'cxb5'],
    ['c4', 'b5', 'Bxb5+'], ['b8', 'd7', 'Nbd7'],
    ['e1', 'c1', 'O-O-O', ['a1', 'd1']], ['a8', 'd8', 'Rd8'],
    ['d1', 'd7', 'Rxd7'], ['d8', 'd7', 'Rxd7'],
    ['h1', 'd1', 'Rd1'], ['e7', 'e6', 'Qe6'],
    ['b5', 'd7', 'Bxd7+'], ['f6', 'd7', 'Nxd7'],
    ['b3', 'b8', 'Qb8+'], ['d7', 'b8', 'Nxb8'],
    ['d1', 'd8', 'Rd8#'],
  ],
};

const C = {
  bg: '#0a0a0f', panel: '#101018', border: '#7b93f5', light: '#1c1c27', dark: '#13131b',
  accent: '#3858e9', accentSoft: '#7b93f5', text: '#e6edf3', muted: '#8b949e', faint: '#3a3a48',
};

const S = 34; // square size
const BX = 40;
const BY = 78;
const W = 860;
const H = BY + 8 * S + 44;
const STEP = 1.4; // seconds per move
const MOVE = 0.35; // seconds a piece takes to slide
const LEAD = 1.5; // still board before the first move
const TAIL = 5; // mate on screen before the loop restarts
const T = LEAD + GAME.moves.length * STEP + TAIL;

const pct = (t) => `${((t / T) * 100).toFixed(3)}%`;
const sq = (s) => ({ f: s.charCodeAt(0) - 97, r: Number(s[1]) });
const xy = (s) => {
  const { f, r } = sq(s);
  return { x: BX + f * S, y: BY + (8 - r) * S };
};

function initialPieces() {
  const back = 'RNBQKBNR';
  const pieces = [];
  for (let f = 0; f < 8; f++) {
    const file = String.fromCharCode(97 + f);
    pieces.push({ side: 'w', type: back[f], at: `${file}1` });
    pieces.push({ side: 'w', type: 'P', at: `${file}2` });
    pieces.push({ side: 'b', type: 'P', at: `${file}7` });
    pieces.push({ side: 'b', type: back[f], at: `${file}8` });
  }
  return pieces.map((p, i) => ({ ...p, id: i, path: [{ t: 0, at: p.at }], capturedAt: null }));
}

// Plays the moves and records, per piece, when it moved and when it was taken.
function simulate() {
  const pieces = initialPieces();
  const on = (s) => pieces.find((p) => p.at === s && p.capturedAt === null);
  GAME.moves.forEach(([from, to, , extra], i) => {
    const t = LEAD + i * STEP;
    const victim = on(to);
    if (victim) victim.capturedAt = t + MOVE;
    for (const [a, b] of [[from, to], ...(extra ? [extra] : [])]) {
      const p = on(a);
      p.at = b;
      p.path.push({ t, at: b });
    }
  });
  return pieces;
}

function pieceKeyframes(p) {
  const tr = (s) => {
    const { x, y } = xy(s);
    return `transform: translate(${x}px, ${y}px)`;
  };
  const frames = [`0% { ${tr(p.path[0].at)} }`];
  for (let i = 1; i < p.path.length; i++) {
    const { t, at } = p.path[i];
    frames.push(`${pct(t)} { ${tr(p.path[i - 1].at)} }`);
    frames.push(`${pct(t + MOVE)} { ${tr(at)} }`);
  }
  frames.push(`100% { ${tr(p.path.at(-1).at)} }`);
  let css = `@keyframes pc${p.id} { ${frames.join(' ')} }`;
  if (p.capturedAt !== null) {
    css += ` @keyframes px${p.id} { 0% { opacity: 1 } ${pct(p.capturedAt - 0.05)} { opacity: 1 } ${pct(p.capturedAt)} { opacity: 0 } 100% { opacity: 0 } }`;
  }
  return css;
}

function pieceSvg(p) {
  const white = p.side === 'w';
  const fill = white ? C.text : C.bg;
  const stroke = white ? 'none' : C.accentSoft;
  const ink = white ? C.bg : '#c9d2fb';
  const anim = [`pc${p.id} ${T}s linear infinite`];
  if (p.capturedAt !== null) anim.push(`px${p.id} ${T}s linear infinite`);
  return `<g style="animation: ${anim.join(', ')}"><circle cx="${S / 2}" cy="${S / 2}" r="12" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><text x="${S / 2}" y="${S / 2 + 4.5}" text-anchor="middle" class="tok" fill="${ink}">${p.type}</text></g>`;
}

// Two squares mark the last move; they jump at each ply.
function lastMoveMarks() {
  const hold = (key) => {
    const frames = ['0% { opacity: 0 }'];
    GAME.moves.forEach((m, i) => {
      const t = LEAD + i * STEP;
      const { x, y } = xy(key === 'from' ? m[0] : m[1]);
      frames.push(`${pct(t)} { opacity: 1; transform: translate(${x}px, ${y}px) }`);
      const next = GAME.moves[i + 1];
      if (next) frames.push(`${pct(t + STEP - 0.01)} { opacity: 1; transform: translate(${x}px, ${y}px) }`);
    });
    frames.push(`100% { opacity: 1 }`);
    return `@keyframes mark-${key} { ${frames.join(' ')} }`;
  };
  return {
    css: hold('from') + ' ' + hold('to'),
    svg: ['from', 'to']
      .map((k) => `<rect width="${S}" height="${S}" fill="${C.accent}" fill-opacity="${k === 'to' ? 0.42 : 0.24}" style="animation: mark-${k} ${T}s steps(1, end) infinite"/>`)
      .join(''),
  };
}

function moveList() {
  const rows = Math.ceil(GAME.moves.length / 2);
  const perCol = Math.ceil(rows / 2);
  const x0 = BX + 8 * S + 48;
  const colW = 210;
  const rowH = 24;
  let css = '';
  let svg = '';
  for (let n = 0; n < rows; n++) {
    const col = Math.floor(n / perCol);
    const x = x0 + col * colW;
    const y = BY + 18 + (n % perCol) * rowH;
    svg += `<text x="${x}" y="${y}" class="mono num">${n + 1}.</text>`;
    for (const side of [0, 1]) {
      const i = n * 2 + side;
      const m = GAME.moves[i];
      if (!m) continue;
      const t = LEAD + i * STEP;
      const end = t + STEP;
      css += `@keyframes mv${i} { 0% { fill: ${C.faint} } ${pct(t - 0.01)} { fill: ${C.faint} } ${pct(t)} { fill: ${C.accentSoft} } ${pct(Math.min(end, T - 0.02))} { fill: ${i === GAME.moves.length - 1 ? C.accentSoft : C.text} } 100% { fill: ${i === GAME.moves.length - 1 ? C.accentSoft : C.text} } } `;
      svg += `<text x="${x + 34 + side * 76}" y="${y}" class="mono mv" style="animation: mv${i} ${T}s steps(1, end) infinite">${m[2]}</text>`;
    }
  }
  const tEnd = LEAD + GAME.moves.length * STEP;
  css += `@keyframes result { 0% { opacity: 0 } ${pct(tEnd - 0.01)} { opacity: 0 } ${pct(tEnd + 0.4)} { opacity: 1 } 100% { opacity: 1 } }`;
  svg += `<text x="${x0}" y="${BY + 8 * S - 6}" class="result" style="animation: result ${T}s linear infinite">${GAME.result}</text>`;
  return { css, svg };
}

export function buildChess() {
  const pieces = simulate();
  const marks = lastMoveMarks();
  const list = moveList();
  let board = '';
  for (let f = 0; f < 8; f++) {
    for (let r = 1; r <= 8; r++) {
      const { x, y } = xy(`${String.fromCharCode(97 + f)}${r}`);
      board += `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${(f + r) % 2 ? C.light : C.dark}"/>`;
    }
    board += `<text x="${BX + f * S + S / 2}" y="${BY + 8 * S + 16}" text-anchor="middle" class="coord">${String.fromCharCode(97 + f)}</text>`;
    board += `<text x="${BX - 12}" y="${BY + f * S + S / 2 + 4}" text-anchor="middle" class="coord">${8 - f}</text>`;
  }
  const fade = `@keyframes fade { 0% { opacity: 0 } ${pct(0.6)} { opacity: 1 } ${pct(T - 0.6)} { opacity: 1 } 100% { opacity: 0 } }`;
  const css = [
    `.tok { font: 700 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace }`,
    `.mono { font: 600 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace }`,
    `.num { fill: ${C.muted} }`,
    `.coord { font: 600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: ${C.muted} }`,
    `.label { font: 700 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; letter-spacing: 3px; fill: ${C.muted} }`,
    `.sub { font: 500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: ${C.text} }`,
    `.result { font: 700 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: ${C.accentSoft} }`,
    `.play { animation: fade ${T}s linear infinite }`,
    fade,
    marks.css,
    list.css,
    ...pieces.map(pieceKeyframes),
    `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }`,
  ].join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Animated replay of Morphy's Opera Game, Paris 1858, ending in checkmate">
<style>
${css}
</style>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="${C.bg}" stroke="${C.border}" stroke-opacity="0.62"/>
<text x="${BX - 16}" y="36" class="label">${GAME.title}</text>
<text x="${BX - 16}" y="58" class="sub">${GAME.subtitle}</text>
${board}
<g class="play">${marks.svg}${pieces.map(pieceSvg).join('')}</g>
${list.svg}
</svg>
`;
}
