// Draws every profile card as an SVG, in two widths: DESKTOP for wide screens
// and PHONE for narrow ones (the README picks one with a media query). On a
// phone GitHub shows the image about 310px wide, so PHONE cards are drawn at
// that size and their text keeps its real size.

export const DESKTOP = 860;
export const PHONE = 320;
export const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
export const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

export const C = {
  bg0: '#0a0a0f', bg1: '#101018', panel: 'rgba(8,8,12,0.5)', empty: '#16161f',
  text: '#e6edf3', muted: '#8b949e', accent: '#7b93f5', soft: '#9aabf5',
  blue: '#3858e9', mid: '#4a68ee', deep: '#2c45c4', night: '#1e2f8a',
};

export const esc = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (s) => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// No font metrics at build time: estimate a label's width from rough
// per-character widths of a system sans.
export const textWidth = (s, size, bold = false) =>
  [...plain(s)].reduce((w, c) => {
    if (/[iljtf.,:;'|!\/ \-()]/.test(c)) return w + 0.3;
    if (/[mwMW]/.test(c)) return w + 0.86;
    if (/[A-Z&%]/.test(c)) return w + 0.68;
    if (/[0-9]/.test(c)) return w + 0.58;
    return w + 0.55;
  }, 0) * size * (bold ? 0.98 : 0.9);

// Greedy word wrap on the estimated widths.
export const wrap = (s, size, max, bold) => {
  const lines = [];
  let line = '';
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size, bold) > max * 0.92) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

export const text = (x, y, s, { size = 13, weight = 400, fill = C.text, spacing, anchor, mono, cls } = {}) =>
  `<text${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" font-family="${mono ? MONO : FONT}" font-size="${size}"` +
  `${weight !== 400 ? ` font-weight="${weight}"` : ''}${spacing ? ` letter-spacing="${spacing}"` : ''}` +
  `${anchor ? ` text-anchor="${anchor}"` : ''} fill="${fill}">${esc(s)}</text>`;

export const eyebrow = (x, y, s) => text(x, y, s.toUpperCase(), { size: 11, weight: 800, spacing: 4, fill: C.muted });

// Shared shell: background, two slow glows, outer border and the base styles
// every card uses (fade-in, cursor blink, reduced motion).
export const frame = (w, h, label, body, extraCss = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${C.bg0}"/><stop offset="54%" stop-color="${C.bg1}"/><stop offset="100%" stop-color="${C.bg0}"/>
  </linearGradient>
  <radialGradient id="glow-a"><stop offset="0%" stop-color="${C.accent}" stop-opacity="0.13"/><stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
  <radialGradient id="glow-b"><stop offset="0%" stop-color="${C.blue}" stop-opacity="0.12"/><stop offset="100%" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
</defs>
<style>
  .glow-a { animation: drift-a 14s ease-in-out infinite; }
  .glow-b { animation: drift-b 18s ease-in-out infinite; }
  .in { animation: fade-in 0.6s ease-out backwards; }
  .cursor { animation: blink 1.1s steps(1) infinite; }
  @keyframes drift-a { 50% { transform: translate(40px, 12px); } }
  @keyframes drift-b { 50% { transform: translate(-36px, -10px); } }
  @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  @keyframes blink { 50% { opacity: 0; } }
  ${extraCss}
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
<rect width="${w}" height="${h}" rx="${w > 500 ? 20 : 16}" fill="url(#bg)"/>
<ellipse class="glow-a" cx="${w * 0.2}" cy="${h * 0.1}" rx="${w * 0.35}" ry="${h * 0.6}" fill="url(#glow-a)"/>
<ellipse class="glow-b" cx="${w * 0.8}" cy="${h * 0.95}" rx="${w * 0.35}" ry="${h * 0.6}" fill="url(#glow-b)"/>
${body}
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${w > 500 ? 19.5 : 15.5}" fill="none" stroke="${C.accent}" stroke-opacity="0.62"/>
</svg>
`;

export const panel = (x, y, w, h, r = 16) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${C.panel}" stroke="${C.accent}" stroke-opacity="0.5"/>`;
export const delay = (i, step = 0.08) => ` style="animation-delay:${(i * step).toFixed(2)}s"`;

// Hero: avatar, handle, name, headline and the top languages.
export function hero(w, { avatar, handle, name, headline, langs }) {
  const wide = w > 500;
  const inset = wide ? 22 : 12;
  const r = wide ? 44 : 30;
  const cx = inset + 20 + r;
  const cy = wide ? 92 : 64;
  const tx = cx + r + (wide ? 24 : 16);
  const parts = [
    `<clipPath id="avatar"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`,
    `<image href="${avatar}" x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#avatar)"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r + 1}" fill="none" stroke="${C.accent}" stroke-width="2"/>`,
    `<circle class="ring" cx="${cx}" cy="${cy}" r="${r + 8}" fill="none" stroke="${C.accent}" stroke-opacity="0.35"/>`,
    text(tx, cy - (wide ? 32 : 20), `@${handle}`, { size: 12, weight: 600, spacing: 3, fill: C.muted }),
    text(tx, cy + (wide ? 14 : 10), name, { size: wide ? 46 : 32, weight: 850, spacing: -1, cls: 'in' }),
  ];
  let y;
  if (wide) {
    parts.push(text(tx, cy + 40, headline, { size: 15, fill: C.muted }));
    y = cy + 66;
  } else {
    const lines = headline.split(' · ').flatMap((part) => wrap(part, 14, w - 2 * inset - 16));
    lines.forEach((l, i) => parts.push(text(inset + 20, cy + r + 34 + i * 20, l, { size: 14, fill: C.muted })));
    y = cy + r + 34 + (lines.length - 1) * 20 + 22;
  }
  let x = inset + 20;
  langs.forEach((l, i) => {
    const cw = textWidth(l, 12, true) + 30;
    if (x + cw > w - inset - 20) return;
    parts.push(
      `<g class="in"${delay(i + 2)}><rect x="${x}" y="${y}" width="${cw}" height="26" rx="13" fill="${C.panel}" stroke="${C.accent}" stroke-opacity="0.45"/>` +
        text(x + 15, y + 17.5, l, { size: 12, weight: 700 }) + '</g>',
    );
    x += cw + 10;
  });
  const h = y + 26 + inset + 20;
  const body = panel(inset, inset, w - 2 * inset, h - 2 * inset, 20) + '\n' + parts.join('\n');
  return frame(w, h, `${name}, ${headline}`, body,
    '.ring { animation: pulse 4s ease-in-out infinite; } @keyframes pulse { 50% { stroke-opacity: 0.08; } }');
}

// About: eyebrow, a headline sentence and a terminal-style call to action.
export function about(w, { headline, cta }) {
  const wide = w > 500;
  const inset = wide ? 26 : 12;
  const x = inset + (wide ? 22 : 16);
  const size = wide ? 24 : 20;
  const lines = wrap(headline, size, w - 2 * x - (wide ? 150 : 0), true);
  const lh = size * 1.32;
  const parts = [eyebrow(x, inset + 38, 'About')];
  lines.forEach((l, i) => parts.push(text(x, inset + 78 + i * lh, l, { size, weight: 820, spacing: -0.3, cls: 'in' })));
  const ctaY = inset + 78 + (lines.length - 1) * lh + (wide ? 34 : 32);
  parts.push(
    `<text x="${x}" y="${ctaY}" font-family="${FONT}" font-size="${wide ? 13 : 13}" font-weight="750" fill="${C.accent}">&gt; ${esc(cta)}<tspan class="cursor">_</tspan></text>`,
  );
  const h = ctaY + inset + 24;
  const ring = wide
    ? [26, 44, 70].map((r, i) => `<circle cx="${w - 112}" cy="${h / 2}" r="${r}" fill="none" stroke="${C.text}" stroke-opacity="${[0.3, 0.2, 0.12][i]}"/>`).join('')
    : '';
  return frame(w, h, `About: ${plain(headline)} ${plain(cta)}.`, ring + panel(inset, inset, w - 2 * inset, h - 2 * inset, 20) + '\n' + parts.join('\n'));
}

// Three short facts: columns on desktop, rows on a phone.
// A '\n' in a description marks where it breaks on desktop; on a phone
// the description runs on one line with a comma there instead.
export function highlights(w, { title, items }) {
  const wide = w > 500;
  const oneLine = (d) => d.replace(/\n/g, ', ');
  const pad = wide ? 28 : 14;
  const parts = [eyebrow(pad + 2, 44, title)];
  const bars = items.length > 3 ? [C.accent, C.mid, C.blue, C.deep, C.night] : [C.accent, C.mid, C.deep];
  let h;
  if (wide) {
    // Up to four cards a row; a shorter last row stretches across the width.
    const gap = 16;
    let y = 60;
    for (let start = 0; start < items.length; start += 4) {
      const row = items.slice(start, start + 4);
      const cw = (w - 2 * pad - (row.length - 1) * gap) / row.length;
      const descs = row.map(([, d]) => (cw > 400 ? [oneLine(d)] : d.split('\n')).flatMap((part) => wrap(part, 12.5, cw - 36)));
      const extra = (Math.max(...descs.map((l) => l.length)) - 1) * 17;
      row.forEach(([t], k) => {
        const i = start + k;
        const x = pad + k * (cw + gap);
        parts.push(
          `<g class="in"${delay(i)}>${panel(x, y, cw, 96 + extra)}<rect x="${x}" y="${y + 22}" width="4" height="${52 + extra}" rx="2" fill="${bars[i]}"/>` +
            text(x + 24, y + 38, t, { size: 16, weight: 850 }) +
            descs[k].map((l, j) => text(x + 24, y + 62 + j * 17, l, { size: 12.5, fill: C.muted })).join('') + '</g>',
        );
      });
      y += 96 + extra + gap;
    }
    h = y - gap + 24;
  } else {
    items.forEach(([t, d], i) => {
      const y = 60 + i * 72;
      parts.push(
        `<g class="in"${delay(i)}>${panel(pad, y, w - 2 * pad, 62, 14)}<rect x="${pad}" y="${y + 14}" width="4" height="34" rx="2" fill="${bars[i]}"/>` +
          text(pad + 20, y + 26, t, { size: 16, weight: 850 }) + text(pad + 20, y + 47, oneLine(d), { size: 13, fill: C.muted }) + '</g>',
      );
    });
    h = 60 + items.length * 72 + 8;
  }
  return frame(w, h, `${plain(title)}: ${items.map(([t, d]) => `${plain(t)}, ${plain(oneLine(d))}`).join('; ')}.`, parts.join('\n'));
}

// Language shares as bars that grow in.
export function languages(w, { langs, note }) {
  const wide = w > 500;
  const pad = wide ? 28 : 14;
  const noteLines = wrap(note, 12.5, w - 2 * pad);
  const parts = [eyebrow(pad + 2, 44, 'Languages'), ...noteLines.map((l, i) => text(pad + 2, 66 + i * 18, l, { size: 12.5, fill: C.muted }))];
  const max = langs[0].share;
  const shades = [C.accent, C.mid, C.blue, C.deep, C.night, C.night];
  let y = 92 + (noteLines.length - 1) * 18;
  langs.forEach(({ name, share }, i) => {
    const pct = `${share < 1 ? share.toFixed(1) : Math.round(share)}%`;
    if (wide) {
      const bx = pad + 190;
      const bw = w - bx - pad - 10;
      parts.push(
        `<g class="in"${delay(i)}>` + text(pad + 2, y + 9, name, { size: 14, weight: 700 }) +
          text(pad + 160, y + 9, pct, { size: 13, weight: 700, fill: C.soft, anchor: 'end' }) +
          `<rect x="${bx}" y="${y}" width="${bw}" height="10" rx="5" fill="${C.empty}"/>` +
          `<rect class="bar"${delay(i, 0.1)} x="${bx}" y="${y}" width="${Math.max(4, (bw * share) / max)}" height="10" rx="5" fill="${shades[i]}"/></g>`,
      );
      y += 30;
    } else {
      const bw = w - 2 * pad - 4;
      parts.push(
        `<g class="in"${delay(i)}>` + text(pad + 2, y + 10, name, { size: 14, weight: 700 }) +
          text(w - pad - 2, y + 10, pct, { size: 13, weight: 700, fill: C.soft, anchor: 'end' }) +
          `<rect x="${pad + 2}" y="${y + 18}" width="${bw}" height="8" rx="4" fill="${C.empty}"/>` +
          `<rect class="bar"${delay(i, 0.1)} x="${pad + 2}" y="${y + 18}" width="${Math.max(4, (bw * share) / max)}" height="8" rx="4" fill="${shades[i]}"/></g>`,
      );
      y += 44;
    }
  });
  const h = y + (wide ? 12 : 8);
  return frame(w, h, `Languages: ${langs.map((l) => `${l.name} ${Math.round(l.share)}%`).join(', ')}.`, parts.join('\n'),
    '.bar { transform-box: fill-box; transform-origin: left; animation: grow 1.1s ease-out backwards; } @keyframes grow { from { transform: scaleX(0); } }');
}

// Public projects: name, description, main language, stars and topics.
export function projects(w, { repos }) {
  const wide = w > 500;
  const pad = wide ? 28 : 14;
  const parts = [eyebrow(pad + 2, 44, 'Projects')];
  const cols = wide ? 2 : 1;
  const gap = 16;
  const cw = (w - 2 * pad - (cols - 1) * gap) / cols;
  const inner = cw - 40;
  // With an odd count, the last card spans the full row instead of leaving half of it empty.
  const span = (i) => cols > 1 && i === repos.length - 1 && i % cols === 0;
  const cards = repos.map((r, i) => {
    const iw = span(i) ? w - 2 * pad - 40 : inner;
    const desc = wrap(r.description, 13, iw);
    const topics = [];
    let tx = 0;
    for (const t of r.topics) {
      const tw = textWidth(t, 11.5) + 20;
      if (tx + tw > iw) break;
      topics.push([t, tx, tw]);
      tx += tw + 6;
    }
    return { r, desc, topics, h: 58 + desc.length * 19 + (topics.length ? 40 : 0) + 34 };
  });
  const rowH = (i) => Math.max(...cards.slice(i - (i % cols), i - (i % cols) + cols).map((c) => c.h));
  let y = 62;
  cards.forEach((c, i) => {
    const col = i % cols;
    if (col === 0 && i) y += rowH(i - 1) + gap;
    const x = pad + col * (cw + gap);
    const ch = rowH(i);
    const g = [panel(x, y, span(i) ? w - 2 * pad : cw, ch), text(x + 20, y + 34, c.r.name, { size: 16, weight: 850 })];
    c.desc.forEach((l, j) => g.push(text(x + 20, y + 60 + j * 19, l, { size: 13, fill: C.muted })));
    const ty = y + 60 + (c.desc.length - 1) * 19 + 22;
    c.topics.forEach(([t, ox, tw]) =>
      g.push(`<rect x="${x + 20 + ox}" y="${ty}" width="${tw}" height="22" rx="11" fill="none" stroke="${C.accent}" stroke-opacity="0.4"/>` +
        text(x + 30 + ox, ty + 15, t, { size: 11.5, fill: C.soft })),
    );
    const fy = y + ch - 18;
    g.push(
      `<circle cx="${x + 25}" cy="${fy - 4}" r="5" fill="${C.accent}"/>` +
        text(x + 36, fy, `${c.r.language}  ·  ★ ${c.r.stars}  ·  ${c.r.role}`, { size: 12.5, fill: C.muted }),
    );
    parts.push(`<g class="in"${delay(i)}>${g.join('')}</g>`);
  });
  const h = y + rowH(cards.length - 1) + 24;
  return frame(w, h, `Projects: ${repos.map((r) => `${r.name}, ${plain(r.description)}`).join('; ')}`, parts.join('\n'));
}

// The contribution grid with a snake eating through it. The grid and its
// animation come from Platane/snk (run by the workflow); this only frames
// its SVG like the other cards, with the yearly total above it.
export function snake(w, { svg, total }) {
  const wide = w > 500;
  const pad = wide ? 28 : 14;
  const [, vw, vh] = svg.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/).map(Number);
  const sw = w - 2 * pad;
  const sh = Math.round((sw * vh) / vw);
  const y0 = wide ? 84 : 78;
  const parts = [
    eyebrow(pad + 2, 44, 'Activity'),
    text(pad + 2, 72, `${total.toLocaleString('en-US')} contributions in the last year`, { size: wide ? 18 : 16, weight: 800 }),
    svg.replace(/<\?xml[^>]*>/, '').replace(/<desc>[^<]*<\/desc>/, '').replace(/<svg[^>]*>/, (tag) =>
      `<svg x="${pad}" y="${y0}" width="${sw}" height="${sh}" ${tag.match(/viewBox="[^"]*"/)[0]}>`),
  ];
  return frame(w, y0 + sh + (wide ? 14 : 12), `Activity: ${total} contributions in the last year, with a snake eating through the contribution grid.`, parts.join('\n'));
}

