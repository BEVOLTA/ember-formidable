import { restartableTask, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import { modifier } from 'ember-modifier';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import _isNil from 'lodash/isNil';
import _isObject from 'lodash/isObject';
import _set from 'lodash/set';
import _unset from 'lodash/unset';
import { tracked, TrackedObject } from 'tracked-built-ins';

import { assert } from '@ember/debug';
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';
import Component from '@glimmer/component';

import { UnregisterContext } from '../../-private/types';
import FormidableService from '../../services/formidable';

import type {
  UpdateEvents,
  GenericObject,
  FormidableErrors,
  DirtyFields,
  InvalidFields,
  FormatOptions,
  Parser,
  FormidableError,
  RollbackContext,
  SetContext,
  FieldState,
  FormidableApi,
  FormidableArgs,
  RegisterOptions,
} from '../../index';
let Model: Function | undefined;

if (macroCondition(dependencySatisfies('ember-data', '*'))) {
  Model = (importSync('@ember-data/model') as { default: Function }).default;
}

const DATA_NAME = 'data-formidable-name';
const UNREGISTERED_ATTRIBUTE = 'data-formidable-unregistered';

const inputUtils = (input: HTMLInputElement) => {
  return {
    setAttribute: (
      attribute: string,
      value: string | number | undefined | boolean,
    ) => {
      if (_isNil(value) || !`${value}`.trim()) {
        input.removeAttribute(attribute);
      } else {
        input.setAttribute(attribute, `${value}`);
      }
    },
    isFormInput: ['INPUT', 'SELECT', 'TEXTAREA'].includes(input.tagName),
    isInput: input.tagName === 'INPUT',
    isTextarea: input.tagName === 'TEXTAREA',
    isSelect: input.tagName === 'SELECT',
    isCheckbox: input.type === 'checkbox',
    isRadio: input.type === 'radio',
  };
};

const formatValue = (value: any, formatOptions: FormatOptions | undefined) => {
  if (!formatOptions) {
    return value;
  }
  const { valueAsNumber, valueAsDate, valueFormat, valueAsBoolean } =
    formatOptions;

  if (valueFormat) {
    return valueFormat(value);
  }
  if (valueAsNumber) {
    return +value;
  }
  if (valueAsDate) {
    return new Date(value);
  }
  if (valueAsBoolean) {
    return Boolean(value);
  }
  return value;
};

export interface FormidableSignature<
  Values extends GenericObject = GenericObject,
> {
  Element: unknown;
  Args: FormidableArgs<Values>;
  Blocks: {
    default: [parsedValues: Values, api: FormidableApi<Values>];
  };
}

export default class Formidable<
  Values extends GenericObject = GenericObject,
> extends Component<FormidableSignature<Values>> {
  @service formidable!: FormidableService;

  // --- VALUES
  values: Values = this.isModel
    ? this.args.values ?? ({} as Values)
    : (new TrackedObject(this.args.values ?? {}) as Values);

  // --- SUBMIT
  @tracked isSubmitSuccessful: boolean | undefined = undefined;
  @tracked isSubmitted = false;
  @tracked submitCount = 0;

  // --- VALIDATION
  validations: Record<keyof Values, object> = new TrackedObject({}) as Record<
    keyof Values,
    object
  >;

  // --- ERRORS
  errors: FormidableErrors = new TrackedObject({});

  // --- DIRTY FIELDS
  dirtyFields: DirtyFields<Values> = new TrackedObject(
    {},
  ) as DirtyFields<Values>;

  // --- PARSER
  parsers: Parser<Values> = {} as Parser<Values>;

  validator = this.args.validator;

  // --- ROLLBACK
  rollbackValues: Values;

  // --- UTILS
  get isModel() {
    if (!Model) {
      return false;
    }
    return this.args.values instanceof Model;
  }

  // --- STATES
  get isSubmitting(): boolean {
    return taskFor(this.submit).isRunning;
  }

  get isValidating() {
    return taskFor(this.validate).isRunning;
  }

  get isValid() {
    return _isEmpty(this.errors);
  }

  get isInvalid() {
    return !this.isValid;
  }

  get invalidFields(): InvalidFields<Values> {
    return Object.keys(this.errors).reduce(
      (invalid: Record<string, boolean>, key) => {
        return _set(invalid, key, true);
      },
      {},
    ) as InvalidFields<Values>;
  }

  get errorMessages() {
    return Object.values(this.errors)
      .flat()
      .map((err) => err.message);
  }

  get isDirty() {
    return !this.isPristine;
  }

  get isPristine() {
    return _isEmpty(this.dirtyFields);
  }

  get updateEvents(): UpdateEvents[] {
    return this.args.updateEvents ?? ['onSubmit'];
  }

  get parsedValues(): Values {
    if (this.isModel) {
      return this.values;
    } else {
      return Object.entries(this.values).reduce((obj, [key, value]) => {
        return _set(obj, key, formatValue(value, this.parsers[key]));
      }, {}) as Values;
    }
  }

  get api(): FormidableApi<Values> {
    return {
      values: this.parsedValues,
      setValue: (
        key: keyof Values,
        value: string | boolean | undefined,
        context?: SetContext,
      ) => taskFor(this.setValue).perform(key, value, context),
      getValue: this.getValue,
      getValues: this.getValues,
      getFieldState: this.getFieldState,
      register: this.register,
      unregister: this.unregister,
      onSubmit: (e: SubmitEvent) => taskFor(this.submit).perform(e),
      validate: () => taskFor(this.validate).perform(),
      errors: this.errors,
      errorMessages: this.errorMessages,
      setError: this.setError,
      clearError: this.clearError,
      clearErrors: this.clearErrors,
      rollback: this.rollback,
      setFocus: (name: keyof Values, context?: SetContext) =>
        taskFor(this.setFocus).perform(name, context),
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
      isPristine: this.isPristine,
    };
  }

  constructor(owner: any, args: FormidableArgs<Values>) {
    super(owner, args);
    if (this.isModel) {
      const { values = {} as Values } = this.args;
      const rollbackValues: Values = {} as Values;
      (values as Values)['eachAttribute']((key: keyof Values) => {
        const value = get(values, key);
        if (_isObject(value)) {
          rollbackValues[key] = _cloneDeep(value);
        } else {
          rollbackValues[key] = value;
        }
      });
      this.rollbackValues = new TrackedObject(rollbackValues);
    } else {
      this.rollbackValues = new TrackedObject(
        _cloneDeep(this.args.values ?? {}) as Values,
      );
    }
    if (this.args.serviceId) {
      this.formidable._register(this.args.serviceId, () => this.api);
    }
  }

  willDestroy(): void {
    if (this.args.serviceId) {
      this.formidable._unregister(this.args.serviceId);
    }
  }

  // --- STATES HANDLERS

  @action
  rollback(
    name?: keyof Values,
    { keepError, keepDirty, defaultValue }: RollbackContext = {},
  ) {
    if (name) {
      this.values[name] = (defaultValue ??
        this.rollbackValues[name] ??
        undefined) as Values[keyof Values];
      if (!keepError) {
        delete this.errors[name];
      }
      if (!keepDirty) {
        delete this.dirtyFields[name as keyof Values];
      }
    } else {
      if (this.isModel) {
        Object.entries(this.rollbackValues).forEach(([key, value]) => {
          this.values['set'](key, value);
        });
      } else {
        this.values = new TrackedObject(_cloneDeep(this.rollbackValues));
      }

      if (!keepError) {
        this.errors = new TrackedObject({});
      }
      if (!keepDirty) {
        this.dirtyFields = new TrackedObject({}) as DirtyFields<Values>;
      }
      this.isSubmitted = false;
    }
  }

  @action
  getFieldState(name: keyof Values): FieldState {
    const isDirty = this.dirtyFields[name] ?? false;
    const isPristine = !isDirty;
    const error = this.errors[name];
    const isInvalid = !_isEmpty(error);

    return { isDirty, isPristine, isInvalid, error };
  }

  @action
  getValue(key: keyof Values) {
    if (
      this.isModel &&
      this.parsedValues['relationshipFor']?.(key)?.meta?.kind == 'belongsTo'
    ) {
      return this.parsedValues['belongsTo'](key).value();
    }

    return get(this.parsedValues, key);
  }

  @action
  getValues() {
    return this.parsedValues;
  }

  @action
  setError(key: keyof Values, error: string | FormidableError) {
    if (typeof error === 'string') {
      this.errors[key] = [
        ...(this.errors[key] ?? []),
        {
          message: error as string,
          type: 'custom',
          value: this.getValue(key),
        },
      ];
    } else {
      this.errors[key] = [
        ...(this.errors[key] ?? []),
        {
          message: error.message,
          type: error.type ?? 'custom',
          value: error.value ?? this.getValue(key),
        },
      ];
    }
  }

  @action
  clearError(key: keyof Values) {
    if (this.errors[key]) {
      delete this.errors[key];
    }
  }

  @action
  clearErrors() {
    this.errors = new TrackedObject({});
  }

  @action
  unregister(
    name: keyof Values,
    {
      keepError,
      keepDirty,
      keepValue,
      keepDefaultValue,
    }: UnregisterContext = {},
  ) {
    const element = this.getDOMElement(name as string);

    assert('FORMIDABLE - No input element found to unregister', !!element);

    const { setAttribute } = inputUtils(element);
    setAttribute(UNREGISTERED_ATTRIBUTE, true);

    if (!keepError) {
      _unset(this.errors, name);
    }

    if (!keepDirty) {
      _unset(this.dirtyFields, name);
    }

    if (!keepValue) {
      _unset(this.values, name);
    }

    if (!keepDefaultValue) {
      _unset(this.rollbackValues, name);
    }
  }

  @restartableTask
  *setValue(
    key: keyof Values,
    value: string | boolean | undefined,
    { shouldValidate, shouldDirty }: SetContext = {},
  ) {
    if (this.isModel) {
      this.values['set'](key, formatValue(value, this.parsers[key]));
    } else {
      this.values[key] = value as Values[keyof Values];
    }
    if (shouldDirty) {
      this.dirtyFields[key] = true;
    }
    if (shouldValidate) {
      yield taskFor(this.validate).perform(key);
    }
  }

  @restartableTask
  *setFocus(
    name: keyof Values,
    { shouldValidate, shouldDirty }: SetContext = {},
  ) {
    this.getDOMElement(name as string)?.focus();

    if (shouldDirty) {
      this.dirtyFields[name] = true;
    }

    if (shouldValidate) {
      yield taskFor(this.validate).perform(name);
    }
  }

  // --- TASKS
  @restartableTask
  *validate(field?: keyof Values): TaskGenerator<void> {
    if (!this.validator) {
      return;
    }
    const validation: FormidableErrors = yield this.validator(
      this.parsedValues,
      {
        validations: this.validations,
        ...this.args.validatorOptions,
      },
    );

    if (field) {
      this.errors = _set(this.errors, field, get(validation, field));
    } else {
      this.errors = new TrackedObject(validation);
    }
  }

  @restartableTask
  *submit(event: SubmitEvent): TaskGenerator<void> {
    this.isSubmitted = true;
    this.submitCount += 1;

    event.preventDefault();

    if (this.updateEvents.includes('onSubmit')) {
      yield taskFor(this.validate).perform();
    }

    this.isSubmitSuccessful = this.isValid;

    if (!this.isSubmitSuccessful) {
      return;
    }

    if (this.args.onSubmit) {
      return this.args.onSubmit(event, this.api);
    }

    if (this.updateEvents.includes('onSubmit') && this.args.onValuesChanged) {
      this.args.onValuesChanged(this.parsedValues, this.api);
    }
  }

  register = modifier(
    (
      input: HTMLInputElement,
      [name]: [keyof Values],
      {
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
        onFocus,
      }: RegisterOptions,
    ) => {
      const {
        setAttribute,
        isFormInput,
        isInput,
        isCheckbox,
        isRadio,
        isTextarea,
        isSelect,
      } = inputUtils(input);

      // PARSERS
      this.parsers[name] = {
        valueAsNumber,
        valueAsDate,
        valueAsBoolean,
        valueFormat,
      };

      if (!isFormInput) {
        setAttribute(DATA_NAME, name as string);
        return;
      }

      // ATTRIBUTES

      if (isInput && input.type === 'number') {
        setAttribute('min', min);
        setAttribute('max', max);
      } else if (isInput || isTextarea) {
        setAttribute('minlength', minLength);
        setAttribute('maxlength', maxLength);
        setAttribute('disabled', disabled);
        setAttribute('required', required);

        if (isInput) {
          const strPattern =
            typeof pattern === 'string' ? pattern : pattern?.toString();
          setAttribute('pattern', strPattern);
        }
      }

      if (isFormInput) {
        setAttribute('name', name as string);
        const value = this.getValue(name);
        if (isRadio || isCheckbox) {
          input.checked = input.value === value;
        } else if (isInput || isTextarea) {
          input.value = value ?? '';
        }
      }

      // VALIDATIONS
      if (this.args.shouldUseNativeValidation) {
        this.validations[name] = {
          min,
          max,
          minLength,
          maxLength,
          disabled,
          required,
        };
      } // USEFUL?

      // HANDLERS
      const handleChange = (event: Event) => {
        taskFor(this.onChange).perform(name, event, onChange);
      };

      const handleBlur = async (event: Event) => {
        taskFor(this.onBlur).perform(name, event, onBlur);
      };

      const handleFocus = async (event: Event) => {
        taskFor(this.onFocus).perform(name, event, onFocus);
      };

      const preventDefault = (e: Event) => {
        if (!this.args.shouldUseNativeValidation) {
          e.preventDefault();
        }
      };

      // EVENTS

      input.addEventListener(
        isInput || isSelect || isTextarea ? 'input' : 'change',
        handleChange,
      );
      input.addEventListener('invalid', preventDefault);

      if (onBlur || this.updateEvents.includes('onBlur')) {
        input.addEventListener('blur', handleBlur);
      }

      if (onFocus || this.updateEvents.includes('onFocus')) {
        input.addEventListener('focusin', handleFocus);
      }

      return () => {
        input.removeEventListener(
          isInput || isSelect || isTextarea ? 'input' : 'change',
          handleChange,
        );
        input.removeEventListener('invalid', preventDefault);

        if (onBlur || this.updateEvents.includes('onBlur')) {
          input.removeEventListener('blur', handleBlur);
        }
        if (onFocus || this.updateEvents.includes('onFocus')) {
          input.removeEventListener('focus', handleFocus);
        }
      };
    },
  );

  @restartableTask
  *onChange(
    name: keyof Values,
    event: Event,
    onChange?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ) {
    assert(
      'FORMIDABLE - No input element found when value got set.',
      !!event.target,
    );

    yield taskFor(this.setValue).perform(
      name,
      (event.target as HTMLInputElement).value,
      {
        shouldValidate: this.updateEvents.includes('onChange'),
        shouldDirty: true,
      },
    );

    if (onChange) {
      return onChange(event, this.api as FormidableApi<GenericObject>);
    }
    if (this.updateEvents.includes('onChange') && this.args.onValuesChanged) {
      this.args.onValuesChanged(this.parsedValues, this.api);
    }
  }

  @restartableTask
  *onBlur(
    name: keyof Values,
    event: Event,
    onBlur?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ) {
    assert(
      'FORMIDABLE - No input element found when value got set.',
      !!event.target,
    );

    yield taskFor(this.setValue).perform(
      name,
      (event.target as HTMLInputElement).value,
      { shouldValidate: this.updateEvents.includes('onBlur') },
    );
    if (onBlur) {
      return onBlur(event, this.api as FormidableApi<GenericObject>);
    }
    if (this.updateEvents.includes('onBlur') && this.args.onValuesChanged) {
      this.args.onValuesChanged(this.parsedValues, this.api);
    }
  }

  @restartableTask
  *onFocus(
    name: keyof Values,
    event: Event,
    onFocus?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ) {
    assert(
      'FORMIDABLE - No input element found when value got set.',
      !!event.target,
    );

    yield taskFor(this.setValue).perform(
      name,
      (event.target as HTMLInputElement).value,
      { shouldValidate: this.updateEvents.includes('onFocus') },
    );
    if (onFocus) {
      return onFocus(event, this.api as FormidableApi<GenericObject>);
    }

    if (this.updateEvents.includes('onFocus') && this.args.onValuesChanged) {
      this.args.onValuesChanged(this.parsedValues, this.api);
    }
  }

  private getDOMElement(name: string) {
    return (
      (document.querySelector(
        `[name="${name as string}"]`,
      ) as HTMLInputElement | null) ??
      (document.querySelector(
        `[${DATA_NAME}="${name as string}"]`,
      ) as HTMLInputElement | null)
    );
  }

  <template>
    {{yield this.parsedValues this.api}}
  </template>
}
