import type { FunctionBasedModifier } from 'ember-modifier';

export type UpdateEvents = 'onChange' | 'onSubmit' | 'onBlur' | 'onFocus';

export type GenericObject = Record<string, unknown>;

export type FormidableErrors<T extends string | number | symbol = string | number | symbol> =
  Record<T, FormidableError[]>;

export type DirtyFields<Values extends GenericObject = GenericObject> = Record<
  keyof Values,
  boolean
>;

export type InvalidFields<Values extends GenericObject = GenericObject> = Record<
  keyof Values,
  boolean
>;

export type FormatOptions = Pick<
  RegisterOptions,
  'valueAsDate' | 'valueAsNumber' | 'valueFormat' | 'valueAsBoolean'
>;

export type Parser<Values extends GenericObject = GenericObject> = Record<
  keyof Values,
  FormatOptions
>;

export type ResolverOptions<Options extends GenericObject = GenericObject> = {
  /**
   * @default async
   */
  mode?: 'async' | 'sync';
  /**
   * Return the raw input values rather than the parsed values.
   * @default false
   */
  raw?: boolean;
  /**
   * @default false
   */
  shouldUseNativeValidation?: boolean;
} & Options;
export interface FormidableError {
  /**
   * The specified reason validation may have failed.
   * @example "required" -  "type" -  "min" -  "max"
   */
  type: string;
  /**
   * The error message to display
   */
  message: string;
  /**
   * The current value of the invalid property.
   */
  value: unknown;
}

export interface RollbackContext {
  /**
   * When set to true, field errors will be kept.
   */
  keepError?: boolean;

  /**
   * When set to true, `dirtyFields` will be kept.
   */
  keepDirty?: boolean;

  /**
   * When this value is not provided, field will be revert back to it's `defaultValue`.
   * When this value is provided:
   * - field will be updated with the supplied value.
   * - field's `defaultValue` will be updated to this value.
   */
  defaultValue?: unknown;
}

export interface SetContext {
  /**
   * When set to true, will trigger the validation of the field.
   */
  shouldValidate?: boolean;

  /**
   * When set to true, `dirtyFields` will be updated with that field.
   */
  shouldDirty?: boolean;
}

/**
 * Allows you to unregister a field.
 * Caution - Once you've unregistered an element, you can not register it again with the form.
 * You will need to unset the formidable attribute on this element to register it again, but this can cause troubleshoot.
 */
export interface UnregisterContext {
  /**
   * When set to true, field errors will be kept.
   */
  keepError?: boolean;

  /**
   * When set to true, `dirtyFields` will be kept.
   */
  keepDirty?: boolean;

  /**
   * When set to true, `value` will be kept.
   */
  keepValue?: boolean;

  /**
   * When set to true, field's `defaultValue` will be kept.
   */
  keepDefaultValue?: boolean;
}

/**
 * The field's state.
 * Checks if the field had a dirty or invalid state.
 */
export interface FieldState<Values extends GenericObject = GenericObject> {
  /**
   * Checks if the field has changed / is not pristine.
   */
  isDirty: boolean;

  /**
   * Checks if the field has not been changed / is not dirty.
   */
  isPristine: boolean;

  /**
   * Checks if the field checks validation.
   */
  isInvalid: boolean;

  /**
   * Retrieve the field's error.
   */
  error?: FormidableErrors<keyof Values>;
}

/**
 * Formidable API.
 */
export interface FormidableApi<Values extends GenericObject = GenericObject> {
  /**
   * The values that will be updated by the form.
   * As a POJO, your initial object will not be muted.
   *
   * If you give an `ember-data` model, it will be muted directly.
   * If this is not the expected behavior, we suggest you to create a payload object and giving it to the form,
   * then update the model when the submit is successful.
   */
  values: Values;

  /**
   * This function set the value in a controlled fashion.
   */
  setValue: (field: keyof Values, value: string | boolean, context?: SetContext) => void;

