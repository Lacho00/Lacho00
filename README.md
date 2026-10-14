# Hi, I'm Lacho

**WordPress & WooCommerce developer.** I build custom themes and online stores for an agency, and I write the tooling that makes those builds faster: Claude Code plugins, sync tools and Telegram bots.

- 18 client sites shipped or maintained over the past year: WooCommerce stores, bilingual corporate sites, catalogs.
- Custom themes with Tailwind, ACF/SCF fields, Gutenberg blocks, custom post types and REST endpoints.
- Multilingual setups with Polylang and WPML, SEO with Rank Math, forms with Contact Form 7.
- Lately: automating the WordPress workflow with AI agents, from design to theme to audit.

## Featured work

### [claude-wp-builder](https://github.com/yojahny55/claude-wp-builder) · contributor
Claude Code plugin that turns an approved HTML demo into a custom WordPress theme: ACF/SCF fields, bilingual content, header and footer, seeding, and a full site audit (security, SEO, accessibility, performance, AI-agent readiness).
I wrote over half of the commits, mainly the test suite, the audit agents, and the commands and skills.

### [ix-wp-envsync](https://github.com/yojahny55/ix-wp-envsync) · contributor
WordPress plugin that syncs a site between local, staging and production. It previews a three-way diff, pushes back only your changes, lets production win on conflict, and can roll back a bad push.
I worked on the sync engine and on hardening the remote side: signed sessions, per-request nonces, an atomic push lock and a symlink guard.

### figma-html-loop · contributor (private)
A loop that turns a Figma frame into a pixel-close HTML demo. It scores each pass with image metrics and a vision-model judge. I added checks for contrast, touch-target size, placeholder data, icon fonts and SVG rendering, plus a cross-engine pass in Firefox.

### issue-bot · personal (private)
Telegram bot for site maintenance. You describe an issue, it agrees a plan with you in the chat, applies the fix with Claude Code, and sends back a before/after HTML report. Built with Node 22, grammY and the MCP SDK, with a command-policy hook that limits what the agent may run.

### divisas-bot · personal (private)
Personal finance ledger. It turns bank SMS notifications into transactions, with idempotent ingest, transfer linking and reconciliation. Built with TypeScript on Cloudflare Workers, Hono, D1 and Drizzle, and driven from Telegram.

## Stack

**Daily:** PHP · WordPress · WooCommerce · JavaScript · Tailwind CSS · HTML/CSS · ACF/SCF · Polylang/WPML · WP-CLI

**Also:** TypeScript · Node.js · Cloudflare Workers · Supabase · Python · Claude Code / MCP

## Activity

<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/heatmap?username=Lacho00&theme=aurora&style=snake&mode=light" />
  <img src="https://www.gitskins.com/api/section/heatmap?username=Lacho00&theme=aurora&style=snake&mode=dark" width="100%" alt="Lacho's contribution graph" />
</picture>
