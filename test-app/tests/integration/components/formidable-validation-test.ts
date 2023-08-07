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

  // Numeric property with required, positive, and integer validations
  age: yup
    .number()
    .required('Age is required.')
    .positive('Age must be positive.')
    .integer('Age must be an integer.'),

  // Email property with email format validation
  email: yup.string().email('Invalid email format.'),

  // URL property which is nullable
  website: yup.string().url('Invalid URL format.').nullable(),

  // Date property with default value set to the current date
  createdOn: yup.date().default(() => new Date()),

  // Nested object property for address details
  address: yup.object().shape({
    street: yup.string().required('Street is required.'),
    city: yup.string().required('City is required.'),
    zipCode: yup.string().required('Zip code is required.'),
  }),

  // Array of strings with a minimum length requirement
  hobbies: yup
    .array()
    .of(yup.string().required('Hobby is required.'))
    .min(3, 'At least 3 hobbies are required.'),

  // Custom validation method to check if the user is at least 18 years old
  adult: yup
    .boolean()
    //@ts-ignore
    .test('is-adult', 'User must be at least 18 years old.', (value) => {
      const age = yup.number().integer().positive().validateSync(value);
      return age ?? 0 >= 18;
    }),

  // Mixed type property with one of values allowed
  gender: yup.mixed().oneOf(['male', 'female', 'other'], 'Invalid gender.'),
});

