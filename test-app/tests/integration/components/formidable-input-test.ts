/* eslint-disable qunit/require-expect */
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import ParentModel from 'test-app/models/parent';
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

  test('Values -- It should update the value -- text', async function (this: FormidableContext, assert) {
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

  test('Values -- It should update the value -- number', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 3,
    };
    this.onUpdate = (data: { foo: number }) => {
      assert.strictEqual(data.foo, 5);
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo" valueAsNumber=true}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#foo').hasValue('3');
    await fillIn('#foo', '5');
    await click('#submit');
  });

  test('Values -- It should update the value -- date', async function (this: FormidableContext, assert) {
    this.values = {
      foo: new Date('2000-05-05'),
    };
    this.onUpdate = (data: { foo: Date }) => {
      assert.deepEqual(data.foo, new Date('2001-05-05'));
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo" valueAsDate=true}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert
      .dom('#foo')
      .hasValue(
        'Fri May 05 2000 02:00:00 GMT+0200 (Central European Summer Time)'
      );
    await fillIn('#foo', '2001-05-05');
    await click('#submit');
  });

  test('Values -- It should update the value -- object', async function (this: FormidableContext, assert) {
    this.values = {
      foo: { bar: 'DEFAULT' },
    };
    this.onUpdate = (data: { foo: { bar: string } }) => {
      assert.strictEqual(data.foo.bar, 'CHANGED');
    };

    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo.bar"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    await click('#submit');
  });

  test('Values -- It should update the value -- array', async function (this: FormidableContext, assert) {
    this.values = {
      foo: ['A', 'B'],
    };
    this.onUpdate = (data: { foo: string[] }) => {
      assert.deepEqual(data.foo, ['*', '**']);
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo0" {{api.register "foo.0"}} />
          <input type="text" id="foo1" {{api.register "foo.1"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#foo0').hasValue('A');
    assert.dom('#foo1').hasValue('B');

    await fillIn('#foo0', '*');

    await fillIn('#foo1', '**');
    await click('#submit');
  });

  test('Values -- It should update the value -- model', async function (this: FormidableContext, assert) {
    const store = this.owner.lookup('service:store');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const child = store.createRecord('child', {
      str: 'Child',
      bool: false,
      num: 2,
      date: new Date('2000-01-01'),
      obj: { foo: { bar: 'Biz' }, ember: 'Ness' },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.values = store.createRecord('parent', {
      str: 'Parent',
      bool: true,
      num: 1,
      date: new Date('1999-01-01'),
      obj: { foo: { bar: 'Baz' }, ember: 'Formidable' },
      child,
    });
    this.onUpdate = (data: ParentModel) => {
      assert.deepEqual(data.str, 'New Parent');
      assert.false(data.bool);
      assert.deepEqual(data.num, 101);
      assert.strictEqual(data.date, new Date('2050-01-01'));
      assert.strictEqual(data.obj, { foo: { bar: 'Bisous' }, ember: 'Great' });
      assert.deepEqual(data.child.str, 'New Child');
      assert.true(data.child.bool);
      assert.deepEqual(data.child.num, 202);
      assert.strictEqual(data.child.date, new Date('1990-01-01'));
      assert.strictEqual(data.child.obj, {
        foo: { bar: 'Bonjour' },
        ember: 'Paris',
      });
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="parent-str" {{api.register "str"}} />
          <input type="checkbox" id="parent-bool" {{api.register "bool"}} />
          <input type="text" id="parent-num" {{api.register "num" valueAsNumber=true}} />
          <input type="text" id="parent-date" {{api.register "date" valueAsDate=true}} />
          <input type="text" id="parent-obj-foo" {{api.register "obj.foo.bar"}} />
          <input type="text" id="parent-obj-ember" {{api.register "obj.ember"}} />
          <input type="text" id="child-str" {{api.register "child.str"}} />
          <input type="checkbox" id="child-bool" {{api.register "child.bool"}} />
          <input type="text" id="child-num" {{api.register "child.num" valueAsNumber=true}} />
          <input type="text" id="child-date" {{api.register "child.date" valueAsDate=true}} />
          <input type="text" id="child-obj-foo" {{api.register "child.obj.foo.bar"}} />
          <input type="text" id="child-obj-ember" {{api.register "child.obj.ember"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#parent-str').hasValue('Parent');
    assert.dom('#parent-bool').isChecked();
    assert.dom('#parent-num').hasValue('1');
    assert.dom('#parent-date').hasValue(new Date('1999-01-01').toString());
    assert.dom('#parent-obj-foo').hasValue('Baz');
    assert.dom('#parent-obj-ember').hasValue('Formidable');
    assert.dom('#child-str').hasValue('Child');
    assert.dom('#child-bool').isNotChecked();
    assert.dom('#child-num').hasValue('2');
    assert.dom('#child-date').hasValue(new Date('2000-01-01').toString());
    assert.dom('#child-obj-foo').hasValue('Biz');
    assert.dom('#child-obj-ember').hasValue('Ness');

    await fillIn('#parent-str', 'New Parent');
    await click('#parent-bool');
    await fillIn('#parent-num', '101');
    await fillIn('#parent-date', new Date('2050-01-01').toString());
    await fillIn('#parent-obj-foo', 'Bisous');
    await fillIn('#parent-obj-ember', 'Great');
    await fillIn('#child-str', 'New Child');
    await click('#child-bool');
    await fillIn('#child-num', '202');
    await fillIn('#child-date', new Date('1990-01-01').toString());
    await fillIn('#child-obj-foo', 'Bonjour');
    await fillIn('#child-obj-ember', 'Paris');

    await click('#submit');
  });
});
