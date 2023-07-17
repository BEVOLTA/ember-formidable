import { restartableTask, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import { modifier } from 'ember-modifier';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import _set from 'lodash/set';
import _uniq from 'lodash/uniq';
import { tracked, TrackedObject } from 'tracked-built-ins';

import { action, get } from '@ember/object';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';
import Component from '@glimmer/component';

type TUpdateEvents = 'onChange' | 'onSubmit' | 'onBlur' | 'onFocus';
type Values = Record<string, any>;

let Model: Function | undefined;
if (macroCondition(dependencySatisfies('ember-data', '*'))) {
  Model = (importSync('@ember-data/model') as { default: Function }).default;
}

const DATA_NAME = 'data-formidable-name';

const inputUtils = (input: HTMLInputElement) => {
  return {
    setAttribute: (
      attribute: string,
      value: string | number | undefined | boolean,
    ) => {
      if (_isEmpty(value)) {
        input.removeAttribute(attribute);
      } else {
        input.setAttribute(attribute, `${value}`);
      }
    },
    isFormInput: ['INPUT', 'SELECT'].includes(input.tagName),
    isInput: input.tagName === 'INPUT',
    isSelect: input.tagName === 'SELECT',
    isCheckbox: input.type === 'checkbox',
  };
};

interface IRollbackContext {
  keepError?: boolean;
  keepDirty?: boolean;
  defaultValue?: boolean;
}
interface IFieldState {
  isDirty: boolean;
  isPristine: boolean;
  isInvalid: boolean;
  error?: object;
}
interface IFormidable {
  values?: Values;
  validator?: Function;
  validatorOptions?: any;
  onValuesChanged?: (data: Values, api: any) => void;
  onChange?: (event: Event, api: any) => void;
  onSubmit?: (event: SubmitEvent, api: any) => void;
  updateEvents?: TUpdateEvents[];
  shouldUseNativeValidation?: boolean;
}

interface RegisterOptions {
  // HTML Input attributes
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
  pattern?: RegExp | string;
  onChange?: (event: Event, api: any) => void;
  onBlur?: (event: Event, api: any) => void;
  onFocus?: (event: Event, api: any) => void;
}

/* TODO:
- Make it work for selects / radios
*/
export default class Formidable extends Component<IFormidable> {
  @tracked values: Values = new TrackedObject(this.args.values ?? {});

  // --- SUBMIT
  @tracked isSubmitSuccessful: boolean | undefined = undefined;
  @tracked isSubmitted = false;
  @tracked submitCount = 0;

  // --- VALIDATION
  @tracked validations: Record<string, object> = {};

  // --- ERRORS
  @tracked errors: Record<string, object> = new TrackedObject({});

  // --- DIRTY FIELDS
  @tracked dirtyFields: Record<string, boolean> = new TrackedObject({});

  // --- PARSER
  parsers: Record<
    string,
    Pick<RegisterOptions, 'valueAsDate' | 'valueAsNumber'>
  > = {};

  validator = this.args.validator;

  // --- ROLLBACK
  rollbackValues: Values = this.isModel
    ? { ...(this.args.values ?? {}) }
    : _cloneDeep(this.args.values ?? {});

  // --- UTILS
  get isModel() {
    console.log(Model);
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
  get invalidFields(): Record<string, boolean> {
    return Object.keys(this.errors).reduce(
      (invalid: Record<string, boolean>, key) => {
        return _set(invalid, key, true);
      },
      {},
    );
  }

  get isDirty() {
    return !this.isPristine;
  }

  get isPristine() {
    return _isEmpty(this.dirtyFields);
  }

  get updateEvents() {
    return this.args.updateEvents ?? ['onSubmit'];
  }

  get parsedValues(): Values {
    console.log(this.isModel);
    if (this.isModel) {
      return this.values;
    } else {
      return Object.entries(this.values).reduce((obj, [key, value]) => {
        if (!this.parsers[key]) {
          return _set(obj, key, value);
        }
        if (this.parsers[key]?.valueAsNumber) {
          return _set(obj, key, +value);
        }
        if (this.parsers[key]?.valueAsDate) {
          return _set(obj, key, new Date(value));
        }
        return _set(obj, key, value);
      }, {});
    }
  }

  get fieldsState(): Record<string, IFieldState> {
    return Object.keys(this.values).reduce((state, key) => {
      const isDirty = this.dirtyFields[key] ?? false;
      const isPristine = !isDirty;
      const error = this.errors[key];
      const isInvalid = !_isEmpty(error);

      return _set(state, key, { isDirty, isPristine, isInvalid, error });
    }, {});
  }

  get api() {
    return {
      values: this.parsedValues,
      setValue: this.setValue,
      getValue: this.getValue,
      getValues: this.getValues,
      getFieldState: this.getFieldState,
      fieldsState: this.fieldsState,
      register: this.register,
      onSubmit: (e: SubmitEvent) => taskFor(this.submit).perform(e),
      validate: this.validate,
      errors: this.errors,
      setError: this.setError,
      clearError: this.clearError,
      clearErrors: this.clearErrors,
      rollback: this.rollback,
      defaultValues: this.rollbackValues,
      isSubmitted: this.isSubmitted,
      isSubmitting: this.isSubmitting,
      isValid: this.isValid,
      isValidating: this.isValidating,
      invalidFields: this.invalidFields,
      isDirty: this.isDirty,
      dirtyFields: this.dirtyFields,
      isPristine: this.isPristine,
    };
  }

  // --- STATES HANDLERS

  @action
  rollback(
    name?: string,
    { keepError, keepDirty, defaultValue }: IRollbackContext = {},
  ) {
    if (name) {
      this.values[name] =
        defaultValue ?? this.rollbackValues[name] ?? undefined;
      if (!keepError) {
        delete this.errors[name];
      }
      if (!keepDirty) {
        delete this.dirtyFields[name];
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
  }

  @action
  getFieldState(name: string): IFieldState {
    const isDirty = this.dirtyFields[name] ?? false;
    const isPristine = !isDirty;
    const error = this.errors[name];
    const isInvalid = !_isEmpty(error);

    return { isDirty, isPristine, isInvalid, error };
  }

  @action
  getValue(key: string) {
    if (
      this.isModel &&
      this.parsedValues['relationshipFor']?.(key)?.meta?.kind == 'belongsTo'
    ) {
      return this.parsedValues['belongsTo'](key).value();
    }
    console.log(this.parsedValues, this.values);
    return get(this.parsedValues, key);
  }

  @action
  getValues() {
    return this.parsedValues;
  }

  @action
  setValue(key: string, value: string) {
    if (this.isModel) {
      let _value: string | number | Date = value;
      if (this.parsers[key]) {
        const { valueAsNumber, valueAsDate } = this.parsers[key]!;
        if (valueAsNumber) {
          _value = +value;
        }
        if (valueAsDate) {
          _value = new Date(value);
        }
      }

      this.values['set'](key, _value);
    } else {
      this.values[key] = value;
    }
  }

  @action
  setError(key: string, value: string | { message?: string; type?: string }) {
    if (typeof value === 'string') {
      this.errors[key] = {
        //@ts-ignore
        messages: [...(this.errors[key]?.messages ?? []), value],
        //@ts-ignore
        type: this.errors[key]?.type ?? 'custom',
      };
    } else {
      this.errors[key] = value;
    }
  }

  @action
  clearError(key: string) {
    this.errors = _set(this.errors, key, undefined);
  }

  @action
  clearErrors() {
    this.errors = new TrackedObject({});
  }

  // --- TASKS
  @restartableTask
  *validate(field?: string): TaskGenerator<void> {
    if (!this.validator) {
      return;
    }
    const validation = yield this.validator(this.parsedValues, {
      shouldUseNativeValidation: this.args.shouldUseNativeValidation,
      ...this.args.validatorOptions,
    });
    if (field) {
      this.errors = _set(this.errors, field, get(validation, field));
    } else {
      // TODO: Not good yet.
      this.errors = new TrackedObject(validation);
    }
  }

  @restartableTask
  *submit(event: SubmitEvent): TaskGenerator<void> {
    this.isSubmitted = true;
    this.submitCount += 1;

    try {
      event.preventDefault();
      if (this.updateEvents.includes('onSubmit')) {
        taskFor(this.validate).perform();
      }
      if (this.args.onSubmit) {
        return this.args.onSubmit(event, this.api);
      }

      if (this.updateEvents.includes('onSubmit') && this.args.onValuesChanged) {
        this.args.onValuesChanged(this.parsedValues, this.api);
      }

      this.isSubmitSuccessful = true;
    } catch {
      this.isSubmitSuccessful = false;
    }
  }

  // --- EVENT HANLDERS

  @action
  onChange(event: InputEvent) {
    if (this.updateEvents.includes('onChange')) {
      taskFor(this.validate).perform();
    }
    if (this.args.onChange) {
      return this.args.onChange(event, this.api);
    }
    if (!event.target) {
      throw new Error(
        'FORMIDABLE - No input element found when value got set.',
      );
    }
    const target = event.target as HTMLInputElement;

    this.setValue(target.name, target.value);

    if (this.updateEvents.includes('onChange') && this.args.onValuesChanged) {
      this.args.onValuesChanged(this.parsedValues, this.api);
    }
  }

  @action
  setFocus(name: string) {
    (
      (document.querySelector(`[name="${name}"]`) as HTMLInputElement | null) ??
      (document.querySelector(`[${DATA_NAME}="${name}"]`) as HTMLInputElement)
    ).focus();

    if (this.updateEvents.includes('onFocus')) {
      taskFor(this.validate).perform();
    }
  }

  register = modifier(
    (
      input: HTMLInputElement,
      [name]: [string],
      {
        disabled,
        required,
        maxLength,
        minLength,
        max,
        min,
        pattern,
        valueAsNumber,
        valueAsDate,
        onChange,
        onBlur,
        onFocus,
      }: RegisterOptions,
    ) => {
      const { setAttribute, isFormInput, isInput, isCheckbox } =
        inputUtils(input);

      if (!isFormInput) {
        setAttribute(DATA_NAME, name);
        return;
      }

      // ATTRIBUTES
      if (isInput) {
        if (input.type === 'number') {
          setAttribute('min', min);
          setAttribute('max', max);
        } else {
          const strPattern =
            typeof pattern === 'string' ? pattern : pattern?.toString();
          setAttribute('minlength', minLength);
          setAttribute('maxlength', maxLength);
          setAttribute('disabled', disabled);
          setAttribute('required', required);
          setAttribute('pattern', strPattern);
        }
      }

      if (isFormInput) {
        setAttribute('name', name);

        if (isCheckbox) {
          input.checked = this.getValue(name) ?? false;
        } else if (isInput) {
          input.value = this.getValue(name);
        }
      }

      // VALIDATIONS
      this.validations[name] = {
        min,
        max,
        minLength,
        maxLength,
        disabled,
        required,
      };

      // PARSERS
      this.parsers[name] = { valueAsNumber, valueAsDate };

      // HANDLERS
      const handleInput = async (event: Event) => {
        if (!event.target) {
          throw new Error(
            'FORMIDABLE - No input element found when value got set.',
          );
        }
        this.dirtyFields[name] = true;
        if (this.updateEvents.includes('onChange')) {
          await taskFor(this.validate).perform();
        }
        this.setValue(name, (event.target as HTMLInputElement).value);
        if (onChange) {
          return onChange(event, this.api);
        }
        if (
          this.updateEvents.includes('onChange') &&
          this.args.onValuesChanged
        ) {
          this.args.onValuesChanged(this.parsedValues, this.api);
        }
      };

      const handleBlur = async (event: Event) => {
        if (!event.target) {
          throw new Error(
            'FORMIDABLE - No input element found when value got set.',
          );
        }
        if (this.updateEvents.includes('onBlur')) {
          await taskFor(this.validate).perform();
        }
        this.setValue(name, (event.target as HTMLInputElement).value);
        if (onBlur) {
          return onBlur(event, this.api);
        }
        if (this.updateEvents.includes('onBlur') && this.args.onValuesChanged) {
          this.args.onValuesChanged(this.parsedValues, this.api);
        }
      };

      const handleFocus = async (event: Event) => {
        if (!event.target) {
          throw new Error(
            'FORMIDABLE - No input element found when value got set.',
          );
        }

        if (this.updateEvents.includes('onFocus')) {
          await taskFor(this.validate).perform();
        }

        this.setValue(name, (event.target as HTMLInputElement).value);
        if (onFocus) {
          return onFocus(event, this.api);
        }

        if (
          this.updateEvents.includes('onFocus') &&
          this.args.onValuesChanged
        ) {
          this.args.onValuesChanged(this.parsedValues, this.api);
        }
      };

      const preventDefault = (e: Event) => {
        if (!this.args.shouldUseNativeValidation) {
          e.preventDefault();
        }
        const target = e.target as any;
        if (target && !this.validator) {
          const message = (target as any).validationMessage;
          if (this.errors[target.name]) {
            const { messages } = this.errors[target.name] as any;
            this.errors[target.name] = {
              messages: _uniq([...messages, message]),
              ...this.errors[target.name],
            };
          } else {
            this.errors[target.name] = {
              messages: message,
              validity: target.validity,
            };
          }
        }
      };

      // EVENTS
      input.addEventListener('input', handleInput);
      input.addEventListener('invalid', preventDefault);

      if (onBlur || this.updateEvents.includes('onBlur')) {
        input.addEventListener('blur', handleBlur);
      }

      if (onFocus || this.updateEvents.includes('onFocus')) {
        input.addEventListener('focusin', handleFocus);
      }

      return () => {
        input.removeEventListener('input', handleInput);
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
}
