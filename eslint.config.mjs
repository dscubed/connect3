import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

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
];

export default eslintConfig;
