import type { FunctionBasedModifier } from 'ember-modifier';

export type HandlerEvent = 'onChange' | 'onSubmit' | 'onBlur' | 'onFocus';

export type GenericObject = Record<string, any>;

export type ValueKey<ObjectType extends GenericObject> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${ValueKey<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type RegisterModifier<Values extends GenericObject = GenericObject> = {
  Args: {
    Positional?: [ValueKey<Values> | undefined];
    Named?: RegisterOptions | undefined;
  };
  Element: Element;
};

export type FormidableErrors<T extends string | number | symbol = string | number | symbol> =
  Record<T, FormidableError[]>;

export type DirtyFields<Values extends GenericObject = GenericObject> = Record<
  ValueKey<Values>,
  boolean
>;

export type InvalidFields<Values extends GenericObject = GenericObject> = Record<
  ValueKey<Values>,
  boolean
>;

export type NativeValidations<Values extends GenericObject = GenericObject> = Record<
  ValueKey<Values>,
  ValidationRules
>;

export type ValidationRules = Record<
  'required' | 'maxLength' | 'minLength' | 'max' | 'min' | 'pattern',
  boolean | string | number | undefined | RegExp
>;

export type FormatOptions = Pick<
  RegisterOptions,
  'valueAsDate' | 'valueAsNumber' | 'valueFormat' | 'valueAsBoolean'
>;

export type Parser<Values extends GenericObject = GenericObject> = Record<
  ValueKey<Values>,
  FormatOptions
>;

export type ResolverOptions<Options extends GenericObject = GenericObject> = {
  /**
   * @default async
   */
  mode?: 'async' | 'sync';
  /**
   * @default false
   */
  shouldUseNativeValidation?: boolean;
  /**
   * @default false
   */
  nativeValidations?: NativeValidations;
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
export interface FieldState {
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
  error?: FormidableError[];
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
  setValue: (field: ValueKey<Values>, value: any, context?: SetContext) => void;

  /**
   * This function get the field's value.
   */
  getValue: (field: ValueKey<Values>) => any;

  /**
   * This function return all the field values.
   *
   * Same result as `values` (work as an alias).
   */
  getValues: () => Values;

  /**
   * This function get the field's default value.
   *
   * Mostly to use if you have conflicts with the field name/type that can happen for arrays and objects
   *
   * @example
   * api.getDefaultValue "foo.1"
   * api.getDefaultValue "foo.bar"
   */
  getDefaultValue: (field: ValueKey<Values>) => any;

  /**
   * This function get the field's state.- Dirty/Pristine - Valid/Errors
   */
  getFieldState: (field: ValueKey<Values>) => FieldState;

  /**
   * Modifier that allows you to listen to the input changes, and incorporate its value to the update listeners.
   */
  register: FunctionBasedModifier<RegisterModifier<Values>>;

  /**
   * This function allows you to unregister a field.
   */
  unregister: (field: ValueKey<Values>, ontext?: UnregisterContext) => void;

  /**
   * This functions is a submit handler that validates the form,
   * and trigger the `onSubmit` method if defined in the `args`.
   * If onSubmit is unspecified, and the `handleOn` includes `onSubmit`, triggers `handler`.
   */
  onSubmit: (e?: SubmitEvent) => void;

  /**
   * This function either validate all the form, or one field if specified.
   */
  validate: (field?: ValueKey<Values>) => void;

  /**
   * The fields' errors.
   */
  errors: FormidableErrors<ValueKey<Values>>;

  /**
   * An array of all the error messages.
   */
  errorMessages: string[];

  /**
   * This function get the field's error.
   */
  getError: (field: ValueKey<Values>) => FormidableError[] | undefined;

  /**
   * The function allows you to manually set one error.
   */
  setError: (key: ValueKey<Values>, value: string | FormidableError) => void;

  /**
   * This function can manually clear a field's error.
   */
  clearError: (key: ValueKey<Values>) => void;

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
  rollback: (name?: ValueKey<Values>, context?: RollbackContext) => void;

  /**
   * This function resets all the invalid fields.
   *
   * You can set the context the same way you are rollbacking a field.
   */
  rollbackInvalid: (context?: RollbackContext) => void;

  /**
   * This function will allow users to programmatically focus on input.
   * Make sure input's ref is registered into the hook form.
   */
  setFocus: (name: ValueKey<Values>) => void;

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
  invalidFields: Record<ValueKey<Values>, boolean>;

  /**
   * 	Set to `true` after the user modifies any of the inputs.
   */
  isDirty: boolean;

  /**
   * An object with the user-modified fields.
   * If some dirty fields are set manually, the value must be different from the default one to be dirty.
   */
  dirtyFields: Record<ValueKey<Values>, boolean>;

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

  validator?: (
    values: Values | Partial<Values>,
    options: ResolverOptions<Options>,
  ) => FormidableErrors<ValueKey<Values>> | Promise<FormidableErrors<ValueKey<Values>>>;

  /**
   * If you need a context for your validator to work, you can pass it via this property.
   */
  validatorOptions?: ResolverOptions<Options>;

  /**
   * This function is triggered depending on `handleOn`.
   *
   * It is called after validation if there is one.
   *
   * It can be overriden by custom handlers when you register an input,
   * or by the `onSubmit` argument.
   */
  handler?: (
    data: Values,
    api: FormidableApi<Values>,
    event: Event | undefined,
    eventType: HandlerEvent,
  ) => void;

  /**
   * The initial data the form will use to pre-populate the fields.
   */
  onChange?: (event: Event, api: FormidableApi<Values>) => void;

  /**
   * This functions gets triggered when the form is submitted.
   *
   * You can either use this method to deal with the data,
   * or use the handleOn `onSubmit` and `handler` method to have the values directly as params,
   * but not both! `onSubmit` is called in priority.
   *
   */
  onSubmit?: (values: Values, api: FormidableApi<Values>, event?: SubmitEvent) => void;

  /**
   * An record that specifies when to trigger `handler` and validation.
   * @default ['onSubmit']
   */
  handleOn?: HandlerEvent[];

  /**
   * An record that specifies when to trigger `handler` and validation.
   * @default  ['onBlur', 'onSubmit']
   */
  validateOn?: HandlerEvent[];

  /**
   * An record that specifies when to trigger `handler` and validation.
   * @default  ['onChange', 'onSubmit']
   */
  revalidateOn?: HandlerEvent[];

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
  valueFormat?: (value: unknown) => any;

  // Handlers

  /**
   * This function is a custom event that is triggered by the change of this input and only applies for this one.
   *
   * If this is specified, it does not trigger `handler`.
   */
  onChange?: (event: Event, api: FormidableApi<Values>) => void;

  /**
   * This function is a custom event that is triggered by the blur of this input and only applies for this one.
   *
   * If this is specified, it does not trigger `handler`.
   */
  onBlur?: (event: Event, api: FormidableApi<Values>) => void;

  /**
   * This function is a custom event that is triggered by the focus of this input and only applies for this one.
   *
   * If this is specified, it does not trigger `handler`.
   */
  onFocus?: (event: Event, api: FormidableApi<Values>) => void;
}
