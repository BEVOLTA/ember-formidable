import { on } from '@ember/modifier';
import { get } from '@ember/object';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { yupResolver } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { fn } from 'test-app/tests/utils/helpers';
import * as yup from 'yup';

import type { UpdateEvent } from 'ember-formidable';

const userSchema = yup.object({
  name: yup.string().required('Name is required.'),
});

const validUser = {
  name: 'John Doe',
};

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  const updateEvents: UpdateEvent[] = ['onChange'];
  const validator = yupResolver(userSchema);
  const data = validUser;

  test('unregister -- It should unregister the input', async function (assert) {
    await render(<template>
      <Formidable
        @values={{data}}
        @validator={{validator}}
        @updateEvents={{updateEvents}}
        as |values api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button
            id='unregister'
            type='button'
            {{on 'click' (fn api.unregister 'name')}}
          >UNREGISTER</button>
          {{#if (api.getValue 'name')}}
            <p id='value-name'>{{api.getValue 'name'}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
            <p id='error-name'>{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
            <p id='dirty-name'>DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id='default-name'>{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').doesNotExist();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#dirty-name').doesNotExist();
    assert.dom('#default-name').doesNotExist();
  });

  test('unregister -- keepValue -- It should unregister the input and keep the value', async function (assert) {
    const options = { keepValue: true };

    await render(<template>
      <Formidable
        @values={{data}}
        @validator={{validator}}
        @updateEvents={{updateEvents}}
        as |values api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button
            id='unregister'
            type='button'
            {{on 'click' (fn api.unregister 'name' options)}}
          >UNREGISTER</button>
          {{#if (api.getValue 'name')}}
            <p id='value-name'>{{api.getValue 'name'}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
            <p id='error-name'>{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
            <p id='dirty-name'>DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id='default-name'>{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').exists();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#dirty-name').doesNotExist();
    assert.dom('#default-name').doesNotExist();
  });

  test('unregister -- keepError -- It should unregister the input and keep the error', async function (assert) {
    const options = { keepError: true };

    await render(<template>
      <Formidable
        @values={{data}}
        @validator={{validator}}
        @updateEvents={{updateEvents}}
        as |values api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button
            id='unregister'
            type='button'
            {{on 'click' (fn api.unregister 'name' options)}}
          >UNREGISTER</button>
          {{#if (api.getValue 'name')}}
            <p id='value-name'>{{api.getValue 'name'}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
            <p id='error-name'>{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
            <p id='dirty-name'>DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id='default-name'>{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').doesNotExist();
    assert.dom('#error-name').exists();
    assert.dom('#dirty-name').doesNotExist();
    assert.dom('#default-name').doesNotExist();
  });

  test('unregister -- keepDirty -- It should unregister the input and keep the dirty field', async function (assert) {
    const options = { keepDirty: true };

    await render(<template>
      <Formidable
        @values={{data}}
        @validator={{validator}}
        @updateEvents={{updateEvents}}
        as |values api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button
            id='unregister'
            type='button'
            {{on 'click' (fn api.unregister 'name' options)}}
          >UNREGISTER</button>
          {{#if (api.getValue 'name')}}
            <p id='value-name'>{{api.getValue 'name'}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
            <p id='error-name'>{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
            <p id='dirty-name'>DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id='default-name'>{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').doesNotExist();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#dirty-name').exists();
    assert.dom('#default-name').doesNotExist();
  });

  test('unregister -- keepDefaultValue -- It should unregister the input and keep the default value', async function (assert) {
    const options = { keepDefaultValue: true };

    await render(<template>
      <Formidable
        @values={{data}}
        @validator={{validator}}
        @updateEvents={{updateEvents}}
        as |values api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button
            id='unregister'
            type='button'
            {{on 'click' (fn api.unregister 'name' options)}}
          >UNREGISTER</button>
          {{#if (api.getValue 'name')}}
            <p id='value-name'>{{api.getValue 'name'}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
            <p id='error-name'>{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
            <p id='dirty-name'>DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id='default-name'>{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').doesNotExist();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#dirty-name').doesNotExist();
    assert.dom('#default-name').exists();
  });
});
