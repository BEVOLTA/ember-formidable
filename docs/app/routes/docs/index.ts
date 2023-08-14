import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service router!: RouterService;

  beforeModel() {
    this.router.replaceWith('docs.quick-start');
  }
}
