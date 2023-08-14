import config from 'docs/config/environment';
import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';

export default class Router extends AddonDocsRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  docsRoute(this, function () {
    this.route('installation');
  });

  this.route('not-found', { path: '/*path' });
});
