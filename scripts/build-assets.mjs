// Builds every profile card into assets/, twice: <name>-dark.svg for wide
// screens and <name>-mobile-dark.svg for phones. Only the dark look is built:
// the profile stays dark for every visitor. Run by
// .github/workflows/profile-assets.yml once a day; locally run it with
// GITHUB_TOKEN=$(gh auth token) node scripts/build-assets.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { DESKTOP, PHONE, about, activity, hero, highlights, languages, projects } from './cards.mjs';
import { loadProfile } from './data.mjs';
import { buildStackCard } from './stack-card.mjs';

const token = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN;
if (!token) throw new Error('Set PROFILE_TOKEN or GITHUB_TOKEN');

const FEATURED = ['yojahny55/claude-wp-builder', 'yojahny55/ix-wp-envsync'];
// Shorter, cleaner copy than the repos' own descriptions.
const DESCRIPTIONS = {
  'claude-wp-builder': 'Claude Code plugin that turns an approved HTML demo into a custom WordPress theme.',
  'ix-wp-envsync': 'Syncs a WordPress site between local, staging and production, with rollback.',
};

const data = await loadProfile({ login: 'Lacho00', featured: FEATURED, contributed: FEATURED, token, ownerToken: Boolean(process.env.PROFILE_TOKEN) });
console.log(`token: ${process.env.PROFILE_TOKEN ? 'PROFILE_TOKEN' : 'GITHUB_TOKEN'}, repos: ${data.repoCount}, languages: ${data.langs.map((l) => l.name).join(', ')}`);

const CARDS = {
  hero: (w) => hero(w, {
    avatar: data.avatar,
    handle: 'lacho00',
    name: 'Lacho',
    headline: 'WordPress & WooCommerce developer · AI tooling',
    langs: data.langs.slice(0, 4).map((l) => l.name),
  }),
  about: (w) => about(w, {
    headline: 'I build custom WordPress themes and WooCommerce stores, and the tools behind them.',
    cta: 'open to WordPress & automation work',
  }),
  numbers: (w) => highlights(w, {
    title: 'By the numbers',
    items: [['27', 'WordPress sites built or run'], ['1,000+', 'commits since late 2025'], ['479', 'commits to claude-wp-builder']],
  }),
  craft: (w) => highlights(w, {
    title: 'What I do',
    items: [['WooCommerce', '11 online stores'], ['Custom themes', '9 from scratch\nTailwind + ACF'], ['Page builders', 'Elementor (17)\nDivi, WPBakery'], ['Multilingual', 'Polylang & WPML\n8 sites']],
  }),
  stack: (w) => languages(w, { langs: data.langs, note: 'Share across my repositories, each one weighted equally' }),
  tools: (w) => buildStackCard(w),
  projects: (w) => projects(w, {
    repos: data.repos.map((r) => ({ ...r, description: DESCRIPTIONS[r.name] ?? r.description, role: 'Contributor' })),
  }),
  heatmap: (w) => activity(w, { weeks: data.weeks, total: data.total }),
};

await mkdir('assets', { recursive: true });
for (const [name, build] of Object.entries(CARDS)) {
  await writeFile(`assets/${name}-dark.svg`, build(DESKTOP));
  await writeFile(`assets/${name}-mobile-dark.svg`, build(PHONE));
  console.log(`ok ${name}`);
}
