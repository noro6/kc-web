module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'max-len': 'off',
    'no-continue': 0,
    'linebreak-style': 0,
    'no-param-reassign': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'vue/no-mutating-props': 'off',
    'object-curly-newline': 'off',
    '@typescript-eslint/object-curly-newline': 'off',
    'vue/object-curly-newline': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
