import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

import { task } from 'ember-concurrency';
import { modifier } from 'ember-modifier';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _set from 'lodash/set';
import _uniqBy from 'lodash/uniqBy';
import _unset from 'lodash/unset';
import { tracked, TrackedObject } from 'tracked-built-ins';

import { formatValue, inputUtils, valueIfChecked } from '../-private/utils';

import type {
  DirtyFields,
  FieldState,
  FormidableApi,
  FormidableArgs,
  FormidableError,
  FormidableErrors,
  HandlerEvent,
  InvalidFields,
  NativeValidations,
  Parser,
  RegisterModifier,
  ResolverOptions,
  RollbackContext,
  SetContext,
  UnregisterContext,
} from '../index';
import type FormidableService from '../services/formidable';
import type { GenericObject, ValueKey } from '../types';
import type { FunctionBasedModifier } from 'ember-modifier';

const DATA_NAME = 'data-formidable-name';
const DATA_REQUIRED = 'data-formidable-required';
const DATA_DISABLED = 'data-formidable-disabled';

const UNREGISTERED_ATTRIBUTE = 'data-formidable-unregistered';

type KeyOrUndefined<Values extends GenericObject = GenericObject> = ValueKey<Values> | undefined;

export interface FormidableSignature<
  Values extends GenericObject = GenericObject,
  ValidatorOptions extends GenericObject = GenericObject,
