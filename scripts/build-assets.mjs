// Builds every profile card into assets/, twice: <name>-dark.svg for wide
// screens and <name>-mobile-dark.svg for phones. Only the dark look is built:
// the profile stays dark for every visitor. Run by
// .github/workflows/profile-assets.yml once a day; locally run it with
// GITHUB_TOKEN=$(gh auth token) node scripts/build-assets.mjs
// The snake card is built only when the workflow's Platane/snk step has left
// its SVG at dist/snake.svg; without it the committed snake card is kept.
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { DESKTOP, PHONE, about, hero, highlights, projects, snake } from './cards.mjs';
import { commitCount, loadProfile } from './data.mjs';
import { code, gauges, pipeline, terminal } from './showcase-cards.mjs';
import { buildStackCard } from './stack-card.mjs';

const token = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN;
if (!token) throw new Error('Set PROFILE_TOKEN or GITHUB_TOKEN');

const CONTRIBUTED = ['yojahny55/claude-wp-builder', 'yojahny55/ix-wp-envsync'];
// Own repos are already counted in the language shares, so only the contributed ones are added there.
const FEATURED = [...CONTRIBUTED, 'Lacho00/issue-bot', 'Lacho00/boardly'];
// Shorter, cleaner copy than the repos' own descriptions.
const DESCRIPTIONS = {
  'claude-wp-builder': 'Claude Code plugin that turns an approved HTML demo into a custom WordPress theme.',
  'ix-wp-envsync': 'Syncs a WordPress site between local, staging and production, with rollback.',
  'boardly': 'Dashboard that monitors uptime, performance, SSL and SEO for many sites, with Slack alerts and PDF reports.',
  'issue-bot': 'Telegram bot that takes a site issue, agrees a plan, fixes it with Claude Code and returns a before/after report.',
};

const data = await loadProfile({ login: 'Lacho00', featured: FEATURED, contributed: CONTRIBUTED, token, ownerToken: Boolean(process.env.PROFILE_TOKEN) });
const builderCommits = await commitCount(token, 'yojahny55/claude-wp-builder', 'Lacho00');
console.log(`token: ${process.env.PROFILE_TOKEN ? 'PROFILE_TOKEN' : 'GITHUB_TOKEN'}, repos: ${data.repoCount}, languages: ${data.langs.map((l) => l.name).join(', ')}`);

