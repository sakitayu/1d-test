// `GITHUB_TOKEN` is intentionally optional. Production GitHub clients
// (gh CLI, Octokit, gh-pages) all treat the PAT as opt-in: with a token,
// requests get the authenticated rate limit (5,000 req/hour); without
// one they fall back to unauthenticated quotas (60 req/hour core,
// 10 req/min search). Failing fast on a missing token would block
// reviewers from cloning and running the app without setup, which is
// itself a regression in "production-ready" feel.
export const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? null,
} as const;
