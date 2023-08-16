import _isNil from 'lodash/isNil';

export const inputUtils = (
  input: HTMLInputElement,
): {
  setAttribute: (
    attribute: string,
    value: string | number | undefined | boolean,
  ) => void;
  isFormInput: boolean;
  isInput: boolean;
  isTextarea: boolean;
  isSelect: boolean;
  isCheckbox: boolean;
  isRadio: boolean;
  name: string | null;
} => {
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
    name: input.getAttribute('name'),
  };
};
