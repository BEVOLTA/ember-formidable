import { buildTask } from 'ember-concurrency/-private/async-arrow-runtime';
import { setComponentTemplate } from '@ember/component';
import { precompileTemplate } from '@ember/template-compilation';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import 'ember-concurrency';
import { modifier } from 'ember-modifier';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _set from 'lodash/set';
import _uniqBy from 'lodash/uniqBy';
import _unset from 'lodash/unset';
import { TrackedObject, tracked } from 'tracked-built-ins';
import { formatValue, inputUtils, valueIfChecked } from '../-private/utils.js';

var _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
const DATA_NAME = 'data-formidable-name';
const DATA_REQUIRED = 'data-formidable-required';
const DATA_DISABLED = 'data-formidable-disabled';
const UNREGISTERED_ATTRIBUTE = 'data-formidable-unregistered';
let Formidable = setComponentTemplate(precompileTemplate(`
    {{yield this.api this.parsedValues}}
  `, {
  strictMode: true
}), (_class = class Formidable extends Component {
  // --- STATES

  get isSubmitting() {
    return this.submit.isRunning;
  }
  get isValid() {
    return _isEmpty(this.errors);
  }
  get isValidating() {
    return this.validate.isRunning;
  }
  get isInvalid() {
    return !this.isValid;
  }
  get invalidFields() {
    return Object.keys(this.errors).reduce((invalid, key) => {
      return _set(invalid, key, true);
    }, {});
  }
  get errorMessages() {
    return Object.values(this.errors).flat()
    // empty errors can happen!
    .filter(err => typeof err === 'object' && !_isEmpty(err)).map(err => {
      return err?.message;
    });
  }
  get isDirty() {
    return !this.isPristine;
  }
  get isPristine() {
    return _isEmpty(this.dirtyFields);
  }
  get handleOn() {
    return this.args.handleOn ?? ['onSubmit'];
  }
  get validateOn() {
    return this.args.validateOn ?? ['onBlur', 'onSubmit'];
  }
  get revalidateOn() {
    return this.args.revalidateOn ?? ['onChange', 'onSubmit'];
  }
  get parsedValues() {
    return Object.entries(this.values).reduce((obj, [key, value]) => {
      return _set(obj, key, formatValue(value, this.parsers[key]));
    }, {});
  }
  get api() {
    return {
      values: this.parsedValues,
      setValue: async (field, value, context) => await this.setValue.perform(field, value, context),
      getValue: this.getValue,
      getValues: this.getValues,
      getDefaultValue: this.getDefaultValue,
      getFieldState: this.getFieldState,
      register: this.register,
      unregister: this.unregister,
      onSubmit: async e => await this.submit.perform(e),
      validate: async field => await this.validate.perform(field),
      errors: this.errors,
      errorMessages: this.errorMessages,
      getError: this.getError,
      setError: this.setError,
      clearError: this.clearError,
      clearErrors: this.clearErrors,
      rollback: this.rollback,
      rollbackInvalid: async context => await this.rollbackInvalid.perform(context),
      setFocus: async (name, context) => await this.setFocus.perform(name, context),
      defaultValues: this.rollbackValues,
      isSubmitted: this.isSubmitted,
      isSubmitting: this.isSubmitting,
      isSubmitSuccessful: this.isSubmitSuccessful,
      submitCount: this.submitCount,
      isValid: this.isValid,
      isInvalid: this.isInvalid,
      isValidating: this.isValidating,
      invalidFields: this.invalidFields,
      isDirty: this.isDirty,
      dirtyFields: this.dirtyFields,
      isPristine: this.isPristine
    };
  }
  constructor(owner, args) {
    super(owner, args);
    _initializerDefineProperty(this, "formidable", _descriptor, this);
    // --- VALUES
    _defineProperty(this, "values", new TrackedObject(_cloneDeep(this.args.values ?? {})));
    // --- SUBMIT
    _initializerDefineProperty(this, "isSubmitSuccessful", _descriptor2, this);
    _initializerDefineProperty(this, "isSubmitted", _descriptor3, this);
    _initializerDefineProperty(this, "submitCount", _descriptor4, this);
    _initializerDefineProperty(this, "nativeValidations", _descriptor5, this);
    // --- ERRORS
    _defineProperty(this, "errors", new TrackedObject({}));
    // --- DIRTY FIELDS
    _defineProperty(this, "dirtyFields", new TrackedObject({}));
    // --- PARSER
    _defineProperty(this, "parsers", {});
    _defineProperty(this, "validator", this.args.validator);
    // --- ROLLBACK
    _defineProperty(this, "rollbackValues", new TrackedObject(_cloneDeep(this.args.values ?? {})));
    // --- STATES HANDLERS
    _defineProperty(this, "rollback", (field, {
      keepError,
      keepDirty,
      defaultValue
    } = {}) => {
      if (field) {
        this.values[field] = defaultValue ?? this.rollbackValues[field] ?? undefined;
        if (defaultValue) {
          this.rollbackValues[field] = defaultValue;
        }
        if (!keepError) {
          _unset(this.errors, field);
        }
        if (!keepDirty) {
          _unset(this.dirtyFields, field);
        }
      } else {
        this.values = new TrackedObject(_cloneDeep(this.rollbackValues));
        if (!keepError) {
          this.errors = new TrackedObject({});
        }
        if (!keepDirty) {
          this.dirtyFields = new TrackedObject({});
        }
        this.isSubmitted = false;
      }
    });
    _defineProperty(this, "getFieldState", name => {
      const isDirty = this.dirtyFields[name] ?? false;
      const isPristine = !isDirty;
      const error = this.errors[name];
      const isInvalid = !_isEmpty(error);
      return {
        isDirty,
        isPristine,
        isInvalid,
        error
      };
    });
    _defineProperty(this, "getError", field => {
      return get(this.errors, field);
    });
    _defineProperty(this, "getValue", field => {
      return get(this.parsedValues, field);
    });
    _defineProperty(this, "getValues", () => {
      return this.parsedValues;
    });
    _defineProperty(this, "getDefaultValue", field => {
      return get(this.rollbackValues, field);
    });
    _defineProperty(this, "setError", (field, error) => {
      if (typeof error === 'string') {
        this.errors = _set(this.errors, field, _uniqBy([...(get(this.errors, field) ?? []), {
          message: error,
          type: 'custom',
          value: this.getValue(field)
        }], 'type'));
      } else {
        this.errors = _set(this.errors, field, _uniqBy([...(get(this.errors, field) ?? []), {
          message: error.message,
          type: error.type ?? 'custom',
          value: error.value ?? this.getValue(field)
        }], 'type'));
      }
    });
    _defineProperty(this, "clearError", field => {
      if (get(this.errors, field)) {
        _unset(this.errors, field);
      }
    });
    _defineProperty(this, "clearErrors", () => {
      this.errors = new TrackedObject({});
    });
    _defineProperty(this, "unregister", (field, {
      keepError,
      keepDirty,
      keepValue,
      keepDefaultValue
    } = {}) => {
      const element = this.getDOMElement(field);
      assert('FORMIDABLE - No input element found to unregister', !!element);
      const {
        setAttribute
      } = inputUtils(element);
      setAttribute(UNREGISTERED_ATTRIBUTE, true);
      if (!keepError) {
        _unset(this.errors, field);
      }
      if (!keepDirty) {
        _unset(this.dirtyFields, field);
      }
      if (!keepValue) {
        _unset(this.values, field);
      }
      if (!keepDefaultValue) {
        _unset(this.rollbackValues, field);
      }
    });
    _defineProperty(this, "rollbackInvalid", buildTask(() => ({
      context: this,
      generator: function* (context = {}) {
        yield this.validate.perform();
        for (const field of Object.keys(this.invalidFields)) {
          this.rollback(field, context);
        }
      }
    }), null, "rollbackInvalid", null));
    _defineProperty(this, "setValue", buildTask(() => ({
      context: this,
      generator: function* (field, value, {
        shouldValidate,
        shouldDirty
      } = {}) {
        this.values[field] = value;
        if (shouldDirty) {
          this.dirtyField(field);
        }
        if (shouldValidate) {
          yield this.validate.perform(field);
        }
      }
    }), null, "setValue", null));
    _defineProperty(this, "setFocus", buildTask(() => ({
      context: this,
      generator: function* (field, {
        shouldValidate,
        shouldDirty
      } = {}) {
        this.getDOMElement(field)?.focus();
        if (shouldDirty) {
          this.dirtyField(field);
        }
        if (shouldValidate) {
          yield this.validate.perform(field);
        }
      }
    }), null, "setFocus", null));
    // --- TASKS
    _defineProperty(this, "validate", buildTask(() => ({
      context: this,
      generator: function* (field) {
        if (!this.validator) {
          return;
        }
        const validation = yield this.validator(this.parsedValues, {
          ...this.args.validatorOptions,
          shouldUseNativeValidation: this.args.shouldUseNativeValidation,
          nativeValidations: this.nativeValidations
        });
        if (field) {
          this.errors = _set(this.errors, field, get(validation, field));
        } else {
          this.errors = new TrackedObject(validation);
        }
      }
    }), null, "validate", null));
    _defineProperty(this, "submit", buildTask(() => ({
      context: this,
      generator: function* (event) {
        try {
          this.isSubmitted = true;
          event?.preventDefault();
          if (this.shouldValidateOrRevalidate('onSubmit')) {
            yield this.validate.perform();
          }
          this.isSubmitSuccessful = this.isValid;
          if (!this.isSubmitSuccessful) {
            return;
          }
          if (this.args.onSubmit) {
            return yield this.args.onSubmit(this.parsedValues, this.api, event);
          }
          if (this.handleOn.includes('onSubmit') && this.args.handler) {
            yield this.args.handler(this.parsedValues, this.api, event, 'onSubmit');
          }
        } finally {
          this.submitCount += 1;
        }
      }
    }), null, "submit", null));
    _defineProperty(this, "register", modifier((input, [_name] = [undefined], {
      disabled,
      required,
      maxLength,
      minLength,
      max,
      min,
      pattern,
      valueAsBoolean,
      valueAsNumber,
      valueAsDate,
      valueFormat,
      onChange,
      onBlur,
      onFocus
    } = {}) => {
      const {
        setAttribute,
        isFormInput,
        isInput,
        isCheckbox,
        isRadio,
        isTextarea,
        isSelect,
        name: attrName
      } = inputUtils(input);
      const name = _name ?? attrName;
      assert(`FORMIDABLE - Your element must have a name ; either specify it in the register parameters, or assign it directly to the element.
        Examples:
        <input name="foo" {{api.register}} />
        OR
        <input {{api.register "foo"}} />
      `, !!name);

      // PARSERS
      this.parsers[name] = {
        valueAsNumber,
        valueAsDate,
        valueAsBoolean,
        valueFormat
      };
      if (!isFormInput) {
        setAttribute(DATA_NAME, name);
        setAttribute(DATA_DISABLED, disabled);
        setAttribute(DATA_REQUIRED, required);
        return;
      }

      // ATTRIBUTES

      if (isInput && input.type === 'number' || input.type === 'time') {
        setAttribute('min', min);
        setAttribute('max', max);
      } else if (isInput || isTextarea) {
        setAttribute('minlength', minLength);
        setAttribute('maxlength', maxLength);
        if (isInput) {
          const strPattern = typeof pattern === 'string' ? pattern : pattern?.toString();
          setAttribute('pattern', strPattern);
        }
      }
      if (isFormInput) {
        setAttribute('disabled', disabled);
        setAttribute('required', required);
        setAttribute('name', name);
        const value = this.getValue(name);
        if (isRadio || isCheckbox) {
          const checked = Array.isArray(value) ? value.includes(input.value) : input.value === value;
          input.checked = checked;
          setAttribute('aria-checked', checked);
        } else if (isInput || isTextarea) {
          input.value = value ?? '';
        }
      }

      // HANDLERS
      const handleChange = event => this.onChange.perform(name, event, onChange);
      const handleBlur = event => this.onBlur.perform(name, event, onBlur);
      const handleFocus = event => this.onFocus.perform(name, event, onFocus);
      const preventDefault = e => {
        if (!this.args.shouldUseNativeValidation) {
          e.preventDefault();
        }
      };
      this.nativeValidations[name] = {
        required,
        maxLength,
        minLength,
        max,
        min,
        pattern
      };

      // EVENTS

      input.addEventListener(isInput || isSelect || isTextarea ? 'input' : 'change', handleChange);
      input.addEventListener('invalid', preventDefault);
      if (onBlur || this.shouldValidateOrRevalidate('onBlur') || this.handleOn.includes('onBlur')) {
        input.addEventListener('blur', handleBlur);
      }
      if (onFocus || this.shouldValidateOrRevalidate('onFocus') || this.handleOn.includes('onFocus')) {
        input.addEventListener('focusin', handleFocus);
      }
      return () => {
        input.removeEventListener(isInput || isSelect || isTextarea ? 'input' : 'change', handleChange);
        input.removeEventListener('invalid', preventDefault);
        if (onBlur || this.shouldValidateOrRevalidate('onBlur') || this.handleOn.includes('onBlur')) {
          input.removeEventListener('blur', handleBlur);
        }
        if (onFocus || this.shouldValidateOrRevalidate('onFocus') || this.handleOn.includes('onFocus')) {
          input.removeEventListener('focus', handleFocus);
        }
      };
    }));
    _defineProperty(this, "onChange", buildTask(() => ({
      context: this,
      generator: function* (field, event, onChange) {
        assert('FORMIDABLE - No input element found when value got set.', !!event.target);
        yield this.setValue.perform(field, valueIfChecked(event, this.getValue(field), this.getDefaultValue(field)), {
          shouldValidate: this.shouldValidateOrRevalidate('onChange'),
          shouldDirty: true
        });
        if (onChange) {
          return onChange(event, this.api);
        }
        if (this.handleOn.includes('onChange') && this.args.handler) {
          yield this.args.handler(this.parsedValues, this.api, event, 'onChange');
        }
      }
    }), null, "onChange", null));
    _defineProperty(this, "onBlur", buildTask(() => ({
      context: this,
      generator: function* (field, event, onBlur) {
        assert('FORMIDABLE - No input element found when value got set.', !!event.target);
        yield this.setValue.perform(field, valueIfChecked(event, this.getValue(field), this.getDefaultValue(field)), {
          shouldValidate: this.shouldValidateOrRevalidate('onBlur')
        });
        if (onBlur) {
          return onBlur(event, this.api);
        }
        if (this.handleOn.includes('onBlur') && this.args.handler) {
          yield this.args.handler(this.parsedValues, this.api, event, 'onBlur');
        }
      }
    }), null, "onBlur", null));
    _defineProperty(this, "onFocus", buildTask(() => ({
      context: this,
      generator: function* (field, event, onFocus) {
        assert('FORMIDABLE - No input element found when value got set.', !!event.target);
        yield this.setValue.perform(field, valueIfChecked(event, this.getValue(field), this.getDefaultValue(field)), {
          shouldValidate: this.shouldValidateOrRevalidate('onFocus')
        });
        if (onFocus) {
          return onFocus(event, this.api);
        }
        if (this.handleOn.includes('onFocus') && this.args.handler) {
          yield this.args.handler(this.parsedValues, this.api, event, 'onFocus');
        }
      }
    }), null, "onFocus", null));
    if (this.args.serviceId) {
      this.formidable._register(this.args.serviceId, () => this.api);
    }
  }

  // eslint-disable-next-line ember/require-super-in-lifecycle-hooks
  willDestroy() {
    if (this.args.serviceId) {
      this.formidable._unregister(this.args.serviceId);
    }
  }
  dirtyField(field) {
    this.dirtyFields[field] = !_isEqual(get(this.rollbackValues, field), get(this.parsedValues, field));
  }
  shouldValidateOrRevalidate(eventType) {
    return this.submitCount > 0 ? this.revalidateOn.includes(eventType) : this.validateOn.includes(eventType);
  }
  getDOMElement(name) {
    return document.querySelector(`[name="${name}"]`) ?? document.querySelector(`[${DATA_NAME}="${name}"]`);
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "formidable", [inject], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "isSubmitSuccessful", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return undefined;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "isSubmitted", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return false;
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "submitCount", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return 0;
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "nativeValidations", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return {};
  }
}), _applyDecoratedDescriptor(_class.prototype, "api", [cached], Object.getOwnPropertyDescriptor(_class.prototype, "api"), _class.prototype)), _class));

export { Formidable as default };
//# sourceMappingURL=formidable.js.map
