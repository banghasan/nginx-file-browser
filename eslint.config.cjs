const globals = require('globals');

module.exports = [
  {
    ignores: ['js/vendor/**', 'node_modules/**'],
  },
  {
    files: ['js/main.js'],
    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.jquery,
        moment: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
