import _isNil from 'lodash/isNil';

import type { FormatOptions } from '../types';

export const inputUtils = (
  input: Element,
): {
  setAttribute: (attribute: string, value: string | number | undefined | boolean) => void;
  isFormInput: boolean;
  isInput: boolean;
  isTextarea: boolean;
  isSelect: boolean;
  isCheckbox: boolean;
  isRadio: boolean;
  name: string | null;
} => {
  return {
    setAttribute: (attribute: string, value: string | number | undefined | boolean): void => {
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
    isCheckbox: (input as HTMLInputElement).type === 'checkbox',
    isRadio: (input as HTMLInputElement).type === 'radio',
    name: input.getAttribute('name'),
  };
};

export const valueIfChecked = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const { isCheckbox, isRadio } = inputUtils(target);
  const isCheckable = isCheckbox || isRadio;

  if (!isCheckable || (isCheckable && !!target.checked)) {
    return target.value;
  }

  return undefined;
};

export const formatValue = (value: any, formatOptions: FormatOptions | undefined): any => {
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
