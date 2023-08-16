'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            'ember-source': '~4.4.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      embroiderSafe({
        name: 'embroider-safe 4.8.0',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
            '@embroider/core': '2.1.2-unstable.3a9d8ad',
            '@embroider/compat': '2.1.2-unstable.3a9d8ad',
            '@embroider/webpack': '2.1.2-unstable.3a9d8ad',
          },
        },
      }),
      embroiderOptimized({
        name: 'embroider-optimized 4.8.0',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
            '@embroider/core': '2.1.2-unstable.3a9d8ad',
            '@embroider/compat': '2.1.2-unstable.3a9d8ad',
            '@embroider/webpack': '2.1.2-unstable.3a9d8ad',
          },
        },
      }),
      embroiderOptimized({
        name: 'embroider-optimized release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            '@embroider/core': '2.1.2-unstable.3a9d8ad',
            '@embroider/compat': '2.1.2-unstable.3a9d8ad',
            '@embroider/webpack': '2.1.2-unstable.3a9d8ad',
          },
        },
      }),
    ],
  };
};
