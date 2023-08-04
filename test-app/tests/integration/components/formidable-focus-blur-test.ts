import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';
import { yupResolver } from 'test-app/tests/utils/resolvers/yup';
import * as yup from 'yup';

import { click, fillIn, render } from '@ember/test-helpers';

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

  test('setFocus -- Should be OK when submitting', async function (this: FormidableContext, assert) {
    this.updateEvents = ['onFocus'];

    await render(hbs`
      <Formidable @validator={{this.validator}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="focus" type="button" {{on "click" (fn api.setFocus "name")}}>FOCUS</button>

        </form>
      </Formidable>
    `);

    await click('#focus');
    assert.dom('#name').isFocused();
  });

  test('setFocus -- Should be OK when submitting -- shouldValidate', async function (this: FormidableContext, assert) {
    //@ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = { ...validUser, name: '' };
    this.updateEvents = ['onFocus'];

    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="focus" type="button" {{on "click" (fn api.setFocus "name" (hash shouldValidate=true))}}>FOCUS</button>
          {{#each api.errorMessages as |error|}}
            <p id="error">{{error}}</p>
          {{/each}}
        </form>
      </Formidable>
    `);

    await fillIn('#name', '');
    await click('#focus');
    assert.dom('#name').isFocused();
    assert.dom('#error').exists();
  });

  test('setFocus -- Should be OK when submitting -- shouldDirty', async function (this: FormidableContext, assert) {
    this.updateEvents = ['onFocus'];

    await render(hbs`
      <Formidable @updateEvents={{this.updateEvents}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="focus" type="button" {{on "click" (fn api.setFocus "name" (hash shouldDirty=true))}}>FOCUS</button>
          {{#if (get (api.getFieldState "name") 'isDirty')}}
            <p id="dirty-name">DIRTY</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    await click('#focus');
    assert.dom('#name').isFocused();
    assert.dom('#dirty-name').exists();
  });
});
