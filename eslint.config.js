import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    ignores: [
      "dist/**/*",
      "dist/**",
      "dist"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];
