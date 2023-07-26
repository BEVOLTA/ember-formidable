import { tracked } from 'tracked-built-ins';

import Service from '@ember/service';

export default class FormidableService extends Service {
  @tracked formidableApis: Record<string, any> = {};

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

  getValue(id: string, field: string) {
    const { getValue } = this.getFormidableApi(id);
    return getValue(field);
  }

  getValues(id: string, fields: string[]) {
    const { getValue } = this.getFormidableApi(id);
    return fields.reduce((acc: Record<string, unknown>, field) => {
      acc[field] = getValue(field);
      return acc;
    }, {});
  }

  _register(id: string, getData: () => any) {
    this.formidableApis[id] = getData;
  }

  _unregister(id: string) {
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
