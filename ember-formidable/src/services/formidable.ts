import { tracked } from 'tracked-built-ins';

import Service from '@ember/service';

export default class FormidableService extends Service {
  @tracked formidableApis: Record<string, any> = {};

  register(id: string, getData: () => any) {
    this.formidableApis[id] = getData;
  }

  unregister(id: string) {
    if (this.formidableApis[id]) {
      delete this.formidableApis[id];
    }
  }

  getFormidableApi(id: string) {
    if (!this.formidableApis[id]) {
      throw new Error(
        `Your formidable must have an id for your service to work!
         id: ${id}
         available formidables: ${Object.keys(this.formidableApis).join(',')}
        `,
      );
    }
    return this.formidableApis[id]();
  }
}

declare module '@ember/service' {
  interface Registry {
    formidable: FormidableService;
  }
}
