<<<<<<< HEAD
// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  ignorePatterns: ["apps/**", "packages/**"],
  extends: ["@repo/eslint-config/library.js"],
=======
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js"],
>>>>>>> dc9e37d (database-change)
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
