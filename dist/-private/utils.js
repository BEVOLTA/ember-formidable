import _isNil from 'lodash/isNil';

const inputUtils = input => {
  return {
    setAttribute: (attribute, value) => {
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
    name: input.getAttribute('name')
  };
};
const valueIfChecked = (event, value, defaultValue) => {
  const target = event.target;
  const {
    isCheckbox,
    isRadio
  } = inputUtils(target);
  const isCheckable = isCheckbox || isRadio;
  const arrayByDefault = Array.isArray(defaultValue) || _isNil(defaultValue);
  const checkboxSet = new Set(Array.isArray(value) ? value : []);
  if (!isCheckable || isCheckable && !!target.checked) {
    if (isCheckbox) {
      checkboxSet.add(target.value);
      return arrayByDefault ? [...checkboxSet] : target.value;
    }
    return target.value;
  }
  if (isCheckbox && !target.checked) {
    checkboxSet.delete(target.value);
    return arrayByDefault ? _isNil(defaultValue) && checkboxSet.size === 0 ? undefined : [...checkboxSet] : undefined;
  }
  return undefined;
};
const formatValue = (value, formatOptions) => {
  if (!formatOptions) {
    return value;
  }
  const {
    valueAsNumber,
    valueAsDate,
    valueFormat,
    valueAsBoolean
  } = formatOptions;
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

export { formatValue, inputUtils, valueIfChecked };
//# sourceMappingURL=utils.js.map