const CARDS = {
  hero: (w) => hero(w, {
    avatar: data.avatar,
    handle: 'lacho00',
    name: 'Lacho',
    headline: 'Fullstack developer · WordPress, TypeScript & automation',
    langs: data.langs.slice(0, 4).map((l) => l.name),
  }),
  about: (w) => about(w, {
    headline: 'WordPress themes, stores and plugins, plus TypeScript backends, bots and integrations. Now building with React.',
    cta: 'open to fullstack & automation work',
  }),
  numbers: (w) => highlights(w, {
    title: 'By the numbers',
    items: [['27', 'WordPress sites built or run'], ['15+', 'in-house plugins'], ['1,000+', 'commits since late 2025'], [builderCommits ? builderCommits.toLocaleString('en-US') : '500+', 'commits to claude-wp-builder']],
  }),
  craft: (w) => highlights(w, {
    title: 'Expertise',
    items: [['WooCommerce', '11 online stores'], ['Custom themes', '9 from scratch\nTailwind + ACF'], ['Page builders', 'Elementor (17)\nDivi, WPBakery'], ['Multilingual', 'Polylang & WPML\n8 sites'], ['Automation & AI', 'Node/TS bots\nClaude Code plugins']],
  }),
  tools: (w) => buildStackCard(w),
  projects: (w) => projects(w, {
    repos: data.repos.map((r) => ({ ...r, description: DESCRIPTIONS[r.name] ?? r.description, role: CONTRIBUTED.some((f) => f.endsWith(`/${r.name}`)) ? 'Contributor' : 'Author' })),
  }),
  terminal: (w) => terminal(w, {
    title: 'claude-wp-builder',
    prompt: '>',
    command: '/wp-yolo demo/',
    lines: [['✓', 'demo split into sections'], ['✓', 'theme scaffolded · Tailwind + ACF'], ['✓', 'fields + template parts per section'], ['✓', 'content seeded · es / en'], ['→', 'theme ready for review']],
  }),
  workflow: (w) => pipeline(w, {
    title: 'Workflow',
    stages: [['Design', 'Figma'], ['Demo', 'pixel-close HTML'], ['Theme', 'ACF + i18n'], ['Audit', 'a11y · SEO · speed'], ['Ship', 'env sync']],
  }),
  quality: (w) => gauges(w, {
    title: 'Measured quality',
    note: 'Lighthouse, mean of 8 pages on an audited client build',
    scores: [['Performance', 98, '', '90+'], ['Accessibility', 96, '', '90+'], ['SEO', 93, '', '90+'], ['Audit criteria', 80, '%']],
  }),
  code: (w) => code(w, {
    title: 'Code sample',
    file: 'shipping-rules.php',
    lines: [
      [['add_filter', 'fn'], ['(', 'punct'], ["'woocommerce_package_rates'", 'str'], [',', 'punct']],
      [['  fn', 'kw'], ['(', 'punct'], ['$rates', 'var'], [', ', 'punct'], ['$pkg', 'var'], [') => ', 'punct'], ['array_filter', 'fn'], ['(', 'punct']],
      [['    $rates', 'var'], [',', 'punct']],
      [['    fn', 'kw'], ['(', 'punct'], ['$r', 'var'], [') => ', 'punct'], ['prefix_zone', 'fn'], ['(', 'punct'], ['$pkg', 'var'], [')', 'punct']],
      [['      ->', 'punct'], ['allows', 'fn'], ['(', 'punct'], ['$r', 'var'], ['->', 'punct'], ['method_id', 'var'], [')', 'punct']],
      [['  ), ', 'punct'], ['10', 'num'], [', ', 'punct'], ['2', 'num'], [');', 'punct']],
    ],
    caption: ['One filter, no extra plugin', 'Hides the shipping methods a', "customer's zone can't use."],
  }),
  'code-ts': (w) => code(w, {
    title: 'Code sample',
    file: 'ingest.ts',
    lines: [
      [['ingest', 'var'], ['.', 'punct'], ['post', 'fn'], ['(', 'punct'], ["'/sms'", 'str'], [', ', 'punct'], ['async', 'kw'], [' (', 'punct'], ['c', 'var'], [') => {', 'punct']],
      [['  const', 'kw'], [' sms', 'var'], [' = ', 'punct'], ['Sms', 'var'], ['.', 'punct'], ['safeParse', 'fn'], ['(', 'punct']],
      [['    await', 'kw'], [' c', 'var'], ['.', 'punct'], ['req', 'var'], ['.', 'punct'], ['json', 'fn'], ['());', 'punct']],
      [['  if', 'kw'], [' (!', 'punct'], ['sms', 'var'], ['.', 'punct'], ['success', 'var'], [')', 'punct']],
      [['    return', 'kw'], [' c', 'var'], ['.', 'punct'], ['json', 'fn'], ['(', 'punct'], ['sms', 'var'], ['.', 'punct'], ['error', 'var'], [', ', 'punct'], ['400', 'num'], [');', 'punct']],
      [['  const', 'kw'], [' entry', 'var'], [' = ', 'punct'], ['await', 'kw'], [' ingestSms', 'fn'], ['(', 'punct']],
      [['    c', 'var'], ['.', 'punct'], ['var', 'var'], ['.', 'punct'], ['db', 'var'], [', ', 'punct'], ['sms', 'var'], ['.', 'punct'], ['data', 'var'], [');', 'punct']],
      [['  return', 'kw'], [' c', 'var'], ['.', 'punct'], ['json', 'fn'], ['(', 'punct'], ['entry', 'var'], [');', 'punct']],
      [['});', 'punct']],
    ],
    caption: ['Bank SMS in, ledger entry out', 'Hono route on Cloudflare Workers:', 'Zod check, then a D1 write.'],
  }),
};

const SNAKE = 'dist/snake.svg';
if (existsSync(SNAKE)) {
  const svg = await readFile(SNAKE, 'utf8');
  if (/viewBox="[-\d.]+ [-\d.]+ [\d.]+ [\d.]+"/.test(svg)) CARDS.snake = (w) => snake(w, { svg, total: data.total });
  else console.warn(`${SNAKE} has no viewBox; keeping the committed snake card`);
}

await mkdir('assets', { recursive: true });
for (const [name, build] of Object.entries(CARDS)) {
  await writeFile(`assets/${name}-dark.svg`, build(DESKTOP));
  await writeFile(`assets/${name}-mobile-dark.svg`, build(PHONE));
  console.log(`ok ${name}`);
}
