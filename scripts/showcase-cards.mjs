// Animated cards that show the work rather than describe it: a terminal
// running the build plugin, the delivery pipeline, measured quality and a
// short piece of WooCommerce code. Same frame and palette as cards.mjs.
//
// Looping sequences open on their finished state, clear, then replay
// element by element. Anything that cannot animate (reduced motion, a static
// renderer) shows the finished card, never an empty one.
import { C, MONO, delay, esc, eyebrow, frame, panel, text, wrap } from './cards.mjs';

// Keyframes for one element of a looping sequence: shown at 0%, cleared at
// 3%, back at `at` seconds into a `cycle`-second loop, shown to the end.
const seq = (cls, at, cycle, prop = 'opacity') => {
  const p = Math.max(4, (at / cycle) * 100);
  return `.${cls} { animation: ${cls} ${cycle}s linear infinite; } ` +
    `@keyframes ${cls} { 0% { ${prop}: 1; } 3%, ${p.toFixed(2)}% { ${prop}: 0; } ${(p + 0.5).toFixed(2)}%, 100% { ${prop}: 1; } }`;
};

const windowBar = (x, y, w, title, wide) =>
  [C.accent, C.mid, C.deep].map((c, i) => `<circle cx="${x + 18 + i * 16}" cy="${y + 17}" r="5" fill="${c}"/>`).join('') +
  `<text x="${x + w / 2}" y="${y + 21}" font-family="${MONO}" font-size="${wide ? 11.5 : 10.5}" fill="${C.muted}" text-anchor="middle">${esc(title)}</text>` +
  `<line x1="${x}" y1="${y + 34}" x2="${x + w}" y2="${y + 34}" stroke="${C.accent}" stroke-opacity="0.25"/>`;

// A terminal that types a command and prints its steps, on a loop.
export function terminal(w, { title, prompt, command, lines }) {
  const wide = w > 500;
  const inset = wide ? 26 : 12;
  const size = wide ? 13 : 11.5;
  const lh = wide ? 24 : 21;
  const x = inset + (wide ? 22 : 14);
  const cycle = 11;
  const css = [];
  const parts = [];
  let y = inset + 34 + (wide ? 34 : 30);

  // The command types one character at a time.
  const chars = [...command].map((ch, i) => {
    const cls = `k${i}`;
    css.push(seq(cls, 0.7 + i * 0.07, cycle, 'fill-opacity'));
    return `<tspan class="${cls}">${esc(ch)}</tspan>`;
  });
  parts.push(`<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${C.text}" xml:space="preserve">` +
    `<tspan fill="${C.accent}">${esc(prompt)} </tspan>${chars.join('')}</text>`);
  let at = 0.7 + command.length * 0.07 + 0.5;

  // Then each step lands, a beat apart.
  lines.forEach(([mark, body], i) => {
    y += lh;
    const cls = `l${i}`;
    css.push(seq(cls, at, cycle));
    at += 0.55;
    const last = i === lines.length - 1;
    parts.push(`<g class="${cls}"><text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${C.muted}" xml:space="preserve">` +
      `<tspan fill="${last ? C.accent : C.soft}" font-weight="700">${esc(mark)}</tspan> ${esc(body)}` +
      `${last ? '<tspan class="cursor" fill="' + C.accent + '">_</tspan>' : ''}</text></g>`);
  });

  const h = y + (wide ? 30 : 24) + inset;
  const body = panel(inset, inset, w - 2 * inset, h - 2 * inset, 14) + windowBar(inset, inset, w - 2 * inset, title, wide) + '\n' + parts.join('\n');
  const label = `Terminal: ${prompt} ${command}; ${lines.map(([m, b]) => `${m} ${b}`).join('; ')}.`;
  return frame(w, h, label, body, css.join('\n  '));
}