  /**
   * This function get the field's value.
   */
  getValue: (field: keyof Values) => unknown;

  /**
   * This function return all the field values.
   *
   * Same result as `values` (work as an alias).
   */
  getValues: () => Values;

  /**
   * This function get the field's state.
   */
  getFieldState: (field: keyof Values) => FieldState;

  /**
   * The initial data the form will use to pre-populate the fields.
   */
  register: FunctionBasedModifier<{
    Args: {
      Positional: [keyof Values | undefined];
      Named: RegisterOptions;
    };
    Element: HTMLInputElement;
  }>;

  /**
   * This function allows you to unregister a field.
   */
  unregister: (field: keyof Values, ontext?: UnregisterContext) => void;

  /**
   * This functions is a submit handler that validates the form,
   * and trigger the `onSubmit` method if defined in the `args`.
   * If onSubmit is unspecified, and the `updateEvents` includes `onSubmit`, triggers `onValuesChanged`.
   */
  onSubmit: (e: SubmitEvent, api: FormidableApi<Values>) => void;

  /**
   * This function either validate all the form, or one field if specified.
   */
  validate: (field?: keyof Values) => void;

  /**
   * The fields' errors.
   */
  errors: FormidableErrors<keyof Values>;

  /**
   * An array of all the error messages.
   */
  errorMessages: string[];

  /**
   * The function allows you to manually set one error.
   */
  setError: (key: keyof Values, value: string | FormidableError) => void;

  /**
   * This function can manually clear a field's error.
   */
  clearError: (key: keyof Values) => void;

  /**
   * This function can manually clear all the errors in the form.
   */
  clearErrors: () => void;

  /**
   * This function resets the entire form state, or only a field if specified.
   *
   * You can keep the errors and dirty state if necessary.
   * By default, everything gets cleared.
   */
  rollback: (name?: keyof Values, context?: RollbackContext) => void;

  /**
   * This function will allow users to programmatically focus on input.
   * Make sure input's ref is registered into the hook form.
   */
  setFocus: (name: keyof Values) => void;

  /**
   * Default values for the form.
   * These are specified when values are set for the first time.
   * @default {}
   */
  defaultValues: Values;

  /**
   * Set to `true` after the form is submitted.
   *
   * Will remain `true` until the reset method is invoked.
   */
  isSubmitted: boolean;

  /**
   * Set to `true` if the form is currently being submitted. `false` otherwise.
   */
  isSubmitting: boolean;

  /**
   * Set to `true` if the form was successfully submitted without any runtime error.
   */
  isSubmitSuccessful: boolean | undefined;

  /**
   * Number of times the form was submitted, with or without success.
   */
  submitCount: number;

  /**
   * Set to `true` if the form doesn't have any errors.
   */
  isValid: boolean;

  /**
   * Set to `true` when the form has any error.
   */
  isInvalid: boolean;

  /**
   * Set to `true` during validation.
   */
  isValidating: boolean;

  /**
   * An object with the fields that got errors.
   */
  invalidFields: Record<keyof Values, boolean>;

  /**
   * 	Set to `true` after the user modifies any of the inputs.
   */
  isDirty: boolean;

  /**
   * An object with the user-modified fields.
   * If some dirty fields are set manually, the value must be different from the default one to be dirty.
   */
  dirtyFields: Record<keyof Values, boolean>;

  /**
   * 	Set to `true` after the user modifies any of the inputs.
   */
  isPristine: boolean;
}
export interface FormidableArgs<
  Values extends GenericObject = GenericObject,
  Options extends GenericObject = GenericObject,