// Example usage of the user schema
const validUser = {
  name: 'John Doe',
  age: 30,
  email: 'john.doe@example.com',
  website: 'https://example.com',
  createdOn: new Date('2023-07-21T10:47:04+02:00'),
  address: {
    street: '123 Main St',
    city: 'New York',
    zipCode: '10001',
  },
  hobbies: ['Reading', 'Hiking', 'Cooking'],
  adult: true,
  gender: 'male',
  details: {
    label: 'USD',
    code: 'USD',
    symbol: '$',
    alpha_2: 'US',
  },
};

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: FormidableContext) {
    this.updateEvents = ['onSubmit'];
    //@ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = validUser;
  });

  test('Validate -- It should validate', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="submit"  type="submit">SUBMIT</button>
          {{#each api.errors.name as |error|}}
           <p id="error">{{error.message}}</p>
          {{/each}}
        </form>
      </Formidable>
    `);
    assert.dom('#name').hasValue('John Doe');
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').hasText('Name is required.');
  });

  // @ts-ignore
  test('clearError -- It should clean an error', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <input type="number" id="age" {{api.register "age"}} />
          <button id="submit" type="submit">SUBMIT</button>
          <button id="clear" type="button" {{on "click" (fn api.clearError "name")}}>CLEAR</button>
          {{#each api.errors.name as |error|}}
           <p id="error-name">{{error.message}}</p>
          {{/each}}
          {{#each api.errors.age as |error|}}
           <p id="error-email">{{error.message}}</p>
          {{/each}}
        </form>
      </Formidable>
    `);
    assert.dom('#name').hasValue('John Doe');
    await fillIn('#name', '');
    await fillIn('#age', '');

    await click('#submit');
    assert.dom('#error-name').exists();
    assert.dom('#error-email').exists();
    await click('#clear');
    assert.dom('#error-name').doesNotExist();
    assert.dom('#error-email').exists();
  });

  // @ts-ignore
  test('setError -- string -- It should set an error', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="submit" type="submit">SUBMIT</button>
          <button id="set" type="button" {{on "click" (fn api.setError "name" "This shouldn't exist! What the hell!")}}>SET ERROR</button>
          {{#each api.errors.name as |error index|}}
           <p id={{concat "error-" index}}>{{error.message}}</p>
          {{/each}}
        </form>
      </Formidable>
    `);
    assert.dom('#name').hasValue('John Doe');
    await fillIn('#name', '');

    assert.dom('#error-0').doesNotExist();
    await click('#submit');
    assert.dom('#error-0').hasText('Name is required.');
    await click('#set');
    assert.dom('#error-0').hasText('Name is required.');
    assert.dom('#error-1').hasText("This shouldn't exist! What the hell!");
  });

  // @ts-ignore
  test('setError -- FormidableError -- It should set an error ', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="submit" type="submit">SUBMIT</button>
          <button id="set" type="button" {{on "click" (fn api.setError "name" (hash message="This shouldn't exist! What the hell!" type="random"))}}>SET ERROR</button>
          {{#each api.errors.name as |error index|}}
           <p id={{concat "error-" index}}>{{error.message}}</p>
           <p id={{concat "type-" index}}>{{error.type}}</p>
          {{/each}}
        </form>
      </Formidable>
    `);
    assert.dom('#name').hasValue('John Doe');
    await fillIn('#name', '');

    assert.dom('#error-0').doesNotExist();
    await click('#submit');
    assert.dom('#error-0').hasText('Name is required.');
    await click('#set');
    assert.dom('#error-0').hasText('Name is required.');
    assert.dom('#error-1').hasText("This shouldn't exist! What the hell!");
    assert.dom('#type-0').hasText('required');
    assert.dom('#type-1').hasText('random');
  });

  test('isValid -- It should be update the valid state', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <button id="submit"  type="submit">SUBMIT</button>
          {{#if api.isValid}}
           <p id="is-valid">VALID</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#is-valid').exists();
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#is-valid').doesNotExist();
  });

  test('invalidFields -- It should show invalid fields', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <input type="email" id="email" {{api.register "email"}} />
          <button id="submit"  type="submit">SUBMIT</button>
          {{#if (get api.invalidFields "name")}}
           <p id="invalid-name">INVALID</p>
          {{/if}}
          {{#if (get api.invalidFields "email")}}
           <p id="invalid-email">INVALID</p>
          {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#invalid-name').doesNotExist();
    assert.dom('#invalid-email').doesNotExist();
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#invalid-name').exists();
    assert.dom('#invalid-email').doesNotExist();
  });

  test('errorMessages -- It should show errors', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <input type="email" id="email" {{api.register "email"}} />
          <button id="submit"  type="submit">SUBMIT</button>
          {{#each api.errorMessages as |error|}}
           <p id="error">{{error}}</p>
          {{/each}}
        </form>
        {{log api.errorMessages}}
      </Formidable>
    `);

    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').hasText('Name is required.');
  });

  test('getFieldState -- It should update the state', async function (this: FormidableContext, assert) {
    await render(hbs`
      <Formidable @values={{this.values}} @validator={{this.validator}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="name" {{api.register "name"}} />
          <input type="email" id="email" {{api.register "email"}} />
          <button id="submit"  type="submit">SUBMIT</button>
          {{#if (get (api.getFieldState "name") 'isInvalid')}}
              <p id="invalid-name">INVALID</p>
            {{/if}}
            {{#if (get (api.getFieldState "name") 'error')}}
              <p id="error-name">{{get (api.getFieldState "name") 'error.0.message'}}</p>
            {{/if}}
            {{#if (get (api.getFieldState "email") 'isInvalid')}}
              <p id="invalid-email">INVALID</p>
            {{/if}}
            {{#if (get (api.getFieldState "email") 'error')}}
              <p id="error-email">{{get (api.getFieldState "email") 'error.0.message'}}</p>
            {{/if}}
        </form>
      </Formidable>
    `);

    assert.dom('#name').hasValue('John Doe');

    assert.dom('#invalid-name').doesNotExist();
    assert.dom('#error-name').doesNotExist();
    assert.dom('#error-email').doesNotExist();
    assert.dom('#invalid-email').doesNotExist();

    await fillIn('#name', '');
    await click('#submit');

    assert.dom('#invalid-name').exists();
    assert.dom('#error-name').hasText('Name is required.');
    assert.dom('#error-email').doesNotExist();
    assert.dom('#invalid-email').doesNotExist();
  });
});
