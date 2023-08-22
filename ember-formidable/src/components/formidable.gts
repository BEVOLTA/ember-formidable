import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';

import { modifier } from 'ember-modifier';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _set from 'lodash/set';
import _unset from 'lodash/unset';
import { tracked, TrackedObject } from 'tracked-built-ins';

import { inputUtils } from '../-private/utils';

import type {
  DirtyFields,
  FieldState,
  FormatOptions,
  FormidableApi,
  FormidableArgs,
  FormidableError,
  FormidableErrors,
  GenericObject,
  InvalidFields,
  NativeValidations,
  Parser,
  RegisterModifier,
  ResolverOptions,
  RollbackContext,
  SetContext,
  UnregisterContext,
  UpdateEvent,
} from '../index';
import type FormidableService from '../services/formidable';
import type { FunctionBasedModifier } from 'ember-modifier';

const DATA_NAME = 'data-formidable-name';
const DATA_REQUIRED = 'data-formidable-required';
const DATA_DISABLED = 'data-formidable-disabled';

const UNREGISTERED_ATTRIBUTE = 'data-formidable-unregistered';

const formatValue = (value: any, formatOptions: FormatOptions | undefined): any => {
  if (!formatOptions) {
    return value;
  }

  const { valueAsNumber, valueAsDate, valueFormat, valueAsBoolean } = formatOptions;

  if (valueFormat) {
    return valueFormat(value);
  }

  if (valueAsNumber) {
    return +(value as string | number);
  }

  if (valueAsDate) {
    return new Date(value as string | number);
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
  values: Values = new TrackedObject(_cloneDeep(this.args.values ?? {})) as Values;

  // --- SUBMIT
  @tracked isSubmitSuccessful: boolean | undefined = undefined;
  @tracked isSubmitted = false;
  @tracked isSubmitting = false;
  @tracked isValidating = false;

  @tracked submitCount = 0;

  @tracked nativeValidations: NativeValidations<Values> = {} as NativeValidations<Values>;

  // --- ERRORS
  errors: FormidableErrors = new TrackedObject({});

  // --- DIRTY FIELDS
  dirtyFields: DirtyFields<Values> = new TrackedObject({}) as DirtyFields<Values>;

  // --- PARSER
  parsers: Parser<Values> = {} as Parser<Values>;

  validator = this.args.validator;

  // --- ROLLBACK
  rollbackValues: Values = new TrackedObject(_cloneDeep(this.args.values ?? {}) as Values);

  // --- STATES

  get isValid(): boolean {
    return _isEmpty(this.errors);
  }

  get isInvalid(): boolean {
    return !this.isValid;
  }

  get invalidFields(): InvalidFields<Values> {
    return Object.keys(this.errors).reduce((invalid: Record<string, boolean>, key) => {
      return _set(invalid, key, true);
    }, {}) as InvalidFields<Values>;
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

  get updateEvents(): UpdateEvent[] {
    return this.args.updateEvents ?? ['onSubmit'];
  }

  get parsedValues(): Values {
    return Object.entries(this.values).reduce((obj, [key, value]) => {
      return _set(obj, key, formatValue(value, this.parsers[key]));
    }, {}) as Values;
  }

  get api(): FormidableApi<Values> {
    return {
      values: this.parsedValues,
      setValue: async (
        field: keyof Values,
        value: string | boolean | undefined,
        context?: SetContext,
      ) => await this.setValue(field, value, context),
      getValue: this.getValue,
      getValues: this.getValues,
      getFieldState: this.getFieldState,
      register: this.register as FunctionBasedModifier<RegisterModifier<Values>>,
      unregister: this.unregister,
      onSubmit: async (e: SubmitEvent) => await this.submit(e),
      validate: async (field?: keyof Values) => await this.validate(field),
      errors: this.errors,
      errorMessages: this.errorMessages,
      setError: this.setError,
      clearError: this.clearError,
      clearErrors: this.clearErrors,
      rollback: this.rollback,
      setFocus: async (name: keyof Values, context?: SetContext) =>
        await this.setFocus(name, context),
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

  constructor(owner: any, args: FormidableArgs<Values, ValidatorOptions>) {
    super(owner, args);

    if (this.args.serviceId) {
      this.formidable._register(this.args.serviceId, () => this.api as FormidableApi);
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
      this.values = new TrackedObject(_cloneDeep(this.rollbackValues));

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
  getValue(field: keyof Values): any {
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
    { keepError, keepDirty, keepValue, keepDefaultValue }: UnregisterContext = {},
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

  @action
  async setValue(
    field: keyof Values,
    value: string | boolean | undefined,
    { shouldValidate, shouldDirty }: SetContext = {},
  ): Promise<void> {
    this.values[field] = value as Values[keyof Values];

    if (shouldDirty) {
      this.dirtyField(field);
    }

    if (shouldValidate) {
      await this.validate(field);
    }
  }

  @action
  async setFocus(
    field: keyof Values,
    { shouldValidate, shouldDirty }: SetContext = {},
  ): Promise<void> {
    this.getDOMElement(field as string)?.focus();

    if (shouldDirty) {
      this.dirtyField(field);
    }

    if (shouldValidate) {
      await this.validate(field);
    }
  }

  // --- TASKS
  @action
  async validate(field?: keyof Values): Promise<void> {
    try {
      this.isValidating = true;

      if (!this.validator) {
        return;
      }

      const validation: FormidableErrors = await this.validator(this.parsedValues, {
        ...this.args.validatorOptions,
        shouldUseNativeValidation: this.args.shouldUseNativeValidation,
        nativeValidations: this.nativeValidations,
      } as ResolverOptions<ValidatorOptions>);

      if (field) {
        this.errors = _set(this.errors, field, get(validation, field));
      } else {
        this.errors = new TrackedObject(validation);
      }
    } finally {
      this.isValidating = false;
    }
  }

  @action
  async submit(event: SubmitEvent): Promise<void> {
    try {
      this.isSubmitting = true;
      this.isSubmitted = true;
      this.submitCount += 1;

      event.preventDefault();

      if (this.updateEvents.includes('onSubmit')) {
        await this.validate();
      }

      this.isSubmitSuccessful = this.isValid;

      if (!this.isSubmitSuccessful) {
        return;
      }

      if (this.args.onSubmit) {
        return this.args.onSubmit(event, this.api);
      }

      if (this.updateEvents.includes('onSubmit') && this.args.onUpdate) {
        this.args.onUpdate(this.parsedValues, this.api);
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  register = modifier<RegisterModifier<Values>>(
    (
      input,
      [_name] = [undefined],
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
      } = {},
    ) => {
      const {
        setAttribute,
        isFormInput,
        isInput,
        isCheckbox,
        isRadio,
        isTextarea,
        isSelect,
        name: attrName,
      } = inputUtils(input);

      const name = _name ?? attrName;

      assert(
        `FORMIDABLE - Your element must have a name ; either specify it in the register parameters, or assign it directly to the element.
        Examples:
        <input name="foo" {{api.register}} />
        OR
        <input {{api.register "foo"}} />
      `,
        !!name,
      );

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

      if (isInput && (input as HTMLInputElement).type === 'number') {
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
        setAttribute('name', name as string);

        const value = this.getValue(name);

        if (isRadio || isCheckbox) {
          (input as HTMLInputElement).checked = (input as HTMLInputElement).value === value;
        } else if (isInput || isTextarea) {
          (input as HTMLInputElement).value = (value as string) ?? '';
        }
      }

      // HANDLERS
      const handleChange = async (event: Event): Promise<void> => {
        await this.onChange(name, event, onChange);
      };

      const handleBlur = async (event: Event): Promise<void> => {
        await this.onBlur(name, event, onBlur);
      };

      const handleFocus = async (event: Event): Promise<void> => {
        await this.onFocus(name, event, onFocus);
      };

      const preventDefault = (e: Event): void => {
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
        pattern,
      };

      // EVENTS

      input.addEventListener(isInput || isSelect || isTextarea ? 'input' : 'change', handleChange);
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

  @action
  async onChange(
    field: keyof Values,
    event: Event,
    onChange?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ): Promise<void> {
    assert('FORMIDABLE - No input element found when value got set.', !!event.target);

    await this.setValue(field, (event.target as HTMLInputElement).value, {
      shouldValidate: this.updateEvents.includes('onChange'),
      shouldDirty: true,
    });

    if (onChange) {
      return onChange(event, this.api as FormidableApi<GenericObject>);
    }

    if (this.updateEvents.includes('onChange') && this.args.onUpdate) {
      this.args.onUpdate(this.parsedValues, this.api);
    }
  }

  @action
  async onBlur(
    field: keyof Values,
    event: Event,
    onBlur?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ): Promise<void> {
    assert('FORMIDABLE - No input element found when value got set.', !!event.target);

    await this.setValue(field, (event.target as HTMLInputElement).value, {
      shouldValidate: this.updateEvents.includes('onBlur'),
    });

    if (onBlur) {
      return onBlur(event, this.api as FormidableApi<GenericObject>);
    }

    if (this.updateEvents.includes('onBlur') && this.args.onUpdate) {
      this.args.onUpdate(this.parsedValues, this.api);
    }
  }

  @action
  async onFocus(
    field: keyof Values,
    event: Event,
    onFocus?: (event: Event, api: FormidableApi<GenericObject>) => void,
  ): Promise<void> {
    assert('FORMIDABLE - No input element found when value got set.', !!event.target);

    await this.setValue(field, (event.target as HTMLInputElement).value, {
      shouldValidate: this.updateEvents.includes('onFocus'),
    });

    if (onFocus) {
      return onFocus(event, this.api as FormidableApi<GenericObject>);
    }

    if (this.updateEvents.includes('onFocus') && this.args.onUpdate) {
      this.args.onUpdate(this.parsedValues, this.api);
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
      (document.querySelector(`[name="${name as string}"]`) as HTMLInputElement | null) ??
      (document.querySelector(`[${DATA_NAME}="${name as string}"]`) as HTMLInputElement | null)
    );
  }

  <template>
    {{yield this.parsedValues this.api}}
  </template>
}
