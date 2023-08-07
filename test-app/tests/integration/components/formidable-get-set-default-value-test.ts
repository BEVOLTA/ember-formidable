/* eslint-disable qunit/require-expect */
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';
import { yupResolver } from 'test-app/tests/utils/resolvers/yup';
import * as yup from 'yup';

import { click, render } from '@ember/test-helpers';

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

  test('Get/Set/Default Value -- It should update the value -- text', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'BAR',
    };
    await render(hbs`
      <Formidable @values={{this.values}}  as |values api|>
          <button id="change" type="button" {{on "click" (fn api.setValue "foo" "CHANGED")}}>CHANGE</button>
          <p id="value">{{api.getValue "foo"}}</p>
          <p id="default">{{api.defaultValues.foo}}</p>
      </Formidable>
    `);
    await click('#change');
    assert.dom('#value').hasText('CHANGED');
    assert.dom('#default').hasText('BAR');
  });

  test('Get/Set/Default Value -- It should update the value -- number', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 202,
    };
    await render(hbs`
    <Formidable @values={{this.values}}  as |values api|>
        <button id="change" type="button" {{on "click" (fn api.setValue "foo" 505)}}>CHANGE</button>
        <p id="value">{{api.getValue "foo"}}</p>
        <p id="default">{{api.defaultValues.foo}}</p>
    </Formidable>
  `);
    await click('#change');
    assert.dom('#value').hasText('505');
    assert.dom('#default').hasText('202');
  });

  test('Get/Set/Default Value -- It should update the value -- date', async function (this: FormidableContext & {
    date: Date;
  }, assert) {
    this.date = new Date('1996-12-02');
    this.values = {
      foo: new Date('1990-04-10'),
    };
    await render(hbs`
    <Formidable @values={{this.values}}  as |values api|>
        <button id="change" type="button" {{on "click" (fn api.setValue "foo" this.date)}}>CHANGE</button>
        <p id="value">{{api.getValue "foo"}}</p>
        <p id="default">{{api.defaultValues.foo}}</p>
    </Formidable>
  `);
    await click('#change');
    assert.dom('#value').hasText(new Date('1996-12-02').toString());
    assert.dom('#default').hasText(new Date('1990-04-10').toString());
  });

  test('Get/Set/Default Value -- It should update the value -- object', async function (this: FormidableContext, assert) {
    this.values = {
      foo: { bar: 'Tequila' },
    };
    await render(hbs`
    <Formidable @values={{this.values}}  as |values api|>
        <button id="change" type="button" {{on "click" (fn api.setValue "foo" (hash bar="Sunrise!"))}}>CHANGE</button>
        <p id="value">{{api.getValue "foo.bar"}}</p>
        <p id="default">{{api.defaultValues.foo.bar}}</p>
    </Formidable>
  `);
    await click('#change');
    assert.dom('#value').hasText('Sunrise!');
    assert.dom('#default').hasText('Tequila');
  });

  test('Get/Set/Default Value -- It should update the value -- array', async function (this: FormidableContext, assert) {
    this.values = {
      foo: ['🐡', '🐟'],
    };
    await render(hbs`
    <Formidable @values={{this.values}}  as |values api|>
        <button id="change" type="button" {{on "click" (fn api.setValue "foo" (array "🍤" "🍣"))}}>CHANGE</button>
        <p id="value0">{{api.getValue "foo.0"}}</p>
        <p id="value1">{{api.getValue "foo.1"}}</p>
        <p id="default0">{{get api.defaultValues "foo.0"}}</p>
        <p id="default1">{{get api.defaultValues "foo.1"}}</p>
    </Formidable>
  `);
    await click('#change');
    assert.dom('#value0').hasText('🍤');
    assert.dom('#value1').hasText('🍣');
    assert.dom('#default0').hasText('🐡');
    assert.dom('#default1').hasText('🐟');
  });

  test('Get Values -- It should get all the values', async function (this: FormidableContext & {
    renderValues: (values: object) => void;
  }, assert) {
    this.values = {
      foo: 'BAR',
      bizz: 'Buzz',
    };

    this.renderValues = (values: object) => {
      return Object.values(values);
    };

    await render(hbs`
    <Formidable @values={{this.values}}  as |values api|>
      {{#each (this.renderValues (api.getValues)) as |value|}}
        <p id={{value}}>{{value}}</p>
      {{/each}}
    </Formidable>
  `);

    assert.dom('#BAR').hasText('BAR');
    assert.dom('#Buzz').hasText('Buzz');
  });

  test('SetValue -- shouldDirty -- It should update and dirty the field', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'BAR',
    };
    await render(hbs`
      <Formidable @values={{this.values}}  as |values api|>
          <button id="change" type="button" {{on "click" (fn api.setValue "foo" "CHANGED" (hash shouldDirty=true))}}>CHANGE</button>
          <p id="value">{{api.getValue "foo"}}</p>
          {{#if (get api.dirtyFields 'foo')}}
              <p id="df-foo">DIRTY</p>
          {{/if}}
      </Formidable>
    `);

    await click('#change');
    assert.dom('#df-foo').exists();
  });

  test('SetValue -- shouldValidate -- It should update and validate the field', async function (this: FormidableContext, assert) {
    //@ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = validUser;

    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
          <button id="change" type="button" {{on "click" (fn api.setValue "name" "" (hash shouldValidate=true))}}>CHANGE</button>
          <p id="value">{{api.getValue "name"}}</p>
          {{#each api.errorMessages as |error|}}
           <p id="error">{{error}}</p>
          {{/each}}
      </Formidable>
    `);

    await click('#change');
    assert.dom('#error').exists();
  });
});
