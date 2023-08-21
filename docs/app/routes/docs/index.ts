import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

export default class ApplicationRoute extends Route {
  @service router!: RouterService;

  beforeModel() {
    this.router.replaceWith('docs.quick-start');
  }
}
