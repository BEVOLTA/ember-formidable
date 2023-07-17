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

  test('Rollback -- It should rollback the value -- text -- no options', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };
    this.onUpdate = (
      _data,
      api: { rollback: () => void; isSubmitted: boolean }
    ) => {
      api.rollback();
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <p id="isSubmitted">{{api.isSubmitted}}</p>
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    assert.dom('#foo').hasValue('DEFAULT');

    await fillIn('#foo', 'CHANGED');
    assert.dom('#foo').hasValue('CHANGED');
    await click('#submit');
    assert.dom('#foo').hasValue('DEFAULT');
    assert.dom('#isSubmitted').hasText('false');
  });

  test('Rollback -- It should rollback the value -- number -- no options', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 404,
    };
    this.onUpdate = (
      _data,
      api: { rollback: () => void; isSubmitted: boolean }
    ) => {
      api.rollback();
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo" valueAsNumber=true}} />
          <p id="isSubmitted">{{api.isSubmitted}}</p>
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#foo').hasValue('404');
    await fillIn('#foo', '5');
    assert.dom('#foo').hasValue('5');
    await click('#submit');
    assert.dom('#foo').hasValue('404');
    assert.dom('#isSubmitted').hasText('false');
  });

  test('Rollback -- It should rollback the value -- date -- no options', async function (this: FormidableContext, assert) {
    this.values = {
      foo: new Date('2000-05-05'),
    };
    this.onUpdate = (
      _data,
      api: { rollback: () => void; isSubmitted: boolean }
    ) => {
      api.rollback();
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo" valueAsDate=true}} />
          <p id="isSubmitted">{{api.isSubmitted}}</p>
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#foo').hasValue(new Date('2000-05-05').toString());
    await fillIn('#foo', '2001-05-05');
    assert.dom('#foo').hasValue(new Date('2001-05-05').toString());
    await click('#submit');
    assert.dom('#foo').hasValue(new Date('2000-05-05').toString());
    assert.dom('#isSubmitted').hasText('false');
  });

  test('Rollback -- It should rollback the value -- object -- no options', async function (this: FormidableContext, assert) {
    this.values = {
      foo: { bar: 'DEFAULT' },
    };
    this.onUpdate = (
      _data,
      api: { rollback: () => void; isSubmitted: boolean }
    ) => {
      api.rollback();
    };

    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo.bar"}} />
          <p id="isSubmitted">{{api.isSubmitted}}</p>
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    assert.dom('#foo').hasValue('CHANGED');
    await click('#submit');
    assert.dom('#foo').hasValue('DEFAULT');
    assert.dom('#isSubmitted').hasText('false');
  });

  test('Rollback -- It should rollback the value -- array -- no options', async function (this: FormidableContext, assert) {
    this.values = {
      foo: ['A', 'B'],
    };
    this.onUpdate = (
      _data,
      api: { rollback: () => void; isSubmitted: boolean }
    ) => {
      api.rollback();
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo0" {{api.register "foo.0"}} />
          <input type="text" id="foo1" {{api.register "foo.1"}} />
          <p id="isSubmitted">{{api.isSubmitted}}</p>
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#foo0').hasValue('A');
    assert.dom('#foo1').hasValue('B');

    await fillIn('#foo0', '*');
    await fillIn('#foo1', '**');
    assert.dom('#foo0').hasValue('*');
    assert.dom('#foo1').hasValue('**');
    await click('#submit');
    assert.dom('#foo0').hasValue('A');
    assert.dom('#foo1').hasValue('B');
    assert.dom('#isSubmitted').hasText('false');
  });
});