> {
  /**
   * Id used by the formidable service to retrieve the formidable API.
   *
   * You do not have to give an id if you are not using the service.
   *
   * @example "update-user"
   */
  serviceId?: string;

  /**
   * The values that will be updated by the form.
   * As a POJO, your initial object will not be muted.
   *
   * If you give an `ember-data` model, it will be muted directly.
   * If this is not the expected behavior, we suggest you to create a payload object and giving it to the form,
   * then update the model when the submit is successful.
   */
  values?: Values;

  /**
   * This function validates the field to return a formatted error.
   */
  validator?: (values: Values, options: ResolverOptions<Options>) => FormidableErrors<keyof Values>;

  /**
   * If you need a context for your validator to work, you can pass it via this property.
   */
  validatorOptions?: ResolverOptions<Options>;

  /**
   * This function is triggered depending on the `updateEvents`.
   *
   * It is called after validation if there is one.
   *
   * It can be overriden by custom handlers when you register an input,
   * or by the `onSubmit` argument.
   */
  onValuesChanged?: (data: Values, api: FormidableApi<Values>) => void;

  /**
   * The initial data the form will use to pre-populate the fields.
   */
  onChange?: (event: Event, api: FormidableApi<Values>) => void;

  /**
   * This functions gets triggered when the form is submitted.
   *
   * You can either use this method to deal with the data,
   * or use the updateEvents `onSubmit` and `onValuesChanged` method to have the values directly as params,
   * but not both! `onSubmit` is called in priority.
   *
   */
  onSubmit?: (event: SubmitEvent, api: FormidableApi<Values>) => void;

  /**
   * An array that specifies when to trigger `onValuesChanged`.
   * @default ['onSubmit']
   */
  updateEvents?: UpdateEvents[];

  /**
   * If set to true, allows you to use the native input validation.
   * If set to false, the `invalid` event is not triggered.
   * @default false
   */
  shouldUseNativeValidation?: boolean;
}

export interface RegisterOptions<Values extends GenericObject = GenericObject> {
  // HTML Input attributes

  /**
   * If set to true, disable the input.
   *
   * If you register an element that is not a form element, adds the attribute `data-formidable-disabled`.
   */
  disabled?: boolean;

  /**
   * If set to true, add the `required` attribute to the input.
   *
   * If you register an element that is not a form element, adds the attribute `data-formidable-required`.
   */
  required?: boolean;

  /**
   * If set to true, add the `maxlength` attribute to the input.
   *
   * Works only on inputs and text areas.
   */
  maxLength?: number | string;

  /**
   * If set to true, add the `minlength` attribute to the input.
   *
   * Works only on inputs and text areas.
   */
  minLength?: number | string;

  /**
   * If set to true, add the `max` attribute to the input.
   *
   * Works only on inputs.
   */
  max?: number | string;

  /**
   * If set to true, add the `min` attribute to the input.
   *
   * Works only on inputs.
   */
  min?: number | string;

  /**
   * If set to true, add the `required` attribute to the input.
   *
   * Works only on inputs.
   */
  pattern?: RegExp | string;

  // Format

  /**
   * This function transforms the input as a boolean with `Boolean` if specified.
   */
  valueAsBoolean?: boolean;

  /**
   * This function transforms the input as a number if specified.
   */
  valueAsNumber?: boolean;

  /**
   * This function transforms the input as a date if specified.
   */
  valueAsDate?: boolean;

  /**
   * This function allows you to apply any parsing to the input if specified.
   */
  valueFormat: (value: unknown) => unknown;

  // Handlers

  /**
   * This function is a custom event that is triggered by the change of this input and only applies for this one.
   *
   * If this is specified, it does not trigger `onValuesChanged`.
   */
  onChange?: (event: Event, api: FormidableApi<Values>) => void;

  /**
   * This function is a custom event that is triggered by the blur of this input and only applies for this one.
   *
   * If this is specified, it does not trigger `onValuesChanged`.
   */
  onBlur?: (event: Event, api: FormidableApi<Values>) => void;

  /**
   * This function is a custom event that is triggered by the focus of this input and only applies for this one.
   *
   * If this is specified, it does not trigger `onValuesChanged`.
   */
  onFocus?: (event: Event, api: FormidableApi<Values>) => void;
}
