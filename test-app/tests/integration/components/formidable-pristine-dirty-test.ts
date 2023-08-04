/* eslint-disable qunit/require-expect */
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';

import { click, fillIn, render } from '@ember/test-helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('dirtyFields -- The dirty states should be updated', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };

    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <input type="text" id="bar" {{api.register "bar"}} />
            {{#if (get api.dirtyFields 'foo')}}
              <p id="df-foo">DIRTY</p>
            {{/if}}
            {{#if (get api.dirtyFields 'bar')}}
              <p id="df-bar">DIRTY</p>
            {{/if}}
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await fillIn('#foo', 'UPDATED');
    assert.dom('#df-foo').exists();
    assert.dom('#df-bar').doesNotExist();
  });

  test('isDirty/isPristine -- The dirty states should be updated', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };

    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <input type="text" id="bar" {{api.register "bar"}} />
            {{#if api.isPristine}}
              <p id="pristine">PRISTINE</p>
            {{/if}}
            {{#if api.isDirty}}
              <p id="dirty">DIRTY</p>
            {{/if}}
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    assert.dom('#pristine').exists();
    assert.dom('#dirty').doesNotExist();
    await fillIn('#foo', 'UPDATED');
    assert.dom('#pristine').doesNotExist();
    assert.dom('#dirty').exists();
  });

  test('Dirty -- It should be rollbacked', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };

    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button
            id="rollback"
            type="button"
            {{on "click" (fn api.rollback undefined)}}
          >
            ROLLBACK
          </button>
          {{#if (get api.dirtyFields 'foo')}}
            <p id="df">DIRTY</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#df').doesNotExist();
    await fillIn('#foo', 'UPDATED');
    assert.dom('#df').exists();
    await click('#rollback');
    assert.dom('#df').doesNotExist();
  });

  test('keepDirty -- It should be not rollbacked - All', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };

    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button
            id="rollback"
            type="button"
            {{on "click" (fn api.rollback undefined (hash keepDirty=true))}}
          >
            ROLLBACK
          </button>
          {{#if (get api.dirtyFields 'foo')}}
            <p id="df">DIRTY</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#df').doesNotExist();
    await fillIn('#foo', 'UPDATED');
    assert.dom('#df').exists();
    await click('#rollback');
    assert.dom('#df').exists();
  });

  test('Dirty Field -- It should be rollbacked', async function (this: FormidableContext, assert) {
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
            {{on "click" (fn api.rollback "foo")}}
          >
            ROLLBACK
          </button>
          {{#if (get api.dirtyFields 'foo')}}
              <p id="df-foo">DIRTY</p>
            {{/if}}
            {{#if (get api.dirtyFields 'bar')}}
              <p id="df-bar">DIRTY</p>
            {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#df-foo').doesNotExist();
    assert.dom('#df-bar').doesNotExist();
    await fillIn('#foo', 'UPDATED');
    await fillIn('#bar', 'NEW');
    assert.dom('#df-foo').exists();
    assert.dom('#df-bar').exists();
    await click('#rollback');
    assert.dom('#df-foo').doesNotExist();
    assert.dom('#df-bar').exists();
  });

  test('keepDirty -- It should be not rollbacked - Field', async function (this: FormidableContext, assert) {
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
            {{on "click" (fn api.rollback "foo" (hash keepDirty=true))}}
          >
            ROLLBACK
          </button>
          {{#if (get api.dirtyFields 'foo')}}
              <p id="df-foo">DIRTY</p>
            {{/if}}
            {{#if (get api.dirtyFields 'bar')}}
              <p id="df-bar">DIRTY</p>
            {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#df-foo').doesNotExist();
    assert.dom('#df-bar').doesNotExist();
    await fillIn('#foo', 'UPDATED');
    await fillIn('#bar', 'NEW');
    assert.dom('#df-foo').exists();
    assert.dom('#df-bar').exists();
    await click('#rollback');
    assert.dom('#df-foo').exists();
    assert.dom('#df-bar').exists();
  });

  test('getFieldState -- It should have the correct dirty and pristine values', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };
    await render(hbs`
      <Formidable @values={{this.values}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <input type="text" id="bar" {{api.register "bar"}} />
            {{#if (get (api.getFieldState "foo") 'isDirty')}}
              <p id="df-foo">DIRTY</p>
            {{/if}}
            {{#if (get (api.getFieldState "foo") 'isPristine')}}
              <p id="pf-foo">PRISTINE</p>
            {{/if}}
            {{#if (get (api.getFieldState "bar") 'isDirty')}}
              <p id="df-bar">DIRTY</p>
            {{/if}}
            {{#if (get (api.getFieldState "bar") 'isPristine')}}
              <p id="pf-bar">PRISTINE</p>
            {{/if}}
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    assert.dom('#df-foo').doesNotExist();
    assert.dom('#pf-foo').exists();
    assert.dom('#pf-bar').exists();
    assert.dom('#df-bar').doesNotExist();

    await fillIn('#foo', 'UPDATED');

    assert.dom('#df-foo').exists();
    assert.dom('#pf-foo').doesNotExist();
    assert.dom('#pf-bar').exists();
    assert.dom('#df-bar').doesNotExist();

    await fillIn('#bar', 'NEW');

    assert.dom('#df-foo').exists();
    assert.dom('#pf-foo').doesNotExist();
    assert.dom('#pf-bar').doesNotExist();
    assert.dom('#df-bar').exists();
  });
});
