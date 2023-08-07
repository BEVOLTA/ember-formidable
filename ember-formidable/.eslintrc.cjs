module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      ],
    },
  },
  plugins: ['ember', '@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:ember/recommended',
    'prettier',
  ],
  env: {
    browser: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'ember/no-old-shims': 'error',
    'ember/use-ember-data-rfc-395-imports': 0,
    'ember/named-functions-in-promises': [
      2,
      {
        allowSimpleArrowFunction: true,
      },
    ],
    'ember/order-in-components': 0,
    'ember/order-in-controllers': 0,
    'ember/no-observers': 0,
    'ember/closure-actions': 0,
    'ember/no-pointer-down-event-binding': 'off',
    'ember/no-triple-curlies': 'off',
  },
  settings: {
    node: {
      // Honor both extensions when enforcing e.g. `node/no-missing-require`
      tryExtensions: ['.js', '.ts'],
    },
  },
  overrides: [
    // node files
    {
      files: [
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
        'ts/**/*.js',
        './.eslintrc.js',
        './.prettierrc.js',
        './.stylelintrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './lib/*/index.js',
        './server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015,
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:n/recommended'],
      rules: Object.assign(
        {},
        require('eslint-plugin-node').configs.recommended.rules,
        {
          // add your custom rules and overrides for node files here
          'ember/avoid-leaking-state-in-ember-objects': 'off',
        },
      ),
    },

    // test files
    {
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
      excludedFiles: ['tests/dummy/**/*.{js,ts}'],
      env: {
        embertest: true,
      },
    },

    // all TypeScript files
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      env: {
        browser: true,
      },
      plugins: ['ember', '@typescript-eslint', 'prettier'],
      extends: [
        'eslint:recommended',
        'plugin:import/warnings',
        'plugin:import/errors',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'airbnb-typescript/base',
        'plugin:unicorn/recommended',
      ],
      rules: {
        'import/no-extraneous-dependencies': 0,
        'unicorn/prevent-abbreviations': 0,
        'unicorn/no-null': 0,
        'unicorn/no-array-for-each': 0,
        'unicorn/no-useless-undefined': 1,
        '@typescript-eslint/array-type': 2,
        '@typescript-eslint/prefer-readonly': 2,
        '@typescript-eslint/prefer-reduce-type-parameter': 2,
        '@typescript-eslint/prefer-ts-expect-error': 1,
        '@typescript-eslint/no-unused-expressions': 2,
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 2,
        '@typescript-eslint/prefer-nullish-coalescing': 1,
        '@typescript-eslint/lines-between-class-members': 0,
        '@typescript-eslint/ban-ts-comment': 1,
        '@typescript-eslint/indent': 0,
        '@typescript-eslint/unbound-method': 0,
        '@typescript-eslint/comma-dangle': 0,
        '@typescript-eslint/no-unused-vars': [
          2,
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/naming-convention': [
          2,
          { leadingUnderscore: 'allow', trailingUnderscore: 'allow' },
        ],
        '@typescript-eslint/keyword-spacing': 0,
        'unicorn/no-array-reduce': 1,
        'unicorn/no-nested-ternary': 0,
        'unicorn/no-useless-undefined': 1,
        'unicorn/consistent-function-scoping': [
          2,
          {
            checkArrowFunctions: false,
          },
        ],
        'prettier/prettier': 'error',
        'ember/no-old-shims': 'error',
        'ember/named-functions-in-promises': [
          2,
          {
            allowSimpleArrowFunction: true,
          },
        ],
        'ember/order-in-components': 0,
        'ember/order-in-controllers': 0,
        'ember/no-observers': 0,
        'ember/closure-actions': 0,
        'no-undef': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};
