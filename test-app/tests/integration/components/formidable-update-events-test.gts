/* eslint-disable qunit/require-expect */
import { on } from '@ember/modifier';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';

import type { HandlerEvent } from 'ember-formidable';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('handleOn -- onSubmit -- It should be triggered on specified updated handleOn', async function (assert) {
    const handleOn: HandlerEvent[] = ['onSubmit'];

    let counter = 0;

    const handler = () => {
      counter += 1;
    };

    await render(<template>
      <Formidable @handler={{handler}} @handleOn={{handleOn}} as |api|>
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

  test('handleOn -- onChange -- It should be triggered on specified updated handleOn ', async function (assert) {
    const handleOn: HandlerEvent[] = ['onChange'];

    let counter = 0;

    const handler = () => {
      counter += 1;
    };

    await render(<template>
      <Formidable @handler={{handler}} @handleOn={{handleOn}} as |api|>
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

  test('handleOn -- onChange + onSubmit -- It should be triggered on specified updated handleOn ', async function (assert) {
    const handleOn: HandlerEvent[] = ['onChange', 'onSubmit'];

    let counter = 0;

    const handler = () => {
      counter += 1;
    };

    await render(<template>
      <Formidable @handler={{handler}} @handleOn={{handleOn}} as |api|>
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

  test('handleOn -- onBlur -- It should be triggered on specified updated handleOn ', async function (assert) {
    const handleOn: HandlerEvent[] = ['onBlur'];

    let counter = 0;

    const handler = () => {
      counter += 1;
    };

    await render(<template>
      <Formidable @handler={{handler}} @handleOn={{handleOn}} as |api|>
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