> {
  Element: HTMLElement;
  Args: FormidableArgs<Values, ValidatorOptions>;
  Blocks: {
    default: [api: FormidableApi<Values>, parsedValues: Values];
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

  get isSubmitting() {
    return this.submit.isRunning;
  }

  get isValid(): boolean {
    return _isEmpty(this.errors);
  }

  get isValidating() {
    return this.validate.isRunning;
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
    return (
      Object.values(this.errors)
        .flat()
        // empty errors can happen!
        .filter((err) => typeof err === 'object' && !_isEmpty(err))
        .map((err) => {
          return err?.message;
        })
    );
  }

  get isDirty(): boolean {
    return !this.isPristine;
  }

  get isPristine(): boolean {
    return _isEmpty(this.dirtyFields);
  }

  get handleOn(): HandlerEvent[] {
    return this.args.handleOn ?? ['onSubmit'];
  }

  get validateOn(): HandlerEvent[] {
    return this.args.validateOn ?? ['onBlur', 'onSubmit'];
  }

  get revalidateOn(): HandlerEvent[] {
    return this.args.revalidateOn ?? ['onChange', 'onSubmit'];
  }

  get parsedValues(): Values {
    return Object.entries(this.values).reduce((obj, [key, value]) => {
      return _set(obj, key, formatValue(value, this.parsers[key as ValueKey<Values>]));
    }, {}) as Values;
  }

  @cached
  get api(): FormidableApi<Values> {
    return {
      values: this.parsedValues,
      setValue: async (
        field: ValueKey<Values>,
        value: string | boolean | undefined,
        context?: SetContext,
      ) => await this.setValue.perform(field, value, context),
      getValue: this.getValue,
      getValues: this.getValues,
      getDefaultValue: this.getDefaultValue,
      getFieldState: this.getFieldState,
      register: this.register as FunctionBasedModifier<RegisterModifier<Values>>,
      unregister: this.unregister,
      onSubmit: async (e?: SubmitEvent) => await this.submit.perform(e),
      validate: async (field?: ValueKey<Values>) => await this.validate.perform(field),
      errors: this.errors,
      errorMessages: this.errorMessages,
      getError: this.getError,
      setError: this.setError,
      clearError: this.clearError,
      clearErrors: this.clearErrors,
      rollback: this.rollback,
      rollbackInvalid: async (context?: RollbackContext) =>
        await this.rollbackInvalid.perform(context),
      setFocus: async (name: ValueKey<Values>, context?: SetContext) =>
        await this.setFocus.perform(name, context),
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

  rollback = (
    field?: ValueKey<Values>,
    { keepError, keepDirty, defaultValue }: RollbackContext = {},
  ): void => {
    if (field) {
      this.values[field] = (defaultValue ??
        this.rollbackValues[field] ??
        undefined) as Values[ValueKey<Values>];

      if (defaultValue) {
        this.rollbackValues[field] = defaultValue as Values[ValueKey<Values>];
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
        this.dirtyFields = new TrackedObject({}) as DirtyFields<Values>;
      }

      this.isSubmitted = false;
    }
  };

  getFieldState = (name: ValueKey<Values>): FieldState => {
    const isDirty = this.dirtyFields[name] ?? false;
    const isPristine = !isDirty;
    const error = this.errors[name];
    const isInvalid = !_isEmpty(error);

    return { isDirty, isPristine, isInvalid, error };
  };

  getError = (field: ValueKey<Values>): any => {
    return get(this.errors, field);
  };

  getValue = (field: ValueKey<Values>): any => {
    return get(this.parsedValues, field);
  };

  getValues = (): Values => {
    return this.parsedValues;
  };

  getDefaultValue = (field: ValueKey<Values>): any => {
    return get(this.rollbackValues, field);
  };

  setError = (field: ValueKey<Values>, error: string | FormidableError): void => {
    if (typeof error === 'string') {
      this.errors = _set(
        this.errors,
        field,
        _uniqBy(
          [
            ...(get(this.errors, field) ?? []),
            {
              message: error as string,
              type: 'custom',
              value: this.getValue(field),
            },
          ],
          'type',
        ),
      );
    } else {
      this.errors = _set(
        this.errors,
        field,
        _uniqBy(
          [
            ...(get(this.errors, field) ?? []),
            {
              message: error.message,
              type: error.type ?? 'custom',
              value: error.value ?? this.getValue(field),
            },
          ],
          'type',
        ),
      );
    }
  };

  clearError = (field: ValueKey<Values>): void => {
    if (get(this.errors, field)) {
      _unset(this.errors, field);
    }
  };

  clearErrors = (): void => {
    this.errors = new TrackedObject({});
  };

  unregister = (
    field: ValueKey<Values>,
    { keepError, keepDirty, keepValue, keepDefaultValue }: UnregisterContext = {},
  ): void => {
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
  };

  rollbackInvalid = task(async (context: RollbackContext = {}): Promise<void> => {
    await this.validate.perform();

    for (const field of Object.keys(this.invalidFields)) {
      this.rollback(field as KeyOrUndefined<Values>, context);
    }
  });

  setValue = task(
    async (
      field: ValueKey<Values>,
      value: any,
      { shouldValidate, shouldDirty }: SetContext = {},
    ): Promise<void> => {
      this.values[field] = value as Values[ValueKey<Values>];

      if (shouldDirty) {
        this.dirtyField(field);
      }

      if (shouldValidate) {
        await this.validate.perform(field as KeyOrUndefined<Values>);
      }
    },
  );

  setFocus = task(
    async (
      field: ValueKey<Values>,
      { shouldValidate, shouldDirty }: SetContext = {},
    ): Promise<void> => {
      this.getDOMElement(field as string)?.focus();

      if (shouldDirty) {
        this.dirtyField(field);
      }

      if (shouldValidate) {
        await this.validate.perform(field as KeyOrUndefined<Values>);
      }
    },
  );

  // --- TASKS

  validate = task(async (field?: ValueKey<Values>): Promise<void> => {
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
  });

  submit = task(async (event?: SubmitEvent): Promise<void> => {
    try {
      this.isSubmitted = true;

      event?.preventDefault();

      if (this.shouldValidateOrRevalidate('onSubmit')) {
        await this.validate.perform();
      }

      this.isSubmitSuccessful = this.isValid;

      if (!this.isSubmitSuccessful) {
        return;
      }

      if (this.args.onSubmit) {
        return await this.args.onSubmit(this.parsedValues, this.api, event);
      }

      if (this.handleOn.includes('onSubmit') && this.args.handler) {
        await this.args.handler(this.parsedValues, this.api, event, 'onSubmit');
      }
    } finally {
      this.submitCount += 1;
    }
  });

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
      this.parsers[name as ValueKey<Values>] = {
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

      if (
        (isInput && (input as HTMLInputElement).type === 'number') ||
        (input as HTMLInputElement).type === 'time'
      ) {
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

        const value = this.getValue(name as ValueKey<Values>);

        if (isRadio || isCheckbox) {
          const checked = Array.isArray(value)
            ? value.includes((input as HTMLInputElement).value)
            : (input as HTMLInputElement).value === value;

          (input as HTMLInputElement).checked = checked;
          setAttribute('aria-checked', checked);
        } else if (isInput || isTextarea) {
          (input as HTMLInputElement).value = (value as string) ?? '';
        }
      }

      // HANDLERS
      const handleChange = (event: Event): Promise<void> =>
        this.onChange.perform(name as ValueKey<Values>, event, onChange);

      const handleBlur = (event: Event): Promise<void> =>
        this.onBlur.perform(name as ValueKey<Values>, event, onBlur);

      const handleFocus = (event: Event): Promise<void> =>
        this.onFocus.perform(name as ValueKey<Values>, event, onFocus);

      const preventDefault = (e: Event): void => {
        if (!this.args.shouldUseNativeValidation) {
          e.preventDefault();
        }
      };

      this.nativeValidations[name as ValueKey<Values>] = {
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

      if (onBlur || this.shouldValidateOrRevalidate('onBlur') || this.handleOn.includes('onBlur')) {
        input.addEventListener('blur', handleBlur);
      }

      if (
        onFocus ||
        this.shouldValidateOrRevalidate('onFocus') ||
        this.handleOn.includes('onFocus')
      ) {
        input.addEventListener('focusin', handleFocus);
      }

      return (): void => {
        input.removeEventListener(
          isInput || isSelect || isTextarea ? 'input' : 'change',
          handleChange,
        );
        input.removeEventListener('invalid', preventDefault);

        if (
          onBlur ||
          this.shouldValidateOrRevalidate('onBlur') ||
          this.handleOn.includes('onBlur')
        ) {
          input.removeEventListener('blur', handleBlur);
        }

        if (
          onFocus ||
          this.shouldValidateOrRevalidate('onFocus') ||
          this.handleOn.includes('onFocus')
        ) {
          input.removeEventListener('focus', handleFocus);
        }
      };
    },
  );

  onChange = task(
    async (
      field: ValueKey<Values>,
      event: Event,
      onChange?: (event: Event, api: FormidableApi<GenericObject>) => void,
    ): Promise<void> => {
      assert('FORMIDABLE - No input element found when value got set.', !!event.target);

      await this.setValue.perform(
        field,
        valueIfChecked(event, this.getValue(field), this.getDefaultValue(field)),
        {
          shouldValidate: this.shouldValidateOrRevalidate('onChange'),
          shouldDirty: true,
        },
      );

      if (onChange) {
        return onChange(event, this.api as FormidableApi<GenericObject>);
      }

      if (this.handleOn.includes('onChange') && this.args.handler) {
        await this.args.handler(this.parsedValues, this.api, event, 'onChange');
      }
    },
  );

  onBlur = task(
    async (
      field: ValueKey<Values>,
      event: Event,
      onBlur?: (event: Event, api: FormidableApi<GenericObject>) => void,
    ): Promise<void> => {
      assert('FORMIDABLE - No input element found when value got set.', !!event.target);

      await this.setValue.perform(
        field,
        valueIfChecked(event, this.getValue(field), this.getDefaultValue(field)),
        {
          shouldValidate: this.shouldValidateOrRevalidate('onBlur'),
        },
      );

      if (onBlur) {
        return onBlur(event, this.api as FormidableApi<GenericObject>);
      }

      if (this.handleOn.includes('onBlur') && this.args.handler) {
        await this.args.handler(this.parsedValues, this.api, event, 'onBlur');
      }
    },
  );

  onFocus = task(
    async (
      field: ValueKey<Values>,
      event: Event,
      onFocus?: (event: Event, api: FormidableApi<GenericObject>) => void,
    ): Promise<void> => {
      assert('FORMIDABLE - No input element found when value got set.', !!event.target);

      await this.setValue.perform(
        field,
        valueIfChecked(event, this.getValue(field), this.getDefaultValue(field)),
        {
          shouldValidate: this.shouldValidateOrRevalidate('onFocus'),
        },
      );

      if (onFocus) {
        return onFocus(event, this.api as FormidableApi<GenericObject>);
      }

      if (this.handleOn.includes('onFocus') && this.args.handler) {
        await this.args.handler(this.parsedValues, this.api, event, 'onFocus');
      }
    },
  );

  dirtyField(field: ValueKey<Values>): void {
    this.dirtyFields[field] = !_isEqual(
      get(this.rollbackValues, field),
      get(this.parsedValues, field),
    );
  }

  private shouldValidateOrRevalidate(eventType: HandlerEvent) {
    return this.submitCount > 0
      ? this.revalidateOn.includes(eventType)
      : this.validateOn.includes(eventType);
  }

  private getDOMElement(name: string): HTMLInputElement | null {
    return (
      (document.querySelector(`[name="${name as string}"]`) as HTMLInputElement | null) ??
      (document.querySelector(`[${DATA_NAME}="${name as string}"]`) as HTMLInputElement | null)
    );
  }

  <template>
    {{yield this.api this.parsedValues}}
  </template>
}
