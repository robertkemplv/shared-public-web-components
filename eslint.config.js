// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

const tsRules = (prefix) => ({
  '@angular-eslint/directive-selector': [
    'error',
    { type: 'attribute', prefix, style: 'camelCase' },
  ],
  '@angular-eslint/component-selector': ['error', { type: 'element', prefix, style: 'kebab-case' }],
  '@angular-eslint/prefer-on-push-component-change-detection': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
});

const tsBase = [
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  angular.configs.tsRecommended,
];

module.exports = defineConfig([
  { ignores: ['dist/', '.angular/', 'node_modules/', 'coverage/', 'out-tsc/'] },
  {
    files: ['projects/web-components/**/*.ts'],
    extends: tsBase,
    processor: angular.processInlineTemplates,
    rules: tsRules('ui'),
  },
  {
    files: ['projects/playground/**/*.ts'],
    extends: tsBase,
    processor: angular.processInlineTemplates,
    rules: tsRules('app'),
  },
  {
    files: ['projects/**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      // uiMenuToggle renders its own bars and aria-label.
      '@angular-eslint/template/elements-content': ['error', { allowList: ['uiMenuToggle'] }],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
    },
  },
]);
