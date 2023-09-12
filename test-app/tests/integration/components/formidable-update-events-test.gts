/* eslint-disable qunit/require-expect */
import { on } from '@ember/modifier';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable, yupValidator } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';
import * as yup from 'yup';

import type { HandlerEvent } from 'ember-formidable';

const userSchema = yup.object({
  name: yup.string().required('Name is required.'),
});

const validUser = {
  name: 'John Doe',
};

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  const validator = yupValidator(userSchema);
  const user = validUser;

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

  test('validateOn -- onSubmit -- It should be triggered on specified updated validateOn', async function (assert) {
    const validateOn: HandlerEvent[] = ['onSubmit'];

    await render(<template>
      <Formidable @validator={{validator}} @values={{user}} @validateOn={{validateOn}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if (api.getError 'name')}}
            <p id='error'>ERROR</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').exists();
  });

  test('validateOn -- onChange -- It should be triggered on specified updated validateOn ', async function (assert) {
    const validateOn: HandlerEvent[] = ['onChange'];

    await render(<template>
      <Formidable @validator={{validator}} @values={{user}} @validateOn={{validateOn}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if (api.getError 'name')}}
            <p id='error'>ERROR</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    assert.dom('#error').exists();
  });

  test('validateOn -- onBlur -- It should be triggered on specified updated validateOn ', async function (assert) {
    const validateOn: HandlerEvent[] = ['onBlur'];

    await render(<template>
      <Formidable @validator={{validator}} @values={{user}} @validateOn={{validateOn}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='dummy' type='button'>DUMMY</button>
          {{#if (api.getError 'name')}}
            <p id='error'>ERROR</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#dummy');
    assert.dom('#error').exists();
  });

  test('revalidateOn -- onSubmit -- It should be triggered on specified updated revalidateOn', async function (assert) {
    const revalidateOn: HandlerEvent[] = ['onSubmit'];
    const validateOn: HandlerEvent[] = [];

    await render(<template>
      <Formidable
        @validator={{validator}}
        @values={{user}}
        @validateOn={{validateOn}}
        @revalidateOn={{revalidateOn}}
        as |api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if (api.getError 'name')}}
            <p id='error'>ERROR</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').doesNotExist();
    await click('#submit');
    assert.dom('#error').exists();
  });

  test('revalidateOn -- onChange -- It should be triggered on specified updated revalidateOn ', async function (assert) {
    const revalidateOn: HandlerEvent[] = ['onChange'];
    const validateOn: HandlerEvent[] = [];

    await render(<template>
      <Formidable
        @validator={{validator}}
        @validateOn={{validateOn}}
        @values={{user}}
        @revalidateOn={{revalidateOn}}
        as |api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if (api.getError 'name')}}
            <p id='error'>ERROR</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').doesNotExist();
    await fillIn('#name', '');
    assert.dom('#error').exists();
  });

  test('revalidateOn -- onBlur -- It should be triggered on specified updated revalidateOn ', async function (assert) {
    const revalidateOn: HandlerEvent[] = ['onBlur'];
    const validateOn: HandlerEvent[] = [];

    await render(<template>
      <Formidable
        @validateOn={{validateOn}}
        @validator={{validator}}
        @values={{user}}
        @revalidateOn={{revalidateOn}}
        as |api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='dummy' type='button'>DUMMY</button>
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if (api.getError 'name')}}
            <p id='error'>ERROR</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').doesNotExist();
    await click('#name');
    await click('#dummy');
    assert.dom('#error').exists();
  });
});
