// Draws the stack as a dark card of icon chips, grouped in rows. Called by
// build-assets.mjs once per card width.
import { ICONS } from './stack-icons.mjs';
import { C, FONT, frame, textWidth } from './cards.mjs';

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

const CHIP_H = 30;
const GAP = 8;
const ICON = 16;
const TEXT = 12.5;

const chipWidth = (label) => 12 + ICON + 8 + Math.ceil(textWidth(label, TEXT)) + 14;

export function buildStackCard(W) {
  const PAD = W > 500 ? 30 : 14;
  const parts = [];
  let y = 26;
  let i = 0;
  for (const [title, items] of GROUPS) {
    y += 18;
    parts.push(`<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="11" font-weight="800" letter-spacing="4" fill="${C.muted}">${title}</text>`);
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
  return frame(W, H, `Stack: ${names}`, parts.join('\n'),
    '.chip { animation: fade-in 0.5s ease-out backwards; }');
}
