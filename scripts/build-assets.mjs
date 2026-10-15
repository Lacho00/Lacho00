// Fetches the animated profile sections, removes the generator watermark,
// recolours them, rewrites the default copy and writes one SVG per section
// into assets/. Only the dark mode is built: the profile stays dark for every
// visitor. Run by .github/workflows/profile-assets.yml once a day.
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'https://www.gitskins.com/api/section';
const COMMON = {
  username: 'lacho00',
  theme: 'github-dark',
  avatar: 'https://avatars.githubusercontent.com/u/109485638?v=4',
};
const highlights = (items) => items.map(([title, text]) => `${title}::${text}`).join('|');

const SECTIONS = [
  {
    name: 'hero',
    params: { label: 'Lacho' },
    replace: [['Building with PHP on GitHub.', 'WordPress &amp; WooCommerce developer · AI tooling']],
  },
  { name: 'wordmark', params: { label: 'Lacho' } },
  {
    name: 'about',
    replace: [
      ['Engineer building with PHP and shipping open', 'I build custom WordPress themes and'],
      ['>source.<', '>WooCommerce stores, and the tools behind them.<'],
      ['&gt; open to collaboration', '&gt; open to WordPress &amp; automation work'],
    ],
  },
  {
    name: 'focus',
    section: 'highlights',
    params: {
      items: highlights([
        ['WordPress', 'Custom themes &amp; stores'],
        ['WooCommerce', 'Online stores, end to end'],
        ['AI tooling', 'Claude Code plugins &amp; bots'],
      ]),
    },
    replace: [['>HIGHLIGHTS<', '>FOCUS<']],
  },
  {
    name: 'numbers',
    section: 'highlights',
    params: {
      items: highlights([
        ['18', 'client sites in the past year'],
        ['1,000+', 'commits in client work'],
        ['479', 'commits to claude-wp-builder'],
      ]),
    },
    replace: [['>HIGHLIGHTS<', '>BY THE NUMBERS<']],
  },
  {
    name: 'craft',
    section: 'highlights',
    params: {
      items: highlights([
        ['Multilingual', 'Polylang &amp; WPML on 15 sites'],
        ['Custom code', 'REST, blocks, post types'],
        ['Site audits', 'Security, SEO, a11y, speed'],
      ]),
    },
    replace: [['>HIGHLIGHTS<', '>WHAT I BRING<']],
  },
  { name: 'stack' },
  { name: 'projects', params: { repos: 'yojahny55/claude-wp-builder,yojahny55/ix-wp-envsync' } },
  { name: 'heatmap', params: { style: 'snake' } },
  { name: 'chess' },
];

// The watermark is a single <text> node; the aria-label also names the generator.
const clean = (svg) =>
  svg
    .replace(/<text[^>]*>\s*gitskins\.com\s*<\/text>/gi, '')
    .replace(/aria-label="GitSkins /g, 'aria-label="');

// Near-black base with WordPress blue accents. Keys are the github-dark theme
// colours; language dots (PHP, JS, CSS, HTML) are left as they are.
const PALETTE = {
  '#0d1117': '#0a0a0f', '#0b0e14': '#07070b', '#111722': '#0e0e15', '#161b22': '#101018',
  '#1f2938': '#16161f', '#262f3b': '#1c1c27', '#2a3038': '#20202a',
  '#58a6ff': '#7b93f5', '#3b82f6': '#3858e9', '#bedcff': '#c9d2fb',
  '#a371f7': '#2c45c4', '#22d3ee': '#1e2f8a',
  '#39d353': '#3858e9', '#43d55c': '#4a68ee', '#7ee787': '#9aabf5', '#3fb950': '#3858e9',
};
const recolor = (svg) =>
  svg
    .replace(/#[0-9a-f]{6}\b/gi, (c) => PALETTE[c.toLowerCase()] ?? c)
    // Dim the background glows for a quieter look.
    .replace(/(<radialGradient[^>]*orb[\s\S]*?<\/radialGradient>)/g, (g) =>
      g.replace(/stop-opacity="([\d.]+)"/g, (_, o) => `stop-opacity="${(o * 0.45).toFixed(2)}"`),
    );

await mkdir('assets', { recursive: true });
let failed = 0;

for (const s of SECTIONS) {
  for (const mode of ['dark']) {
    const url = new URL(`${BASE}/${s.section ?? s.name}`);
    for (const [k, v] of Object.entries({ ...COMMON, ...s.params, mode })) {
      // Items are written with entities so the SVG stays valid; the API wants plain text.
      url.searchParams.set(k, String(v).replaceAll('&amp;', '&'));
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) }).catch((e) => e);
    if (!(res instanceof Response) || !res.ok) {
      console.error(`skip ${s.name}-${mode}: ${res.status ?? res.message}`);
      failed++;
      continue;
    }
    let svg = recolor(clean(await res.text()));
    for (const [from, to] of s.replace ?? []) {
      if (!svg.includes(from)) console.warn(`${s.name}-${mode}: "${from}" not found`);
      svg = svg.replaceAll(from, to);
    }
    if (/gitskins/i.test(svg.replace(/id="gs-[^"]*"|#gs-[\w-]+/g, ''))) {
      console.warn(`${s.name}-${mode}: generator name still present`);
    }
    await writeFile(`assets/${s.name}-${mode}.svg`, svg);
    console.log(`ok ${s.name}-${mode}`);
  }
}

// Keep the previous files when the API is down instead of failing the run.
if (failed) console.warn(`${failed} section(s) not refreshed`);
