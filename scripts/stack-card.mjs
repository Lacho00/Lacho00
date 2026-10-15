// Draws the stack as a dark card of icon chips, grouped in rows, in the same
// palette as the generated sections. Called by build-assets.mjs.
import { ICONS } from './stack-icons.mjs';

const GROUPS = [
  ['WORDPRESS', [
    ['php', 'PHP'], ['wordpress', 'WordPress'], ['woocommerce', 'WooCommerce'],
    ['javascript', 'JavaScript'], ['tailwindcss', 'Tailwind CSS'], ['acf', 'ACF / SCF'],
    ['polylang', 'Polylang'], ['wpml', 'WPML'], ['rankmath', 'Rank Math'], ['wpcli', 'WP-CLI'],
  ]],
  ['BUILDERS &amp; THEMES', [
    ['elementor', 'Elementor / Elementor Pro'], ['divi', 'Divi'], ['wpbakery', 'WPBakery'],
    ['crocoblock', 'Crocoblock'], ['envato', 'ThemeForest themes'], ['code', 'Custom themes from scratch'],
  ]],
  ['JS &amp; BACKEND', [
    ['typescript', 'TypeScript'], ['nodedotjs', 'Node.js'], ['hono', 'Hono'],
    ['cloudflareworkers', 'Cloudflare Workers'], ['cloudflare', 'D1'], ['drizzle', 'Drizzle'],
    ['supabase', 'Supabase'], ['postgresql', 'Postgres'], ['grammy', 'grammY'],
  ]],
  ['TOOLING &amp; AI', [
    ['claude', 'Claude Code'], ['modelcontextprotocol', 'MCP'], ['playwright', 'Playwright'],
    ['vitest', 'Vitest'], ['githubactions', 'GitHub Actions'], ['python', 'Python'],
  ]],
];

const W = 860;
const PAD = 30;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const CHIP_H = 30;
const GAP = 8;
const ICON = 16;
const TEXT = 12.5;

// No font metrics at build time: estimate the label width from rough
// per-character widths of a system sans at TEXT px.
const textWidth = (s) =>
  [...s.replace(/&amp;/g, '&')].reduce((w, c) => {
    if (/[iljtf.,:'|!\/ \-()]/.test(c)) return w + 0.3;
    if (/[mwMW]/.test(c)) return w + 0.86;
    if (/[A-Z&]/.test(c)) return w + 0.68;
    return w + 0.56;
  }, 0) * TEXT * 0.9;

const chipWidth = (label) => 12 + ICON + 8 + Math.ceil(textWidth(label)) + 14;

export function buildStackCard() {
  const parts = [];
  let y = 26;
  let i = 0;
  for (const [title, items] of GROUPS) {
    y += 18;
    parts.push(`<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="11" font-weight="800" letter-spacing="4" fill="#8b949e">${title}</text>`);
    y += 12;
    let x = PAD;
    for (const [slug, label] of items) {
      const cw = chipWidth(label);
      if (x + cw > W - PAD) {
        x = PAD;
        y += CHIP_H + GAP;
      }
      const icon = ICONS[slug];
      if (!icon) throw new Error(`stack card: no icon for ${slug}`);
      const s = ICON / 24;
      parts.push(
        `<g class="chip" style="animation-delay:${(i++ * 0.04).toFixed(2)}s">` +
          `<rect x="${x}" y="${y}" width="${cw}" height="${CHIP_H}" rx="9" fill="rgba(8,8,12,0.5)" stroke="#7b93f5" stroke-opacity="0.35"/>` +
          `<g transform="translate(${x + 12} ${y + (CHIP_H - ICON) / 2}) scale(${s})" fill="#9aabf5" color="#9aabf5">${icon}</g>` +
          `<text x="${x + 12 + ICON + 8}" y="${y + 19.5}" font-family="${FONT}" font-size="${TEXT}" fill="#e6edf3">${label}</text>` +
          `</g>`,
      );
      x += cw + GAP;
    }
    y += CHIP_H + 14;
  }
  const H = y + 12;
  const names = GROUPS.flatMap(([, items]) => items.map(([, l]) => l)).join(', ').replace(/&amp;/g, 'and');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Stack: ${names}">
<defs>
  <linearGradient id="stack-bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0a0a0f"/><stop offset="54%" stop-color="#101018"/><stop offset="100%" stop-color="#0a0a0f"/>
  </linearGradient>
  <radialGradient id="stack-orb" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#3858e9" stop-opacity="0.14"/><stop offset="100%" stop-color="#3858e9" stop-opacity="0"/>
  </radialGradient>
</defs>
<style>
  .chip { opacity: 0; animation: stack-in 0.5s ease-out forwards; }
  @keyframes stack-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .chip { animation: none; opacity: 1; } }
</style>
<rect width="${W}" height="${H}" rx="20" fill="url(#stack-bg)"/>
<ellipse cx="${W * 0.78}" cy="${H * 0.3}" rx="260" ry="160" fill="url(#stack-orb)"/>
${parts.join('\n')}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="#7b93f5" stroke-opacity="0.62"/>
</svg>
`;
}
