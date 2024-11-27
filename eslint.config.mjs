import _import from "eslint-plugin-import";
import { fixupPluginRules, fixupConfigRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/*", "**/node_modules"],
}, {
    plugins: {
        import: fixupPluginRules(_import),
    },
}, {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],

    rules: {
        "import/no-extraneous-dependencies": ["error", {
            devDependencies: false,
            optionalDependencies: false,
            peerDependencies: false,
        }],

        "import/order": ["error", {
            groups: [["builtin", "external"], ["internal", "parent", "sibling", "index"]],
            "newlines-between": "always",
        }],

        "import/no-cycle": "error",
    },
}, ...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
)).map(config => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
})), {
    files: ["**/*.ts", "**/*.tsx"],

    rules: {
        "@typescript-eslint/no-extra-semi": "error",
        "no-extra-semi": "off",
    },
}, ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
).map(config => ({
    ...config,
    files: ["**/*.js", "**/*.jsx"],
})), {
    files: ["**/*.js", "**/*.jsx"],

    rules: {
        "@typescript-eslint/no-extra-semi": "error",
        "no-extra-semi": "off",
    },
}];