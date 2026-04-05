// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([

  // 🔹 Configuración para TypeScript (Angular)
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Selectores Angular
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],

      // ❌ Desactivar sugerencia de inject()
      "@angular-eslint/prefer-inject": "off",

      // (opcional) puedes agregar más reglas aquí
      // "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // 🔹 Configuración para templates HTML
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      // ❌ Desactivar regla si te molesta
      "@typescript-eslint/ban-types": "off",
      "no-unused-vars": "off",
    },
  },

]);