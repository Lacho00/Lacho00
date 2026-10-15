// Narrow versions of the profile cards for phone screens. The generated
// sections are always 860px wide, so on a phone their text shrinks to ~5px;
// these are drawn ~400px wide with the content stacked. The README serves
// them through <picture><source media="(max-width: 600px)">.

const W = 400;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

const frame = (h, label, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${label}">
<defs>
  <linearGradient id="m-bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0a0a0f"/><stop offset="54%" stop-color="#101018"/><stop offset="100%" stop-color="#0a0a0f"/>
  </linearGradient>
</defs>
<style>
  .ring { animation: m-pulse 4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
  .cursor { animation: m-blink 1.1s steps(1) infinite; }
  @keyframes m-pulse { 50% { opacity: 0.4; } }
  @keyframes m-blink { 50% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .ring, .cursor { animation: none; } }
</style>
<rect width="${W}" height="${h}" rx="18" fill="url(#m-bg)"/>
${body}
<rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" rx="17.5" fill="none" stroke="#7b93f5" stroke-opacity="0.62"/>
</svg>
`;

export function buildAboutMobile() {
  const lines = ['I build custom WordPress', 'themes and WooCommerce', 'stores, and the tools', 'behind them.'];
  const h = 252;
  const text = lines
    .map((l, i) => `<text x="34" y="${88 + i * 30}" font-family="${FONT}" font-size="22" font-weight="820" letter-spacing="-0.3" fill="#e6edf3">${l}</text>`)
    .join('\n');
  const body = `<circle class="ring" cx="340" cy="70" r="22" fill="none" stroke="#e6edf3" stroke-opacity="0.3"/>
<circle class="ring" cx="340" cy="70" r="38" fill="none" stroke="#e6edf3" stroke-opacity="0.16"/>
<rect x="16" y="16" width="${W - 32}" height="${h - 32}" rx="16" fill="rgba(8,8,12,0.5)" stroke="#7b93f5" stroke-opacity="0.5"/>
<text x="34" y="50" font-family="${FONT}" font-size="11" font-weight="800" letter-spacing="4" fill="#8b949e">ABOUT</text>
${text}
<text x="34" y="214" font-family="${FONT}" font-size="14" font-weight="750" fill="#7b93f5">&gt; open to WordPress &amp; automation work<tspan class="cursor">_</tspan></text>`;
  return frame(h, 'About: I build custom WordPress themes and WooCommerce stores, and the tools behind them. Open to WordPress and automation work.', body);
}
