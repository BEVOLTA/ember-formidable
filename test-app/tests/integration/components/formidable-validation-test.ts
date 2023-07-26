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
    this.values = {
      foo: 'DEFAULT',
    };

    this.updateEvents = ['onSubmit'];
  });

  test('Validation -- It should validate', async function (this: FormidableContext, assert) {
    //@ts-ignore
    this.validator = yupResolver(userSchema);
    this.values = validUser;

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

  test('Validation -- It should validate -- native', async function (this: FormidableContext, assert) {
    this.values = validUser;

    await render(hbs`
      <Formidable @values={{this.values}} @shouldUseNativeValidation={{true}} as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "name"}} />
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);
    // assert.dom('#name').hasValue('John Doe');
    await fillIn('#foo', 'A');
    // await pauseTest();
    await click('#submit');

    assert.ok(false);
  });
});
