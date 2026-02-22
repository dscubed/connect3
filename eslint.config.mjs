import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const sourceFiles = ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"];
const nextConfigs = compat.extends("eslint-config-next");
const configsWithFiles = nextConfigs.map((c) => ({
  ...c,
  files: c.files ?? sourceFiles,
}));

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", "build/**"] },
  ...configsWithFiles,
  // TypeScript: define @typescript-eslint rules so disable comments work and Next.js build passes
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "@typescript-eslint": tsPlugin },
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
];

export default eslintConfig;
