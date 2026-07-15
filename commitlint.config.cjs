/**
 * Conventional Commits enforcement — applied to PR titles in CI
 * (.github/workflows/quality.yml) because squash-merge makes the PR title the
 * commit subject on main.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Long dependency-bump titles from dependabot are acceptable.
    'header-max-length': [2, 'always', 120],
  },
};
