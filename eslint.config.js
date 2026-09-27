import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                draw_canvas: "readonly",
                resizeCanvas: "readonly",
                draw_plane: "readonly",
                draw_dot: "readonly",
                clear_canvas: "readonly",
                clear_dots: "readonly",
            },
        },
        rules: {
            // airbnb rules inlined: eslint-config-airbnb-base and eslint-config-airbnb-flat
            // are incompatible with the latest eslint
            semi: ["error", "always"],
            quotes: ["error", "double", { avoidEscape: true }],
            indent: ["error", 4],
            "no-var": "error",
            "prefer-const": "error",
            eqeqeq: ["error", "always"],
            "no-console": "warn",
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "arrow-body-style": ["error", "as-needed"],
            "object-shorthand": "error",
            "prefer-template": "error",
        },
    },
];
