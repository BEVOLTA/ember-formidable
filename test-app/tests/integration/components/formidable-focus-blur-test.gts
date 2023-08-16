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

  test('setFocus -- Should focus the input when triggered', async function (this: FormidableContext, assert) {
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

  test('setFocus -- shouldValidate -- Should focus and validate the input when triggered', async function (this: FormidableContext, assert) {
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

  test('setFocus -- shouldDirty -- Should focus and dirty the input when triggered', async function (this: FormidableContext, assert) {
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
