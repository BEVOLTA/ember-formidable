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
        name: 'embroider-safe-4.8.0',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
            '@embroider/core': '3.0.0',
            '@embroider/compat': '3.0.0',
            '@embroider/webpack': '3.0.0',
          },
        },
      }),
      embroiderOptimized({
        name: 'embroider-optimized-4.8.0',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
            '@embroider/core': '3.0.0',
            '@embroider/compat': '3.0.0',
            '@embroider/webpack': '3.0.0',
          },
        },
      }),
      embroiderOptimized({
        name: 'embroider-optimized-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            '@embroider/core': '3.0.0',
            '@embroider/compat': '3.0.0',
            '@embroider/webpack': '3.0.0',
          },
        },
      }),
    ],
  };
};
