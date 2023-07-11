import { TestContext } from '@ember/test-helpers';

export interface FormidableContext extends TestContext {
  // -- ARGS
  values: Record<string, any>;
  validator?: () => void;
  validatorOptions?: any;
  onValuesChanged: (data: Record<string, any>, api: any) => void;
  onChange?: (event: Event, api: any) => void;
  onSubmit?: (event: SubmitEvent, api: any) => void;
  updateEvents?: string[];
  shouldUseNativeValidation?: boolean;

  // -- HANDLERS
  onUpdate: (values: any) => void;
}
