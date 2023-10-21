/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options & import("@ianvs/prettier-plugin-sort-imports").PluginConfig} */
const config = {
  plugins: [
    "prettier-plugin-tailwindcss",
    "@ianvs/prettier-plugin-sort-imports",
  ],
  importOrder: [
    "<BUILTIN_MODULES>",
    "<THIRD_PARTY_MODULES>",
    "",
    "^~[/]server[/]",
    "^~[/]lib[/]",
    "",
    "^react-icons[/]",
    "^~[/]components[/]",
    "",
    "^.[/]",
  ],
};

export default config;
