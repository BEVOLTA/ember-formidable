/* eslint-disable qunit/require-expect */
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { get } from '@ember/object';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  const data: { foo: string; bar?: string } = {
    foo: 'DEFAULT',
  };

  test('dirtyFields -- The dirty states should be updated', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <input type='text' id='bar' {{api.register 'bar'}} />
          {{#if (get api.dirtyFields 'foo')}}
            <p id='df-foo'>DIRTY</p>
          {{/if}}
          {{#if (get api.dirtyFields 'bar')}}
            <p id='df-bar'>DIRTY</p>
          {{/if}}
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await fillIn('#foo', 'UPDATED');
    assert.dom('#df-foo').exists();
    assert.dom('#df-bar').doesNotExist();
  });

  test('isDirty/isPristine -- The dirty states should be updated', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <input type='text' id='bar' {{api.register 'bar'}} />
          {{#if api.isPristine}}
            <p id='pristine'>PRISTINE</p>
          {{/if}}
          {{#if api.isDirty}}
            <p id='dirty'>DIRTY</p>
          {{/if}}
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#pristine').exists();
    assert.dom('#dirty').doesNotExist();
    await fillIn('#foo', 'UPDATED');
    assert.dom('#pristine').doesNotExist();
    assert.dom('#dirty').exists();
  });

  test('dirtyFields -- Fields should be pristine when rollbacked', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='rollback' type='button' {{on 'click' (fn api.rollback undefined undefined)}}>
            ROLLBACK
          </button>
          {{#if (get api.dirtyFields 'foo')}}
            <p id='df'>DIRTY</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    assert.dom('#df').doesNotExist();
    await fillIn('#foo', 'UPDATED');
    assert.dom('#df').exists();
    await click('#rollback');
    assert.dom('#df').doesNotExist();
  });

  test('keepDirty -- Every field should stay dirty when rollbacked', async function (assert) {
    const options = { keepDirty: true };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='rollback' type='button' {{on 'click' (fn api.rollback undefined options)}}>
            ROLLBACK
          </button>
          {{#if (get api.dirtyFields 'foo')}}
            <p id='df'>DIRTY</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    assert.dom('#df').doesNotExist();
    await fillIn('#foo', 'UPDATED');
    assert.dom('#df').exists();
    await click('#rollback');
    assert.dom('#df').exists();
  });

  test('dirtyFields -- The rollbacked field should be pristine when rollbacked', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <input type='text' id='bar' {{api.register 'bar'}} />
          <button id='rollback' type='button' {{on 'click' (fn api.rollback 'foo' undefined)}}>
            ROLLBACK
          </button>
          {{#if (get api.dirtyFields 'foo')}}
            <p id='df-foo'>DIRTY</p>
          {{/if}}
          {{#if (get api.dirtyFields 'bar')}}
            <p id='df-bar'>DIRTY</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

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

  test('keepDirty -- The rollbacked field should stay dirty', async function (assert) {
    const options = { keepDirty: true };

    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <input type='text' id='bar' {{api.register 'bar'}} />
          <button id='rollback' type='button' {{on 'click' (fn api.rollback 'foo' options)}}>
            ROLLBACK
          </button>
          {{#if (get api.dirtyFields 'foo')}}
            <p id='df-foo'>DIRTY</p>
          {{/if}}
          {{#if (get api.dirtyFields 'bar')}}
            <p id='df-bar'>DIRTY</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

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

  test('getFieldState -- It should have the appropriate dirty and pristine values when updated', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <input type='text' id='bar' {{api.register 'bar'}} />
          {{#if (get (api.getFieldState 'foo') 'isDirty')}}
            <p id='df-foo'>DIRTY</p>
          {{/if}}
          {{#if (get (api.getFieldState 'foo') 'isPristine')}}
            <p id='pf-foo'>PRISTINE</p>
          {{/if}}
          {{#if (get (api.getFieldState 'bar') 'isDirty')}}
            <p id='df-bar'>DIRTY</p>
          {{/if}}
          {{#if (get (api.getFieldState 'bar') 'isPristine')}}
            <p id='pf-bar'>PRISTINE</p>
          {{/if}}
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

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
