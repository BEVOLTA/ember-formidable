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

  hooks.beforeEach(function (this: FormidableContext) {
    this.updateEvents = ['onSubmit'];
  });

  test('isSubmitSuccessful -- Should be OK when submitting', async function (this: FormidableContext, assert) {
    //@ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = validUser;

    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="submit" type="submit">SUBMIT</button>
          {{#if api.isSubmitSuccessful}}
             <p id="is-success">SUCCESSFUL</p>
           {{/if}}
        </form>
      </Formidable>
    `);
    assert.dom('#name').hasValue('John Doe');
    assert.dom('#is-success').doesNotExist();
    await click('#submit');
    assert.dom('#is-success').exists();
  });

  test('isSubmitSuccessful -- Should not be true if there are errors', async function (this: FormidableContext, assert) {
    //@ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = validUser;

    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="submit"  type="submit">SUBMIT</button>
          {{#if api.isSubmitSuccessful}}
             <p id="is-success">SUCCESSFUL</p>
          {{/if}}

        </form>
      </Formidable>
    `);

    assert.dom('#is-success').doesNotExist();
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#is-success').doesNotExist();
  });

  test('isSubmitted -- Should not be true even with errors', async function (this: FormidableContext, assert) {
    //@ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = validUser;

    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="submit"  type="submit">SUBMIT</button>
          {{#if api.isSubmitted}}
             <p id="is-submitted">SUBMITTED</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#is-submitted').doesNotExist();
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#is-submitted').exists();
  });

  test('isSubmitted -- Should be false when rollback', async function (this: FormidableContext, assert) {
    this.values = {
      foo: 'DEFAULT',
    };

    await render(hbs`
      <Formidable @values={{this.values}}  as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button id="rollback"  type="button" {{on "click" (fn api.rollback undefined)}}>ROLLBACK</button>
          <button id="submit"  type="submit">SUBMIT</button>
          {{#if api.isSubmitted}}
             <p id="is-submitted">SUBMITTED</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#is-submitted').doesNotExist();
    await click('#submit');
    assert.dom('#is-submitted').exists();
    await click('#rollback');
    assert.dom('#is-submitted').doesNotExist();
  });

  test('submitCount -- Should increment properly', async function (this: FormidableContext, assert) {
    // @ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = validUser;

    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="submit"  type="submit">SUBMIT</button>
           <p id="submit-count">{{api.submitCount}}</p>
        </form>
      </Formidable>
    `);

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

  test('isSubmitting -- Should be true when submitted', async function (this: FormidableContext, assert) {
    this.onUpdate = async (_data, api) => {
      return await new Promise((resolve) => {
        setTimeout(resolve, 1000);
        assert.true(api.isSubmitting);
      });
    };
    await render(hbs`
      <Formidable @values={{this.values}} @onValuesChanged={{this.onUpdate}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <button id="submit"  type="submit">SUBMIT</button>
           <p id="is-submitting">{{api.isSubmitting}}</p>
        </form>
      </Formidable>
    `);
    assert.dom('#is-submitting').hasText('false');
    await click('#submit');
    assert.dom('#is-submitting').hasText('false');
  });
});
