import { assert } from '@ember/debug';
import Service from '@ember/service';

import { tracked } from 'tracked-built-ins';

import type { FormidableApi } from '../';
import type { GenericObject } from '../types';

type GetApiFn = () => FormidableApi;
export default class FormidableService extends Service {
  @tracked formidableApis: Record<string, GetApiFn> = {};

  getFormidableApi(id: string): FormidableApi {
    const ids = Object.keys(this.formidableApis);
    const getApi = this.formidableApis[id];

    assert(
      `Your formidable must have an id for your service to work!
         id: ${id}
         available formidables: ${ids.length ? ids.join(',') : 'None'}
        `,
      !!getApi,
    );

    return getApi();
  }

  getValue(id: string, field: string): unknown {
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

  _register(id: string, getData: GetApiFn): void {
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
