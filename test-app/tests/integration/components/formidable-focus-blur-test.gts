import { on } from '@ember/modifier';
import { get } from '@ember/object';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { fn } from 'test-app/tests/utils/helpers';
import { yupResolver } from 'test-app/tests/utils/resolvers/yup';
import * as yup from 'yup';

const userSchema = yup.object({
  name: yup.string().required('Name is required.'),
});

const validUser = {
  name: 'John Doe',
};

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('setFocus -- Should focus the input when triggered', async function (assert) {
    const updateEvents = ['onFocus'];

    await render(<template>
      <Formidable @updateEvents={{updateEvents}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='focus' type='button' {{on 'click' (fn api.setFocus 'name')}}>FOCUS</button>
        </form>
      </Formidable>
    </template>);

    await click('#focus');
    assert.dom('#name').isFocused();
  });

  test('setFocus -- shouldValidate -- Should focus and validate the input when triggered', async function (assert) {
    const validator = yupResolver(userSchema);
    const data = { ...validUser, name: '' };
    const updateEvents = ['onFocus'];
    const options = { shouldValidate: true };

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
            id='focus'
            type='button'
            {{on 'click' (fn api.setFocus 'name' options)}}
          >FOCUS</button>
          {{#each api.errorMessages as |error|}}
            <p id='error'>{{error}}</p>
          {{/each}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#focus');
    assert.dom('#name').isFocused();
    assert.dom('#error').exists();
  });

  test('setFocus -- shouldDirty -- Should focus and dirty the input when triggered', async function (assert) {
    const updateEvents = ['onFocus'];
    const options = { shouldDirty: true };
    const data = {
      name: 'Henry',
    };

    await render(<template>
      <Formidable @values={{data}} @updateEvents={{updateEvents}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button
            id='focus'
            type='button'
            {{on 'click' (fn api.setFocus 'name' options)}}
          >FOCUS</button>
          {{#if (get (api.getFieldState 'name') 'isDirty')}}
            <p id='dirty-name'>DIRTY</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', 'Deby');
    await blur('#name');
    await click('#focus');
    assert.dom('#name').isFocused();
    assert.dom('#dirty-name').exists();
  });
});
