import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';
import { yupResolver } from 'test-app/tests/utils/resolvers/yup';
import * as yup from 'yup';

import { click, fillIn, render } from '@ember/test-helpers';

const userSchema = yup.object({
  name: yup.string().required('Name is required.'),
});

const validUser = {
  name: 'John Doe',
};

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: FormidableContext) {
    this.updateEvents = ['onChange'];
    //@ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = validUser;
  });

  test('unregister -- It should unregister the input', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="unregister" type="button" {{on "click" (fn api.unregister "name")}}>UNREGISTER</button>
          {{#if (api.getValue "name")}}
            <p id="value-name">{{api.getValue "name"}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
           <p id="error-name">{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
              <p id="dirty-name">DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id="default-name">{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    await fillIn('#name', '');
    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').doesNotExist();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#dirty-name').doesNotExist();
    assert.dom('#default-name').doesNotExist();
  });

  test('unregister -- keepValue -- It should unregister the input and keep the value', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="unregister" type="button" {{on "click" (fn api.unregister "name" (hash keepValue=true))}}>UNREGISTER</button>
          {{#if (api.getValue "name")}}
            <p id="value-name">{{api.getValue "name"}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
           <p id="error-name">{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
              <p id="dirty-name">DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
          {{log (get api.defaultValues 'name')}}
            <p id="default-name">{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').exists();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#dirty-name').doesNotExist();
    assert.dom('#default-name').doesNotExist();
  });

  test('unregister -- keepError -- It should unregister the input and keep the error', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="unregister" type="button" {{on "click" (fn api.unregister "name" (hash keepError=true))}}>UNREGISTER</button>
          {{#if (api.getValue "name")}}
            <p id="value-name">{{api.getValue "name"}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
           <p id="error-name">{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
              <p id="dirty-name">DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id="default-name">{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    await fillIn('#name', '');
    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').doesNotExist();
    assert.dom('#error-name').exists();
    assert.dom('#dirty-name').doesNotExist();
    assert.dom('#default-name').doesNotExist();
  });

  test('unregister -- keepDirty -- It should unregister the input and keep the dirty field', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="unregister" type="button" {{on "click" (fn api.unregister "name" (hash keepDirty=true))}}>UNREGISTER</button>
          {{#if (api.getValue "name")}}
            <p id="value-name">{{api.getValue "name"}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
           <p id="error-name">{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
              <p id="dirty-name">DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id="default-name">{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    await fillIn('#name', '');
    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').doesNotExist();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#dirty-name').exists();
    assert.dom('#default-name').doesNotExist();
  });

  test('unregister -- keepDefaultValue -- It should unregister the input and keep the default value', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="unregister" type="button" {{on "click" (fn api.unregister "name" (hash keepDefaultValue=true))}}>UNREGISTER</button>
          {{#if (api.getValue "name")}}
            <p id="value-name">{{api.getValue "name"}}</p>
          {{/if}}
          {{#each api.errors.name as |error|}}
           <p id="error-name">{{error.message}}</p>
          {{/each}}
          {{#if (get api.dirtyFields 'name')}}
              <p id="dirty-name">DIRTY</p>
          {{/if}}
          {{#if (get api.defaultValues 'name')}}
            <p id="default-name">{{get api.defaultValues 'name'}}</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    await fillIn('#name', '');
    await click('#unregister');
    assert.dom('#name').hasAttribute('data-formidable-unregistered');
    assert.dom('#value-name').doesNotExist();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#dirty-name').doesNotExist();
    assert.dom('#default-name').exists();
  });
});
