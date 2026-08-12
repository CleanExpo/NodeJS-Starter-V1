// eslint-config-next@16 exports flat config natively (no FlatCompat needed)
const { fixupConfigRules } = require("@eslint/compat");
const nextConfig = require("eslint-config-next");

module.exports = [
  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
    ],
  },

  // Next.js core config (flat config format — includes @typescript-eslint plugin).
  // Bridge legacy plugin rule APIs removed by ESLint 10 until upstream plugins
  // publish native support.
  ...fixupConfigRules(nextConfig).map((config) => ({
    ...config,
    files: config.files || ["apps/web/**/*.{js,jsx,ts,tsx}"],
  })),

  // Production code overrides (plugin already registered by nextConfig above)
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Test files - relaxed rules
  {
    files: [
      "apps/web/**/__tests__/**/*.{ts,tsx}",
      "apps/web/**/*.test.{ts,tsx}",
      "apps/web/**/*.spec.{ts,tsx}",
      "apps/web/**/tests/**/*.{ts,tsx}",
      "apps/web/**/e2e/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
