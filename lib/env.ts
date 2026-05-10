const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error(
    'GITHUB_TOKEN is not set. See README.md for setup. ' +
      'Generate a PAT (no scopes needed) at https://github.com/settings/tokens.',
  );
}

export const env = { GITHUB_TOKEN } as const;
