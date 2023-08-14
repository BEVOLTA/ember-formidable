import { tracked } from 'tracked-built-ins';

import Service from '@ember/service';

import { FormidableApi, GenericObject } from '../';

export default class FormidableService extends Service {
  @tracked formidableApis: Record<string, any> = {};

  getFormidableApi(id: string): FormidableApi {
    if (!this.formidableApis[id]) {
      const ids = Object.keys(this.formidableApis);
      throw new Error(
        `Your formidable must have an id for your service to work!
         id: ${id}
         available formidables: ${ids.length ? ids.join(',') : 'None'}
        `,
      );
    }
    return this.formidableApis[id]();
  }

  getValue(id: string, field: string): any {
    const { getValue } = this.getFormidableApi(id);
    return getValue(field);
  }

  getValues(id: string, fields: string[]): GenericObject {
    const { getValue } = this.getFormidableApi(id);
    return fields.reduce((acc: Record<string, unknown>, field) => {
      acc[field] = getValue(field);
      return acc;
    }, {});
  }

  _register(id: string, getData: () => any): void {
    this.formidableApis[id] = getData;
  }

  _unregister(id: string): void {
    if (this.formidableApis[id]) {
      delete this.formidableApis[id];
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    formidable: FormidableService;
  }
}
