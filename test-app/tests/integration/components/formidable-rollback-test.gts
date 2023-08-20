/* eslint-disable qunit/require-expect */
import { on } from '@ember/modifier';
import { get } from '@ember/object';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { fn } from 'test-app/tests/utils/helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('Rollback -- text -- no options -- It should rollback the value', async function (assert) {
    const data = {
      foo: 'DEFAULT',
    };

    const onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
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

  test('Rollback -- defaultValue -- The default value should be reset', async function (assert) {
    const data = {
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

  test('Rollback -- number -- no options -- It should rollback the value ', async function (assert) {
    const data = {
      foo: 404,
    };

    const onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
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

  test('Rollback -- date -- no options -- It should rollback the value ', async function (assert) {
    const data = {
      foo: new Date('2000-05-05'),
    };

    const onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
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

  test('Rollback -- object -- no options -- It should rollback the value ', async function (assert) {
    const data = {
      foo: { bar: 'DEFAULT' },
    };

    const onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
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

  test('Rollback -- array -- no options -- It should rollback the value ', async function (assert) {
    const data = {
      foo: ['A', 'B'],
    };

    const onUpdate = (_data, api: { rollback: () => void }) => {
      api.rollback();
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
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
});
