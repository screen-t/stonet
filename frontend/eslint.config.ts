// import js from "@eslint/js";
// import reactHooks from "eslint-plugin-react-hooks";
// import reactRefresh from "eslint-plugin-react-refresh";
// import tsPlugin from "@typescript-eslint/eslint-plugin";

// // cast the whole config to any
// const eslintConfig: any = {
//   ignorePatterns: ["dist"],
//   extends: [
//     js.configs.recommended,
//     "plugin:@typescript-eslint/recommended",
//     "plugin:react-hooks/recommended",
//   ],
//   parser: "@typescript-eslint/parser",
//   parserOptions: {
//     ecmaVersion: 2020,
//     sourceType: "module",
//     ecmaFeatures: { jsx: true },
//   },
//   env: {
//     browser: true,
//   },
//   plugins: {
//     "react-hooks": reactHooks,
//     "react-refresh": reactRefresh,
//     "@typescript-eslint": tsPlugin,
//   },
//   rules: {
//     ...reactHooks.configs.recommended.rules,
//     "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
//     "@typescript-eslint/no-unused-vars": "off",
//   },
// };

// export default eslintConfig;

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  // Ignore dist folder
  {
    ignores: ["dist"],
  },

  // TypeScript + React rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: { ecmaVersion: 2020, sourceType: "module", ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];