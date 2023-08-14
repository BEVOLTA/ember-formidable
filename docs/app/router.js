import config from 'docs/config/environment';
import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';

export default class Router extends AddonDocsRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  docsRoute(this, function () {
    this.route('quick-start');
    this.route('usage');
    this.route('register-inputs');
    this.route('formidable');
    this.route('update-events');
    this.route('reset');
    this.route('get-set');
    this.route('states');
    this.route('validation');

    this.route('examples', function () {
      this.route('basic-example');
      this.route('model');
      this.route('custom-inputs');
      this.route('custom-validation');
      this.route('native-validation');
    });
  });

  this.route('not-found', { path: '/*path' });
});
