import { FunctionBasedModifier } from 'ember-modifier';

export type UpdateEvents = 'onChange' | 'onSubmit' | 'onBlur' | 'onFocus';

export type GenericObject = Record<string, any>;

export type FormidableErrors<
  T extends string | number | symbol = string | number | symbol,
> = Record<T, FormidableError[]>;

export type DirtyFields<Values extends GenericObject = GenericObject> = Record<
  keyof Values,
  boolean
>;

export type InvalidFields<Values extends GenericObject = GenericObject> =
  Record<keyof Values, boolean>;

export type FormatOptions = Pick<
  RegisterOptions,
  'valueAsDate' | 'valueAsNumber' | 'valueFormat' | 'valueAsBoolean'
>;

export type Parser<Values extends GenericObject = GenericObject> = Record<
  keyof Values,
  FormatOptions
>;
export interface FormidableError {
  type: string;
  message: string;
  value: unknown;
}

export interface RollbackContext {
  keepError?: boolean;
  keepDirty?: boolean;
  defaultValue?: boolean;
}

export interface SetContext {
  shouldValidate?: boolean;
  shouldDirty?: boolean;
}

export interface UnregisterContext {
  keepError?: boolean;
  keepDirty?: boolean;
  keepValue?: boolean;
  keepDefaultValue?: boolean;
}
export interface FieldState {
  isDirty: boolean;
  isPristine: boolean;
  isInvalid: boolean;
  error?: object;
}

export interface FormidableApi<Values extends GenericObject = GenericObject> {
  values: Values;
  setValue: (
    key: keyof Values,
    value: string | boolean,
    context?: SetContext,
  ) => void;
  getValue: (key: keyof Values) => unknown;
  getValues: () => Values;
  getFieldState: (name: keyof Values) => FieldState;
  register: FunctionBasedModifier<{
    Args: {
      Positional: [keyof Values];
      Named: RegisterOptions;
    };
    Element: HTMLInputElement;
  }>;
  unregister: (name: keyof Values, ontext?: UnregisterContext) => void;
  onSubmit: (e: SubmitEvent) => void;
  validate: () => void;
  errors: FormidableErrors<keyof Values>;
  errorMessages: string[];
  setError: (key: keyof Values, value: string | FormidableError) => void;
  clearError: (key: keyof Values) => void;
  clearErrors: () => void;
  rollback: (name?: keyof Values, context?: RollbackContext) => void;
  setFocus: (name: keyof Values) => void;
  defaultValues: Values;
  isSubmitted: boolean;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean | undefined;
  submitCount: number;
  isValid: boolean;
  isInvalid: boolean;
  isValidating: boolean;
  invalidFields: Record<keyof Values, boolean>;
  isDirty: boolean;
  dirtyFields: Record<keyof Values, boolean>;
  isPristine: boolean;
}
export interface FormidableArgs<Values extends GenericObject = GenericObject> {
  serviceId?: string;
  values?: Values;
  validator?: Function;
  validatorOptions?: any;
  onValuesChanged?: (data: Values, api: FormidableApi<Values>) => void;
  onChange?: (event: Event, api: FormidableApi<Values>) => void;
  onSubmit?: (event: SubmitEvent, api: FormidableApi<Values>) => void;
  updateEvents?: UpdateEvents[];
  shouldUseNativeValidation?: boolean;
}

export interface RegisterOptions<Values extends GenericObject = GenericObject> {
  // HTML Input attributes
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
  pattern?: RegExp | string;

  // Format
  valueAsBoolean?: boolean;
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
  valueFormat: (value: unknown) => any;

  // Handlers
  onChange?: (event: Event, api: FormidableApi<Values>) => void;
  onBlur?: (event: Event, api: FormidableApi<Values>) => void;
  onFocus?: (event: Event, api: FormidableApi<Values>) => void;
}
