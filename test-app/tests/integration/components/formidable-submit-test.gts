import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { yupValidator } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';
import * as yup from 'yup';

import type { FormidableArgs } from 'ember-formidable';

const userSchema = yup.object({
  name: yup.string().required('Name is required.'),
});

const validUser = {
  name: 'John Doe',
};

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  const validator = yupValidator(userSchema);
  let data = validUser;

  test('isSubmitSuccessful -- Should be OK when submitting', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if api.isSubmitSuccessful}}
            <p id='is-success'>SUCCESSFUL</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);
    assert.dom('#name').hasValue('John Doe');
    assert.dom('#is-success').doesNotExist();
    await click('#submit');
    assert.dom('#is-success').exists();
  });

  test('isSubmitSuccessful -- Should not be true if there are errors', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if api.isSubmitSuccessful}}
            <p id='is-success'>SUCCESSFUL</p>
          {{/if}}

        </form>
      </Formidable>
    </template>);

    assert.dom('#is-success').doesNotExist();
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#is-success').doesNotExist();
  });

  test('isSubmitted -- Should not be true even with errors', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if api.isSubmitted}}
            <p id='is-submitted'>SUBMITTED</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    assert.dom('#is-submitted').doesNotExist();
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#is-submitted').exists();
  });

  test('isSubmitted -- Should be false when rollback', async function (assert) {
    const foo = {
      foo: 'DEFAULT',
    };

    await render(<template>
      <Formidable @values={{foo}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button
            id='rollback'
            type='button'
            {{on 'click' (fn api.rollback undefined undefined)}}
          >ROLLBACK</button>
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if api.isSubmitted}}
            <p id='is-submitted'>SUBMITTED</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    assert.dom('#is-submitted').doesNotExist();
    await click('#submit');
    assert.dom('#is-submitted').exists();
    await click('#rollback');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('submitCount -- Should increment when submitting', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          <p id='submit-count'>{{api.submitCount}}</p>
        </form>
      </Formidable>
    </template>);

    assert.dom('#submit-count').hasText('0');
    await click('#submit');
    assert.dom('#submit-count').hasText('1');
    await click('#submit');
    assert.dom('#submit-count').hasText('2');
    await click('#submit');
    assert.dom('#submit-count').hasText('3');
    await click('#submit');
    assert.dom('#submit-count').hasText('4');
  });

  test('onSubmit -- Should have a custom onSubmit', async function (assert) {
    const handleSubmit: FormidableArgs<typeof data>['onSubmit'] = (event, api) => {
      assert.ok(event);
      assert.ok(api);
    };

    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} @onSubmit={{handleSubmit}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#each api.errorMessages as |error|}}
            <p id='error'>{{error}}</p>
          {{/each}}
        </form>
      </Formidable>
    </template>);

    await click('#submit');
    assert.dom('#error').doesNotExist();
  });

  test('isSubmitting -- Should be true when submitted', async function (assert) {
    const foo = {
      foo: 'DEFAULT',
    };

    const handler: FormidableArgs<typeof foo>['handler'] = async (_data, api) => {
      return await new Promise((resolve) => {
        setTimeout(resolve, 1000);
        assert.true(api.isSubmitting);
      });
    };

    await render(<template>
      <Formidable @values={{foo}} @handler={{handler}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          <p id='is-submitting'>{{api.isSubmitting}}</p>
        </form>
      </Formidable>
    </template>);

    assert.dom('#is-submitting').hasText('false');
    await click('#submit');
    assert.dom('#is-submitting').hasText('false');
  });
});
