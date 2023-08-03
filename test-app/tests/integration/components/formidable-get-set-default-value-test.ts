/* eslint-disable qunit/require-expect */
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';

import { click, render } from '@ember/test-helpers';

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
        <button id="change" type="button" {{on "click" (fn api.setValue "foo" (hash bar="Surprise!"))}}>CHANGE</button>
        <p id="value">{{api.getValue "foo.bar"}}</p>
        <p id="default">{{api.defaultValues.foo.bar}}</p>
    </Formidable>
  `);
    await click('#change');
    assert.dom('#value').hasText('Surprise!');
    assert.dom('#default').hasText('Tequila');
  });

  test('Get/Set/Default Value -- It should update the value -- array', async function (this: FormidableContext, assert) {
    this.values = {
      foo: ['Fish', 'Chips'],
    };
    await render(hbs`
    <Formidable @values={{this.values}}  as |values api|>
        <button id="change" type="button" {{on "click" (fn api.setValue "foo" (array "Hello" "Goodbye"))}}>CHANGE</button>
        <p id="value0">{{api.getValue "foo.0"}}</p>
        <p id="value1">{{api.getValue "foo.1"}}</p>
        <p id="default0">{{get api.defaultValues "foo.0"}}</p>
        <p id="default1">{{get api.defaultValues "foo.1"}}</p>
    </Formidable>
  `);
    await click('#change');
    assert.dom('#value0').hasText('Hello');
    assert.dom('#value1').hasText('Goodbye');
    assert.dom('#default0').hasText('Fish');
    assert.dom('#default1').hasText('Chips');
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
});
