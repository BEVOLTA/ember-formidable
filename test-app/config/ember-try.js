'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    usePnpm: true,
    command: 'pnpm turbo run test',
    buildManagerOptions() {
      return ['--ignore-scripts', '--no-frozen-lockfile'];
    },
    scenarios: [
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-5.0',
        npm: {
          devDependencies: {
            'ember-source': '~5.0.0',
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
      embroiderSafe({
        name: 'ember-lts-4.12 + embroider-safe',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      }),
      embroiderSafe({
        name: 'ember-lts-5.0 + embroider-safe',
        npm: {
          devDependencies: {
            'ember-source': '~5.0.0',
          },
        },
      }),
      embroiderOptimized({
        name: 'ember-lts-4.12 + embroider-optimized',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      }),
      embroiderOptimized({
        name: 'ember-lts-5.0 + embroider-optimized',
        npm: {
          devDependencies: {
            'ember-source': '~5.0.0',
          },
        },
      }),
      embroiderOptimized({
        name: 'ember-release + embroider-optimized',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      }),
    ],
  };
};
