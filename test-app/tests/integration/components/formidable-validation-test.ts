/* eslint-disable qunit/require-expect */
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';

import { click, fillIn, render } from '@ember/test-helpers';

// values: Values;
// validator?: Function;
// validatorOptions?: any;
// onValuesChanged: (data: Values, api: any) => void;
// onChange?: (event: Event, api: any) => void;
// onSubmit?: (event: SubmitEvent, api: any) => void;
// updateEvents?: TUpdateEvents[];
// shouldUseNativeValidation?: boolean;

// return {
//   values: this.parsedValues,
//   setValue: this.setValue,
//   getValue: this.getValue,
//   getValues: this.getValues,
//   register: this.register,
//   onSubmit: (e: SubmitEvent) => this.submit.perform(e),
//   validate: this.validate,
//   errors: this.errors,
//   setError: this.setError,
//   clearError: this.clearError,
//   clearErrors: this.clearErrors,
//   defautlValues: this.rollbackValues,
//   isSubmitting: this.isSubmitting,
//   isValid: this.isValid,
//   isValidating: this.isValidating,
//   invalidFields: this.invalidFields,
//   isDirty: this.isDirty,
//   dirtyFields: this.dirtyFields,
//   isPristine: this.isPristine,
// };

// interface RegisterOptions {
//   // HTML Input attributes
//   disabled?: boolean;
//   required?: boolean;
//   maxLength?: number;
//   minLength?: number;
//   max?: number;
//   min?: number;
//   valueAsNumber?: boolean;
//   valueAsDate?: boolean;
//   pattern?: RegExp | string;
//   onChange?: (event: Event) => void;
//   onBlur?: (event: Event) => void;
// }
module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: FormidableContext) {
    this.values = {
      foo: 'DEFAULT',
    };

    this.updateEvents = ['onSubmit'];
  });

  test('Values -- It should update the value -- onChange -- text', async function (this: FormidableContext, assert) {
    this.onUpdate = (data: { foo: string }) => {
      assert.strictEqual(data.foo, 'CHANGED');
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    await click('#submit');
  });
});
