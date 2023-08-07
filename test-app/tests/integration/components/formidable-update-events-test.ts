/* eslint-disable qunit/require-expect */
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';

import { click, fillIn, render } from '@ember/test-helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('UpdateEvents -- onSubmit -- It should be triggred on specified updated events', async function (this: FormidableContext & {
    counter: number;
  }, assert) {
    this.updateEvents = ['onSubmit'];

    this.counter = 0;
    this.onUpdate = () => {
      this.counter += 1;
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await fillIn('#foo', 'UPDATED');
    await click('#submit');
    await fillIn('#foo', 'UPDATED AGAIN');

    assert.strictEqual(this.counter, 1);
  });

  test('UpdateEvents -- onChange -- It should be triggred on specified updated events ', async function (this: FormidableContext & {
    counter: number;
  }, assert) {
    this.counter = 0;
    this.onUpdate = () => {
      this.counter += 1;
    };
    this.updateEvents = ['onChange'];

    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await fillIn('#foo', 'UPDATED');
    await click('#submit');
    await fillIn('#foo', 'UPDATED AGAIN');

    assert.strictEqual(this.counter, 2);
  });

  test('UpdateEvents -- onChange + onSubmit -- It should be triggred on specified updated events ', async function (this: FormidableContext & {
    counter: number;
  }, assert) {
    this.counter = 0;
    this.onUpdate = () => {
      this.counter += 1;
    };
    this.updateEvents = ['onChange', 'onSubmit'];
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await fillIn('#foo', 'UPDATED');
    await click('#submit');
    await fillIn('#foo', 'UPDATED AGAIN');
    await fillIn('#foo', 'UPDATED AGAIN AND AGAIN');

    assert.strictEqual(this.counter, 4);
  });

  test('UpdateEvents -- onBlur -- It should be triggred on specified updated events ', async function (this: FormidableContext & {
    counter: number;
  }, assert) {
    this.counter = 0;
    this.onUpdate = () => {
      this.counter += 1;
    };
    this.updateEvents = ['onBlur'];
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await click('#foo');
    await click('#submit');

    assert.strictEqual(this.counter, 1);
  });
});
