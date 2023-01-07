module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json"
  },
  plugins: ['@typescript-eslint', "deprecation"],
  root: true,
  ignorePatterns: ["test/*", "dist/*", "node_modules/*", "examples/*"],
  rules: {
    "deprecation/deprecation": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-interface": "off"
  }

};