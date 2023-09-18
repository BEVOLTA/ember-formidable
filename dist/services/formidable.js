import { assert } from '@ember/debug';
import Service from '@ember/service';
import { tracked } from 'tracked-built-ins';

var _class, _descriptor;
function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
let FormidableService = (_class = class FormidableService extends Service {
  constructor(...args) {
    super(...args);
    _initializerDefineProperty(this, "formidableApis", _descriptor, this);
  }
  getFormidableApi(id) {
    const ids = Object.keys(this.formidableApis);
    const getApi = this.formidableApis[id];
    assert(`Your formidable must have an id for your service to work!
         id: ${id}
         available formidables: ${ids.length ? ids.join(',') : 'None'}
        `, !!getApi);
    return getApi();
  }
  getValue(id, field) {
    const {
      getValue
    } = this.getFormidableApi(id);
    return getValue(field);
  }
  getValues(id, fields) {
    const {
      getValue
    } = this.getFormidableApi(id);
    return fields.reduce((acc, field) => {
      acc[field] = getValue(field);
      return acc;
    }, {});
  }
  _register(id, getData) {
    this.formidableApis[id] = getData;
  }
  _unregister(id) {
    if (this.formidableApis[id]) {
      delete this.formidableApis[id];
    }
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "formidableApis", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return {};
  }
})), _class);

export { FormidableService as default };
//# sourceMappingURL=formidable.js.map