// The pulse eases along the line over the first 94% of the cycle with
// cubic-bezier(.45,0,.55,1); this finds when it reaches a given fraction of
// the distance, so each station lights as the pulse arrives.
const PULSE_END = 94;
const arrival = (progress) => {
  const bez = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (bez(mid, 0, 1) < progress) lo = mid;
    else hi = mid;
  }
  return bez(lo, 0.45, 0.55) * PULSE_END;
};
const station = (i, n, cycle) => {
  const on = Math.max(1, arrival(i / (n - 1)));
  // The last station stays lit until the loop restarts.
  const lit = i === n - 1 ? `${on.toFixed(1)}%, 100% { fill: ${C.accent}; }`
    : `${on.toFixed(1)}%, ${(on + 12).toFixed(1)}% { fill: ${C.accent}; } ${(on + 20).toFixed(1)}%, 100% { fill: ${C.bg1}; }`;
  return `.n${i} { animation: n${i} ${cycle}s linear infinite; } ` +
    `@keyframes n${i} { 0%, ${(on - 0.5).toFixed(1)}% { fill: ${C.bg1}; } ${lit} }`;
};

// The delivery pipeline as stations on a line, with a pulse running along it
// and each station lighting up as the pulse reaches it.
export function pipeline(w, { title, stages }) {
  const wide = w > 500;
  const pad = wide ? 28 : 14;
  const cycle = 6;
  const css = [];
  const parts = [eyebrow(pad + 2, 44, title)];
  const n = stages.length;
  let h;
  if (wide) {
    const y = 104;
    const x0 = pad + 70;
    const x1 = w - pad - 70;
    const step = (x1 - x0) / (n - 1);
    parts.push(`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.accent}" stroke-opacity="0.3" stroke-width="2"/>`);
    parts.push(`<circle class="pulse" cx="${x0}" cy="${y}" r="5" fill="${C.soft}"/>`);
    css.push(`.pulse { animation: pulse ${cycle}s cubic-bezier(.45,0,.55,1) infinite; } @keyframes pulse { 0% { transform: translateX(0); opacity: 0; } 6% { opacity: 1; } 88% { opacity: 1; } ${PULSE_END}%, 100% { transform: translateX(${x1 - x0}px); opacity: 0; } }`);
    stages.forEach(([name, note], i) => {
      const cx = x0 + i * step;
      css.push(station(i, n, cycle));
      parts.push(
        `<g class="in"${delay(i)}><circle class="n${i}" cx="${cx}" cy="${y}" r="9" fill="${C.bg1}" stroke="${C.accent}" stroke-width="2"/>` +
          text(cx, y - 24, name, { size: 14.5, weight: 800, anchor: 'middle' }) +
          text(cx, y + 34, note, { size: 12, fill: C.muted, anchor: 'middle' }) + '</g>',
      );
    });
    h = y + 62;
  } else {
    const x = pad + 22;
    const y0 = 78;
    const step = 50;
    const y1 = y0 + (n - 1) * step;
    parts.push(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${C.accent}" stroke-opacity="0.3" stroke-width="2"/>`);
    parts.push(`<circle class="pulse" cx="${x}" cy="${y0}" r="4.5" fill="${C.soft}"/>`);
    css.push(`.pulse { animation: pulse ${cycle}s cubic-bezier(.45,0,.55,1) infinite; } @keyframes pulse { 0% { transform: translateY(0); opacity: 0; } 6% { opacity: 1; } 88% { opacity: 1; } ${PULSE_END}%, 100% { transform: translateY(${y1 - y0}px); opacity: 0; } }`);
    stages.forEach(([name, note], i) => {
      const cy = y0 + i * step;
      css.push(station(i, n, cycle));
      parts.push(
        `<g class="in"${delay(i)}><circle class="n${i}" cx="${x}" cy="${cy}" r="8" fill="${C.bg1}" stroke="${C.accent}" stroke-width="2"/>` +
          text(x + 24, cy - 2, name, { size: 14.5, weight: 800 }) +
          text(x + 24, cy + 16, note, { size: 12, fill: C.muted }) + '</g>',
      );
    });
    h = y1 + 40;
  }
  return frame(w, h, `${title}: ${stages.map(([a, b]) => `${a} (${b})`).join(', then ')}.`, parts.join('\n'), css.join('\n  '));
}

// Score rings that fill to measured values.
export function gauges(w, { title, note, scores }) {
  const wide = w > 500;
  const pad = wide ? 28 : 14;
  const r = wide ? 38 : 30;
  const circ = 2 * Math.PI * r;
  const parts = [eyebrow(pad + 2, 44, title)];
  const css = [];
  const cols = wide ? scores.length : 2;
  const cellW = (w - 2 * pad) / cols;
  const rowH = 2 * r + 46;
  scores.forEach(([label, value, unit = ''], i) => {
    const cx = pad + cellW * (i % cols) + cellW / 2;
    const cy = 66 + r + Math.floor(i / cols) * rowH;
    const off = circ * (1 - value / 100);
    css.push(`.g${i} { animation: g${i} 1.6s cubic-bezier(.2,.7,.2,1) ${(0.3 + i * 0.15).toFixed(2)}s backwards; } @keyframes g${i} { from { stroke-dashoffset: ${circ.toFixed(1)}; } }`);
    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.empty}" stroke-width="${wide ? 7 : 6}"/>` +
        `<circle class="g${i}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${[C.accent, C.mid, C.blue, C.soft][i % 4]}" stroke-width="${wide ? 7 : 6}" stroke-linecap="round" ` +
        `stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>` +
        text(cx, cy + (wide ? 8 : 6), `${value}${unit}`, { size: wide ? 22 : 18, weight: 850, anchor: 'middle' }) +
        text(cx, cy + r + 24, label, { size: 12.5, weight: 700, fill: C.soft, anchor: 'middle' }),
    );
  });
  const rows = Math.ceil(scores.length / cols);
  const ny = 66 + rows * rowH + 6;
  const noteLines = wrap(note, 11.5, w - 2 * pad);
  noteLines.forEach((l, i) => parts.push(text(w / 2, ny + i * 16, l, { size: 11.5, fill: C.muted, anchor: 'middle' })));
  return frame(w, ny + (noteLines.length - 1) * 16 + 22, `${title}: ${scores.map(([l, v, u = '']) => `${l} ${v}${u}`).join(', ')}. ${note}.`, parts.join('\n'), css.join('\n  '));
}

