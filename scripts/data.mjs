// Reads what the profile cards need from the GitHub GraphQL API: avatar,
// contribution calendar, language shares and the featured public repos.
// PROFILE_TOKEN (a read-only token of the profile owner) lets the language
// shares include private repositories; without it only public data is read.

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

const QUERY = `query($login: String!) {
  user(login: $login) {
    avatarUrl(size: 200)
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { weekday contributionLevel } }
      }
    }
  }
}`;

// A fine-grained token only lists private repositories through viewer, so
// the owner's token reads them there; any other token reads public ones.
const REPOS = (viewer) => `query${viewer ? '' : '($login: String!)'} {
  owner: ${viewer ? 'viewer' : 'user(login: $login)'} {
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
      nodes { languages(first: 20) { edges { size node { name } } } }
    }
  }
}`;

const REPO = `query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name description stargazerCount
    primaryLanguage { name }
    languages(first: 20) { edges { size node { name } } }
    repositoryTopics(first: 10) { nodes { topic { name } } }
  }
}`;

async function gql(token, query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30_000),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub API: ${JSON.stringify(json.errors ?? json.message)}`);
  return json.data;
}

// Each repository counts once, split by its own language bytes, so one large
// repo cannot swamp the rest.
function languageShares(repos, top) {
  const weight = {};
  for (const edges of repos) {
    const total = edges.reduce((s, e) => s + e.size, 0);
    if (!total) continue;
    for (const e of edges) weight[e.node.name] = (weight[e.node.name] ?? 0) + e.size / total;
  }
  const sum = Object.values(weight).reduce((a, b) => a + b, 0);
  return Object.entries(weight)
    .map(([name, w]) => ({ name, share: (100 * w) / sum }))
    .sort((a, b) => b.share - a.share)
    .slice(0, top);
}

export async function loadProfile({ login, featured, contributed, token, ownerToken }) {
  const { user } = await gql(token, QUERY, { login });
  const { owner } = await gql(token, REPOS(ownerToken), ownerToken ? {} : { login });
  const avatar = await fetch(user.avatarUrl, { signal: AbortSignal.timeout(30_000) });
  const avatarData = `data:${avatar.headers.get('content-type')};base64,${Buffer.from(await avatar.arrayBuffer()).toString('base64')}`;

  const repos = [];
  for (const full of featured) {
    const [owner, name] = full.split('/');
    const { repository: r } = await gql(token, REPO, { owner, name });
    repos.push(r);
  }
  const edges = owner.repositories.nodes.map((n) => n.languages.edges);
  for (const full of contributed) {
    const r = repos.find((x) => full.endsWith(`/${x.name}`));
    if (r) edges.push(r.languages.edges);
  }

  const cal = user.contributionsCollection.contributionCalendar;
  return {
    avatar: avatarData,
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) => w.contributionDays.map((d) => ({ weekday: d.weekday, level: LEVEL[d.contributionLevel] }))),
    repoCount: owner.repositories.nodes.length,
    langs: languageShares(edges, 6),
    repos: repos.map((r) => ({
      name: r.name,
      description: r.description ?? '',
      stars: r.stargazerCount,
      language: r.primaryLanguage?.name ?? '',
      topics: r.repositoryTopics.nodes.map((n) => n.topic.name),
    })),
  };
}
