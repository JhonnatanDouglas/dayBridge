const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'coverage/**',
      'dist/**',
      'dist-nativewind-check/**',
      'dist-nativewind-check-2/**',
    ],
  },
]);
