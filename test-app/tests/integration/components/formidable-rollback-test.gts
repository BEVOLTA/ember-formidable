/* eslint-disable qunit/require-expect */
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';

import { click, fillIn, render } from '@ember/test-helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('Rollback -- text -- no options -- It should rollback the value', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };
    this.onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          {{#if api.isSubmitted}}
             <p id="is-submitted">SUBMITTED</p>
          {{/if}}
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    assert.dom('#foo').hasValue('DEFAULT');

    await fillIn('#foo', 'CHANGED');
    assert.dom('#foo').hasValue('CHANGED');
    await click('#submit');
    assert.dom('#foo').hasValue('DEFAULT');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('Rollback -- defaultValue -- The default value should be reset', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };

    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <input type="text" id="bar" {{api.register "bar"}} />
          <button
            id="rollback"
            type="button"
            {{on "click" (fn api.rollback "foo" (hash defaultValue="Shiny and new!"))}}
          >
            ROLLBACK
          </button>
          <p id="df-foo">{{get api.defaultValues 'foo'}}</p>
        </form>
      </Formidable>
    `);

    assert.dom('#df-foo').hasText('DEFAULT');
    await fillIn('#foo', 'UPDATED');
    await click('#rollback');
    assert.dom('#df-foo').hasText('Shiny and new!');
    assert.dom('#foo').hasValue('Shiny and new!');
  });

  test('Rollback -- number -- no options -- It should rollback the value ', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 404,
    };
    this.onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo" valueAsNumber=true}} />
          {{#if api.isSubmitted}}
             <p id="is-submitted">SUBMITTED</p>
          {{/if}}
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#foo').hasValue('404');
    await fillIn('#foo', '5');
    assert.dom('#foo').hasValue('5');
    await click('#submit');
    assert.dom('#foo').hasValue('404');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('Rollback -- date -- no options -- It should rollback the value ', async function (this: FormidableContext, assert) {
    this.values = {
      foo: new Date('2000-05-05'),
    };
    this.onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo" valueAsDate=true}} />
          {{#if api.isSubmitted}}
             <p id="is-submitted">SUBMITTED</p>
          {{/if}}
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#foo').hasValue(new Date('2000-05-05').toString());
    await fillIn('#foo', '2001-05-05');
    assert.dom('#foo').hasValue(new Date('2001-05-05').toString());
    await click('#submit');
    assert.dom('#foo').hasValue(new Date('2000-05-05').toString());
    assert.dom('#is-submitted').doesNotExist();
  });

  test('Rollback -- object -- no options -- It should rollback the value ', async function (this: FormidableContext, assert) {
    this.values = {
      foo: { bar: 'DEFAULT' },
    };
    this.onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };

    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo.bar"}} />
          {{#if api.isSubmitted}}
             <p id="is-submitted">SUBMITTED</p>
          {{/if}}
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    assert.dom('#foo').hasValue('CHANGED');
    await click('#submit');
    assert.dom('#foo').hasValue('DEFAULT');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('Rollback -- array -- no options -- It should rollback the value ', async function (this: FormidableContext, assert) {
    this.values = {
      foo: ['A', 'B'],
    };
    this.onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo0" {{api.register "foo.0"}} />
          <input type="text" id="foo1" {{api.register "foo.1"}} />
          {{#if api.isSubmitted}}
             <p id="is-submitted">SUBMITTED</p>
          {{/if}}
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
    assert.dom('#is-submitted').doesNotExist();
  });
});
