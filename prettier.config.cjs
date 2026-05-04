/** @type {import("prettier").Config} */
// Shared formatting keeps docs, CSS, config, and TypeScript diffs mechanical so
// code reviews can focus on behavior.
module.exports = {
  printWidth: 80,
  semi: true,
  trailingComma: "all",
};
