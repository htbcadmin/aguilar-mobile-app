// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // react-hooks/immutability (part of the React Compiler rule set that
    // `eslint-config-expo` enables) doesn't know about Reanimated's
    // `useSharedValue` — it's a UI-thread-synced ref meant to be mutated via
    // `.value =` (see AGENTS.md §5: Reanimated is this project's mandated
    // animation library), not plain React state. The rule flags every such
    // mutation as an immutability violation; there's no per-hook allowlist
    // in the plugin to carve it out instead. Tracked upstream between
    // react-native-reanimated and the React Compiler ESLint rules.
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
]);
