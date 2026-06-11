import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [".next/**", ".vercel/**", "node_modules/**", "out/**"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // React Hooks v7 added stricter rules; ScopeBuddy predates this migration.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/static-components": "off",
    },
  },
];

export default eslintConfig;
