export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['types', 'engine', 'ui', 'ci', 'docs', 'deps'],
    ],
  },
};
