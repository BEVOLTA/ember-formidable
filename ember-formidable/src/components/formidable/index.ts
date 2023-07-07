import { modifier } from 'ember-modifier';
import _uniq from 'lodash';
import _set from 'lodash/set';
import { tracked, TrackedObject } from 'tracked-built-ins';

import { action, get } from '@ember/object';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';
import Component from '@glimmer/component';

let Model: Function;
if (macroCondition(dependencySatisfies('ember-data', '*'))) {
  Model = (importSync('@ember-data/model') as { default: Function }).default;
}

type Values = Record<string, any>;
type TUpdateEvents = 'onChange' | 'onSubmit' | 'onBlur' | 'onFocus';

const inputUtils = (input: HTMLInputElement) => {
  return {
    setUnlessExists: (
      attribute: string,
      value: string | number | undefined | boolean,
    ) => {
      if (!input.getAttribute(attribute) && value) {
        input.setAttribute(attribute, `${value}`);
      }
    },
    isFormInput: ['INPUT', 'SELECT'].includes(input.tagName),
    isInput: input.tagName === 'INPUT',
    isSelect: input.tagName === 'SELECT',
  };
};

interface IFormidable {
  values: Values;
  validator?: any;
  onValuesChanged: (data: Values, api: any) => void;
  onChange?: (event: Event, api: any) => void;
  onSubmit?: (event: SubmitEvent, api: any) => void;
  updateEvents?: TUpdateEvents[];
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
  onChange?: (event: Event) => void;
  onBlur?: (event: Event) => void;
}

/* TODO:
- Make it work for selects / radios
- Add a conditional to keep invalid HTML default
*/
export default class Formidable extends Component<IFormidable> {
  @tracked values: Values = new TrackedObject(this.args.values);
  @tracked validations: Record<string, object> = {};
  @tracked errors: Record<string, object> = new TrackedObject({});

  @tracked parsers: Record<
    string,
    Pick<RegisterOptions, 'valueAsDate' | 'valueAsNumber'>
  > = {};
  validator = this.args.validator;

  rollbackValues: Values = this.isModel
    ? { ...this.args.values }
    : structuredClone(this.args.values);

  get isModel() {
    return this.args.values instanceof Model;
  }

  get api() {
    return {
      values: this.parsedValues,
      setValue: this.setValue,
      register: this.register,
      onSubmit: this.onSubmit,
      validate: this.validate,
      errors: this.errors,
    };
  }

  get updateEvents() {
    return this.args.updateEvents ?? ['onSubmit'];
  }

  get parsedValues() {
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

  @action
  async validate() {
    if (!this.validator) {
      return;
    }
    try {
      const validData = await this.validator.validate(this.parsedValues, {
        abortEarly: false,
      });
      console.log(validData);
    } catch (err) {
      const { name, message } = err as Error;
      this.errors[name] = {
        message,
      };
    }
  }

  @action
  onSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (this.updateEvents.includes('onSubmit')) {
      this.validate();
    }
    if (this.args.onSubmit) {
      return this.args.onSubmit(event, this.api);
    }

    if (this.updateEvents.includes('onSubmit')) {
      this.args.onValuesChanged(this.parsedValues, this.api);
    }
  }

  @action
  onChange(event: InputEvent) {
    if (this.updateEvents.includes('onChange')) {
      this.validate();
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

    if (this.updateEvents.includes('onChange')) {
      this.args.onValuesChanged(this.parsedValues, this.api);
    }
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
        type: this.errors[key]?.type,
      };
    } else {
      this.errors[key] = value;
    }
  }

  @action
  setFocus(name: string) {
    (document.querySelector(`[name="${name}"]`) as HTMLInputElement)?.focus();
  }

  @action
  getValues() {
    return this.parsedValues;
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
      }: RegisterOptions,
    ) => {
      const { setUnlessExists, isFormInput, isInput } = inputUtils(input);

      if (!isFormInput) {
        return;
      }

      // ATTRIBUTES
      if (isInput) {
        if (input.type === 'number') {
          setUnlessExists('min', min);
          setUnlessExists('max', max);
        } else {
          const strPattern =
            typeof pattern === 'string' ? pattern : pattern?.toString();
          setUnlessExists('minLength', minLength);
          setUnlessExists('maxLength', maxLength);
          setUnlessExists('disabled', disabled);
          setUnlessExists('required', required);
          setUnlessExists('pattern', strPattern);

          setUnlessExists('value', get(this.args.values, name));
        }
      }

      if (isFormInput) {
        setUnlessExists('name', name);
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
        if (this.updateEvents.includes('onChange')) {
          await this.validate();
        }
        if (onChange) {
          return onChange(event);
        }
        if (!event.target) {
          throw new Error(
            'FORMIDABLE - No input element found when value got set.',
          );
        }
        this.setValue(name, (event.target as HTMLInputElement).value);
        if (this.updateEvents.includes('onChange')) {
          this.args.onValuesChanged(this.parsedValues, this.api);
        }
      };

      const handleBlur = async (event: Event) => {
        if (this.updateEvents.includes('onBlur')) {
          await this.validate();
        }
        if (onBlur) {
          return onBlur(event);
        }
        if (!event.target) {
          throw new Error(
            'FORMIDABLE - No input element found when value got set.',
          );
        }
        this.setValue(name, (event.target as HTMLInputElement).value);
        if (this.updateEvents.includes('onBlur')) {
          this.args.onValuesChanged(this.parsedValues, this.api);
        }
      };

      const preventDefault = (e: Event) => {
        e.preventDefault();
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

      return () => {
        input.removeEventListener('input', handleInput);
        input.removeEventListener('invalid', preventDefault);

        if (onBlur || this.updateEvents.includes('onBlur')) {
          input.removeEventListener('blur', handleBlur);
        }
      };
    },
  );
}
