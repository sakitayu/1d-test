// Vitest does not load `.env.local` (Next.js excludes it under NODE_ENV=test).
// Tests mock the GitHub API, so this dummy value never goes over the network —
// it exists only so `lib/env.ts`'s fail-fast validation passes during test runs.
// `??=` keeps a real CI/local override (e.g. `secrets.GITHUB_TOKEN`) intact.
process.env.GITHUB_TOKEN ??= 'test-dummy-not-used';

import '@testing-library/jest-dom/vitest';
