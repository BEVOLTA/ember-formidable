/* eslint-disable qunit/require-expect */
import { on } from '@ember/modifier';
import { get } from '@ember/object';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable, yupResolver } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { fn } from 'test-app/tests/utils/helpers';
import * as yup from 'yup';

import type { FormidableArgs,HandlerEvent } from 'ember-formidable';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('rollback -- text -- no options -- It should rollback the value', async function (assert) {
    const data = {
      foo: 'DEFAULT',
    };

    const handler: FormidableArgs<typeof data>['handler'] = (_data, api) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @handler={{handler}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          {{#if api.isSubmitted}}
            <p id='is-submitted'>SUBMITTED</p>
          {{/if}}
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    assert.dom('#foo').hasValue('DEFAULT');

    await fillIn('#foo', 'CHANGED');
    assert.dom('#foo').hasValue('CHANGED');
    await click('#submit');
    assert.dom('#foo').hasValue('DEFAULT');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('rollback -- defaultValue -- The default value should be reset', async function (assert) {
    const data: { foo: string; bar?: string } = {
      foo: 'DEFAULT',
    };
    const options = { defaultValue: 'Shiny and new!' };

    await render(<template>
      <Formidable @values={{data}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <input type='text' id='bar' {{api.register 'bar'}} />
          <button id='rollback' type='button' {{on 'click' (fn api.rollback 'foo' options)}}>
            ROLLBACK
          </button>
          <p id='df-foo'>{{get api.defaultValues 'foo'}}</p>
        </form>
      </Formidable>
    </template>);

    assert.dom('#df-foo').hasText('DEFAULT');
    await fillIn('#foo', 'UPDATED');
    await click('#rollback');
    assert.dom('#df-foo').hasText('Shiny and new!');
    assert.dom('#foo').hasValue('Shiny and new!');
  });

  test('rollback -- number -- no options -- It should rollback the value ', async function (assert) {
    const data = {
      foo: 404,
    };

    const handler: FormidableArgs<typeof data>['handler'] = (_data, api) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @handler={{handler}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo' valueAsNumber=true}} />
          {{#if api.isSubmitted}}
            <p id='is-submitted'>SUBMITTED</p>
          {{/if}}
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo').hasValue('404');
    await fillIn('#foo', '5');
    assert.dom('#foo').hasValue('5');
    await click('#submit');
    assert.dom('#foo').hasValue('404');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('rollback -- date -- no options -- It should rollback the value ', async function (assert) {
    const data = {
      foo: new Date('2000-05-05'),
    };

    const handler: FormidableArgs<typeof data>['handler'] = (_data, api) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @handler={{handler}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo' valueAsDate=true}} />
          {{#if api.isSubmitted}}
            <p id='is-submitted'>SUBMITTED</p>
          {{/if}}
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo').hasValue(new Date('2000-05-05').toString());
    await fillIn('#foo', '2001-05-05');
    assert.dom('#foo').hasValue(new Date('2001-05-05').toString());
    await click('#submit');
    assert.dom('#foo').hasValue(new Date('2000-05-05').toString());
    assert.dom('#is-submitted').doesNotExist();
  });

  test('rollback -- object -- no options -- It should rollback the value ', async function (assert) {
    const data = {
      foo: { bar: 'DEFAULT' },
    };

    const handler: FormidableArgs<typeof data & { 'foo.bar'?: string }>['handler'] = (
      _data,
      api,
    ) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @handler={{handler}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo.bar'}} />
          {{#if api.isSubmitted}}
            <p id='is-submitted'>SUBMITTED</p>
          {{/if}}
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    assert.dom('#foo').hasValue('CHANGED');
    await click('#submit');
    assert.dom('#foo').hasValue('DEFAULT');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('rollback -- array -- no options -- It should rollback the value ', async function (assert) {
    const data = {
      foo: ['A', 'B'],
    };

    const handler: FormidableArgs<{
      foo: string[];
    }>['handler'] = (_data, api) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @handler={{handler}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo0' {{api.register 'foo.0'}} />
          <input type='text' id='foo1' {{api.register 'foo.1'}} />
          {{#if api.isSubmitted}}
            <p id='is-submitted'>SUBMITTED</p>
          {{/if}}
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo0').hasValue('A');
    assert.dom('#foo1').hasValue('B');

    await fillIn('#foo0', '*');
    await fillIn('#foo1', '**');
    assert.dom('#foo0').hasValue('*');
    assert.dom('#foo1').hasValue('**');
    await click('#submit');
    assert.dom('#foo0').hasValue('A');
    assert.dom('#foo1').hasValue('B');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('rollbackInvalid -- It should rollback the invalid value', async function (assert) {
    const user = {
      name: 'Emma Watson',
      age: 34,
      email: 'emma.watson@example.com',
      gender: 'male',
    };

    const validator = yupResolver(
      yup.object({
        name: yup.string().required('Name is required.'),
        age: yup
          .number()
          .required('Age is required.')
          .positive('Age must be positive.')
          .integer('Age must be an integer.'),
        email: yup.string().email('Invalid email format.'),
        gender: yup.mixed().oneOf(['male', 'female', 'other'], 'Invalid gender.'),
      }),
    );

    const onChange: HandlerEvent[] = ['onChange'];

    await render(<template>
      <Formidable
        @values={{user}}
        @validator={{validator}}
        @handleOn={{onChange}}
        @validateOn={{onChange}}
        as |values api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <input type='number' id='age' {{api.register 'age'}} />
          <input type='text' id='email' {{api.register 'email'}} />
          <input type='text' id='gender' {{api.register 'gender'}} />
          <button id='rollback' type='button' {{on 'click' (fn api.rollbackInvalid undefined)}}>
            ROLLBACK
          </button>
          <p id='value-name'>{{api.getValue 'name'}}</p>
          <p id='value-age'>{{api.getValue 'age'}}</p>
          <p id='value-email'>{{api.getValue 'email'}}</p>
          <p id='value-gender'>{{api.getValue 'gender'}}</p>
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await fillIn('#age', '-2.4');
    await fillIn('#gender', 'female');

    await click('#rollback');
    assert.dom('#value-name').hasText('Emma Watson');
    assert.dom('#value-age').hasText('34');
    assert.dom('#value-email').hasText('emma.watson@example.com');
    assert.dom('#value-gender').hasText('female');
  });
});
