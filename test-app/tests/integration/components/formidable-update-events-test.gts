/* eslint-disable qunit/require-expect */
import { on } from '@ember/modifier';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';

import type { UpdateEvent } from 'ember-formidable';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('UpdateEvents -- onSubmit -- It should be triggered on specified updated events', async function (assert) {
    const updateEvents: UpdateEvent[] = ['onSubmit'];

    let counter = 0;

    const onUpdate = () => {
      counter += 1;
    };

    await render(<template>
      <Formidable @onUpdate={{onUpdate}} @updateEvents={{updateEvents}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await fillIn('#foo', 'UPDATED');
    await click('#submit');
    await fillIn('#foo', 'UPDATED AGAIN');

    assert.strictEqual(counter, 1);
  });

  test('UpdateEvents -- onChange -- It should be triggered on specified updated events ', async function (assert) {
    const updateEvents: UpdateEvent[] = ['onChange'];

    let counter = 0;

    const onUpdate = () => {
      counter += 1;
    };

    await render(<template>
      <Formidable @onUpdate={{onUpdate}} @updateEvents={{updateEvents}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await fillIn('#foo', 'UPDATED');
    await click('#submit');
    await fillIn('#foo', 'UPDATED AGAIN');

    assert.strictEqual(counter, 2);
  });

  test('UpdateEvents -- onChange + onSubmit -- It should be triggered on specified updated events ', async function (assert) {
    const updateEvents: UpdateEvent[] = ['onChange', 'onSubmit'];

    let counter = 0;

    const onUpdate = () => {
      counter += 1;
    };

    await render(<template>
      <Formidable @onUpdate={{onUpdate}} @updateEvents={{updateEvents}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await fillIn('#foo', 'UPDATED');
    await click('#submit');
    await fillIn('#foo', 'UPDATED AGAIN');
    await fillIn('#foo', 'UPDATED AGAIN AND AGAIN');

    assert.strictEqual(counter, 4);
  });

  test('UpdateEvents -- onBlur -- It should be triggered on specified updated events ', async function (assert) {
    const updateEvents: UpdateEvent[] = ['onBlur'];

    let counter = 0;

    const onUpdate = () => {
      counter += 1;
    };

    await render(<template>
      <Formidable @onUpdate={{onUpdate}} @updateEvents={{updateEvents}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await click('#foo');
    await click('#submit');

    assert.strictEqual(counter, 1);
  });
});
