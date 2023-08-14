import { restartableTask, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import { modifier } from 'ember-modifier';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import _isNil from 'lodash/isNil';
import _isObject from 'lodash/isObject';
import _set from 'lodash/set';
import _unset from 'lodash/unset';
import _isEqual from 'lodash/isEqual';
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

// eslint-disable-next-line @typescript-eslint/ban-types
let Model: Function | undefined;

if (macroCondition(dependencySatisfies('ember-data', '*'))) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model = (importSync('@ember-data/model') as { default: Function }).default;
}

const DATA_NAME = 'data-formidable-name';
const DATA_REQUIRED = 'data-formidable-required';
const DATA_DISABLED = 'data-formidable-disabled';

const UNREGISTERED_ATTRIBUTE = 'data-formidable-unregistered';

const inputUtils = (input: HTMLInputElement) => {
  return {
    setAttribute: (
      attribute: string,
      value: string | number | undefined | boolean,
    ): void => {
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

const formatValue = (
  value: any,
  formatOptions: FormatOptions | undefined,
): any => {
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
  ValidatorOptions extends GenericObject = GenericObject,
> {
  Element: HTMLElement;
  Args: FormidableArgs<Values, ValidatorOptions>;
  Blocks: {
    default: [parsedValues: Values, api: FormidableApi<Values>];
  };
}

export default class Formidable<
  Values extends GenericObject = GenericObject,
  ValidatorOptions extends GenericObject = GenericObject,
> extends Component<FormidableSignature<Values, ValidatorOptions>> {
  @service formidable!: FormidableService;

  // --- VALUES
  values: Values = this.isModel
    ? this.args.values ?? ({} as Values)
    : (new TrackedObject(_cloneDeep(this.args.values ?? {})) as Values);

  // --- SUBMIT
  @tracked isSubmitSuccessful: boolean | undefined = undefined;
  @tracked isSubmitted = false;
  @tracked submitCount = 0;

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
  get isModel(): boolean {
    if (!Model) {
      return false;
    }
    return this.args.values instanceof Model;
  }

  // --- STATES
  get isSubmitting(): boolean {
    return taskFor(this.submit).isRunning;
  }

  get isValidating(): boolean {
    return taskFor(this.validate).isRunning;
  }

  get isValid(): boolean {
    return _isEmpty(this.errors);
  }

  get isInvalid(): boolean {
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

  get errorMessages(): string[] {
    return Object.values(this.errors)
      .flat()
      .map((err) => err.message);
  }

  get isDirty(): boolean {
    return !this.isPristine;
  }

  get isPristine(): boolean {
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
        field: keyof Values,
        value: string | boolean | undefined,
        context?: SetContext,
      ) => taskFor(this.setValue).perform(field, value, context),
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

  constructor(owner: unknown, args: FormidableArgs<Values, ValidatorOptions>) {
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

  // eslint-disable-next-line ember/require-super-in-lifecycle-hooks
  willDestroy(): void {
    if (this.args.serviceId) {
      this.formidable._unregister(this.args.serviceId);
    }
  }

  // --- STATES HANDLERS

  @action
  rollback(
    field?: keyof Values,
    { keepError, keepDirty, defaultValue }: RollbackContext = {},
  ): void {
    if (field) {
      this.values[field] = (defaultValue ??
        this.rollbackValues[field] ??
        undefined) as Values[keyof Values];

      if (defaultValue) {
        this.rollbackValues[field] = defaultValue as Values[keyof Values];
      }

      if (!keepError) {
        delete this.errors[field];
      }
      if (!keepDirty) {
        delete this.dirtyFields[field as keyof Values];
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
  getFieldState(name: keyof Values): FieldState<Values> {
    const isDirty = this.dirtyFields[name] ?? false;
    const isPristine = !isDirty;
    const error = this.errors[name] as FormidableErrors<keyof Values>;
    const isInvalid = !_isEmpty(error);

    return { isDirty, isPristine, isInvalid, error };
  }

  @action
  getValue(field: keyof Values): unknown {
    if (
      this.isModel &&
      this.parsedValues['relationshipFor']?.(field)?.meta?.kind == 'belongsTo'
    ) {
      return this.parsedValues['belongsTo'](field).value();
    }

    return get(this.parsedValues, field);
  }

  @action
  getValues(): Values {
    return this.parsedValues;
  }

  @action
  setError(field: keyof Values, error: string | FormidableError): void {
    if (typeof error === 'string') {
      this.errors[field] = [
        ...(this.errors[field] ?? []),
        {
          message: error as string,
          type: 'custom',
          value: this.getValue(field),
        },
      ];
    } else {
      this.errors[field] = [
        ...(this.errors[field] ?? []),
        {
          message: error.message,
          type: error.type ?? 'custom',
          value: error.value ?? this.getValue(field),
        },
      ];
    }
  }

  @action
  clearError(field: keyof Values): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  @action
  clearErrors(): void {
    this.errors = new TrackedObject({});
  }

  @action
  unregister(
    field: keyof Values,
    {
      keepError,
      keepDirty,
      keepValue,
      keepDefaultValue,
    }: UnregisterContext = {},
  ): void {
    const element = this.getDOMElement(field as string);

    assert('FORMIDABLE - No input element found to unregister', !!element);

    const { setAttribute } = inputUtils(element);
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
  }

  @restartableTask
  *setValue(
    field: keyof Values,
    value: string | boolean | undefined,
    { shouldValidate, shouldDirty }: SetContext = {},
  ): TaskGenerator<void> {
    if (this.isModel) {
      this.values['set'](field, formatValue(value, this.parsers[field]));
    } else {
      this.values[field] = value as Values[keyof Values];
    }
    if (shouldDirty) {
      this.dirtyField(field);
    }
    if (shouldValidate) {
      yield taskFor(this.validate).perform(field);
    }
  }

  @restartableTask
  *setFocus(
    field: keyof Values,
    { shouldValidate, shouldDirty }: SetContext = {},
  ): TaskGenerator<void> {
    this.getDOMElement(field as string)?.focus();

    if (shouldDirty) {
      this.dirtyField(field);
    }

    if (shouldValidate) {
      yield taskFor(this.validate).perform(field);
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
        ...this.args.validatorOptions,
      } as ValidatorOptions,
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
        setAttribute(DATA_DISABLED, disabled);
        setAttribute(DATA_REQUIRED, required);
        return;
      }

      // ATTRIBUTES

      if (isInput && input.type === 'number') {
        setAttribute('min', min);
        setAttribute('max', max);
      } else if (isInput || isTextarea) {
        setAttribute('minlength', minLength);
        setAttribute('maxlength', maxLength);

        if (isInput) {
          const strPattern =
            typeof pattern === 'string' ? pattern : pattern?.toString();
          setAttribute('pattern', strPattern);
        }
      }

      if (isFormInput) {
        setAttribute('disabled', disabled);
        setAttribute('required', required);
        setAttribute('name', name as string);
        const value = this.getValue(name);
        if (isRadio || isCheckbox) {
          input.checked = input.value === value;
        } else if (isInput || isTextarea) {
          input.value = (value as string) ?? '';
        }
      }

      // HANDLERS
      const handleChange = (event: Event): void => {
        taskFor(this.onChange).perform(name, event, onChange);
      };

      const handleBlur = async (event: Event): Promise<void> => {
        taskFor(this.onBlur).perform(name, event, onBlur);
      };

      const handleFocus = async (event: Event): Promise<void> => {
        taskFor(this.onFocus).perform(name, event, onFocus);
      };

      const preventDefault = (e: Event): void => {
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

      return (): void => {
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
    field: keyof Values,
    event: Event,
    onChange?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ): TaskGenerator<void> {
    assert(
      'FORMIDABLE - No input element found when value got set.',
      !!event.target,
    );

    yield taskFor(this.setValue).perform(
      field,
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
    field: keyof Values,
    event: Event,
    onBlur?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ): TaskGenerator<void> {
    assert(
      'FORMIDABLE - No input element found when value got set.',
      !!event.target,
    );

    yield taskFor(this.setValue).perform(
      field,
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
    field: keyof Values,
    event: Event,
    onFocus?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ): TaskGenerator<void> {
    assert(
      'FORMIDABLE - No input element found when value got set.',
      !!event.target,
    );

    yield taskFor(this.setValue).perform(
      field,
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

  @action
  dirtyField(field: keyof Values): void {
    this.dirtyFields[field] = !_isEqual(
      get(this.rollbackValues, field),
      get(this.parsedValues, field),
    );
  }

  private getDOMElement(name: string): HTMLInputElement | null {
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