// A short code sample written line by line, with syntax colours. Each line
// is a list of [token, kind] pairs.
const KIND = { kw: C.accent, fn: C.text, str: C.soft, var: '#b7c3f8', num: C.soft, punct: C.muted, cm: '#5c6370' };

export function code(w, { title, file, lines, caption }) {
  const wide = w > 500;
  const inset = wide ? 26 : 12;
  const size = wide ? 13 : 11.2;
  const lh = wide ? 22 : 19;
  const x = inset + (wide ? 22 : 12);
  const cycle = 10;
  const css = [];
  const parts = [];
  let y = inset + 34 + (wide ? 32 : 28);
  lines.forEach((tokens, i) => {
    const cls = `c${i}`;
    css.push(seq(cls, 0.6 + i * 0.45, cycle));
    const spans = tokens.map(([t, k]) => `<tspan fill="${KIND[k]}">${esc(t)}</tspan>`).join('');
    parts.push(`<g class="${cls}"><text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" xml:space="preserve">${spans}</text></g>`);
    y += lh;
  });
  let h = y - lh + (wide ? 28 : 22) + inset;
  const pw = w - 2 * inset;
  const extra = [];
  if (wide && caption) {
    const cx = inset + pw - 250;
    extra.push(`<line x1="${cx - 24}" y1="${inset + 56}" x2="${cx - 24}" y2="${h - inset - 20}" stroke="${C.accent}" stroke-opacity="0.2"/>`);
    caption.forEach((l, i) => extra.push(text(cx, inset + 78 + i * 20, l, { size: i ? 13 : 15, weight: i ? 400 : 800, fill: i ? C.muted : C.text })));
  } else if (caption) {
    caption.forEach((l, i) => parts.push(text(x, y + 10 + i * 18, l, { size: i ? 12 : 13.5, weight: i ? 400 : 800, fill: i ? C.muted : C.text })));
    h += caption.length * 18 + 8;
  }
  const body = panel(inset, inset, pw, h - 2 * inset, 14) + windowBar(inset, inset, pw, file, wide) + '\n' + parts.join('\n') + extra.join('\n');
  const src = lines.map((l) => l.map(([t]) => t).join('')).join(' ');
  return frame(w, h, `${title}: ${src}${caption ? ` — ${caption.join(' ')}` : ''}`, body, css.join('\n  '));
}
