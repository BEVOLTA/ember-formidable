import { TestContext } from '@ember/test-helpers';

export interface FormidableContext extends TestContext {
  // -- ARGS
  values: Record<string, unknown>;
  validator?: (schema: any) => void;
  validatorOptions?: unknown;
  onValuesChanged: (data: Record<string, unknown>, api: unknown) => void;
  onChange?: (event: Event, api: unknown) => void;
  onSubmit?: (event: SubmitEvent, api: unknown) => void;
  updateEvents?: string[];
  shouldUseNativeValidation?: boolean;

  // -- HANDLERS
  onUpdate: (values: any, api: any) => void;
}
