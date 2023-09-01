/* eslint-disable qunit/require-expect */
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { get } from '@ember/object';
import { click, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { yupValidator } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';
import * as yup from 'yup';

// Define a schema for a user object
const userSchema = yup.object({
  // Basic string property with required validation
  name: yup.string().required('Name is required.'),
});

// Example usage of the user schema
const validUser = {
  name: 'John Doe',
};

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('Get/Set/Default Value -- It should update the value -- text', async function (assert) {
    const data = {
      foo: 'BAR',
    };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <button
          id='change'
          type='button'
          {{on 'click' (fn api.setValue 'foo' 'CHANGED' undefined)}}
        >CHANGE</button>
        <p id='value'>{{api.getValue 'foo'}}</p>
        <p id='default'>{{api.defaultValues.foo}}</p>
      </Formidable>
    </template>);
    await click('#change');
    assert.dom('#value').hasText('CHANGED');
    assert.dom('#default').hasText('BAR');
  });

  test('Get/Set/Default Value -- It should update the value -- number', async function (assert) {
    const data = {
      foo: 202,
    };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <button
          id='change'
          type='button'
          {{on 'click' (fn api.setValue 'foo' 505 undefined)}}
        >CHANGE</button>
        <p id='value'>{{api.getValue 'foo'}}</p>
        <p id='default'>{{api.defaultValues.foo}}</p>
      </Formidable>
    </template>);
    await click('#change');
    assert.dom('#value').hasText('505');
    assert.dom('#default').hasText('202');
  });

  test('Get/Set/Default Value -- It should update the value -- date', async function (assert) {
    const date = new Date('1996-12-02');

    const data = {
      foo: new Date('1990-04-10').toString(),
    };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <button
          id='change'
          type='button'
          {{on 'click' (fn api.setValue 'foo' date undefined)}}
        >CHANGE</button>
        <p id='value'>{{api.getValue 'foo'}}</p>
        <p id='default'>{{api.defaultValues.foo}}</p>
      </Formidable>
    </template>);
    await click('#change');
    assert.dom('#value').hasText(new Date('1996-12-02').toString());
    assert.dom('#default').hasText(new Date('1990-04-10').toString());
  });

  test('Get/Set/Default Value -- It should update the value -- object', async function (assert) {
    const data: {
      foo: { bar: string };
    } = {
      foo: { bar: 'Tequila' },
    };
    const bar = { bar: 'Sunrise!' };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <button
          id='change'
          type='button'
          {{on 'click' (fn api.setValue 'foo' bar undefined)}}
        >CHANGE</button>
        <p id='value'>{{api.getValue 'foo.bar'}}</p>
        <p id='default'>{{api.defaultValues.foo.bar}}</p>
      </Formidable>
    </template>);
    await click('#change');
    assert.dom('#value').hasText('Sunrise!');
    assert.dom('#default').hasText('Tequila');
  });

  test('Get/Set/Default Value -- It should update the value -- array', async function (assert) {
    const data: {
      foo: string[];
    } = {
      foo: ['🐡', '🐟'],
    };
    const fishes = ['🍤', '🍣'];

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <button
          id='change'
          type='button'
          {{on 'click' (fn api.setValue 'foo' fishes undefined)}}
        >CHANGE</button>
        <p id='value0'>{{api.getValue 'foo.0'}}</p>
        <p id='value1'>{{api.getValue 'foo.1'}}</p>
        <p id='default0'>{{api.getDefaultValue 'foo.0'}}</p>
        <p id='default1'>{{api.getDefaultValue 'foo.1'}}</p>
      </Formidable>
    </template>);
    await click('#change');
    assert.dom('#value0').hasText('🍤');
    assert.dom('#value1').hasText('🍣');
    assert.dom('#default0').hasText('🐡');
    assert.dom('#default1').hasText('🐟');
  });

  test('Get Values -- It should get all the values', async function (assert) {
    const data = {
      foo: 'BAR',
      bizz: 'Buzz',
    };

    const renderValues = (values: object) => {
      return Object.values(values);
    };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        {{#each (renderValues (api.getValues)) as |value|}}
          <p id={{value}}>{{value}}</p>
        {{/each}}
      </Formidable>
    </template>);

    assert.dom('#BAR').hasText('BAR');
    assert.dom('#Buzz').hasText('Buzz');
  });

  test('SetValue -- shouldDirty -- It should update and dirty the field', async function (assert) {
    const data = {
      foo: 'BAR',
    };
    const options = { shouldDirty: true };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <button
          id='change'
          type='button'
          {{on 'click' (fn api.setValue 'foo' 'CHANGED' options)}}
        >CHANGE</button>
        <p id='value'>{{api.getValue 'foo'}}</p>
        {{#if (get api.dirtyFields 'foo')}}
          <p id='df-foo'>DIRTY</p>
        {{/if}}
      </Formidable>
    </template>);

    await click('#change');
    assert.dom('#df-foo').exists();
  });

  test('SetValue -- shouldValidate -- It should update and validate the field', async function (assert) {
    const validator = yupValidator(userSchema);

    const data = validUser;
    const options = { shouldValidate: true };

    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <button
          id='change'
          type='button'
          {{on 'click' (fn api.setValue 'name' '' options)}}
        >CHANGE</button>
        <p id='value'>{{api.getValue 'name'}}</p>
        {{#each api.errorMessages as |error|}}
          <p id='error'>{{error}}</p>
        {{/each}}
      </Formidable>
    </template>);

    await click('#change');
    assert.dom('#error').exists();
  });
});
