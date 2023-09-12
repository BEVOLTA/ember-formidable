import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { get } from '@ember/object';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { yupValidator } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';
import * as yup from 'yup';

import type { FieldState, FormidableError, HandlerEvent } from 'ember-formidable';

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

  // Mixed type property with one of values allowed
  gender: yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender.'),
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
  gender: 'male',
};

interface IUser {
  name: string;
  age: number;
  email?: string;
  website?: string | null;
  createdOn: Date;
  address: {
    street: string;
    city: string;
    zipCode: string;
  };
  hobbies?: string[];
  gender?: string;
}

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  const validator = yupValidator<IUser>(userSchema);
  const data: IUser = validUser;

  test('Validate -- It should validate', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#each api.errors.name as |error|}}
            <p id='error'>{{error.message}}</p>
          {{/each}}
        </form>
      </Formidable>
    </template>);
    assert.dom('#name').hasValue('John Doe');
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').hasText('Name is required.');
  });

  test('clearError -- It should clear an error', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <input type='text' id='email' {{api.register 'email'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          <button id='clear' type='button' {{on 'click' (fn api.clearError 'name')}}>CLEAR</button>
          {{#each api.errors.name as |error|}}
            <p id='error-name'>{{error.message}}</p>
          {{/each}}
          {{#each api.errors.email as |error|}}
            <p id='error-email'>{{error.message}}</p>
          {{/each}}
        </form>
      </Formidable>
    </template>);
    assert.dom('#name').hasValue('John Doe');
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error-name').exists();
    await click('#clear');
    assert.dom('#error-name').doesNotExist();
  });

  test('setError -- string -- It should set an error', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          <button
            id='set'
            type='button'
            {{on 'click' (fn api.setError 'name' "This shouldn't exist! What the hell!")}}
          >SET ERROR</button>
          {{#each api.errors.name as |error index|}}
            <p id={{concat 'error-' index}}>{{error.message}}</p>
          {{/each}}
        </form>
      </Formidable>
    </template>);
    assert.dom('#name').hasValue('John Doe');
    await fillIn('#name', '');

    assert.dom('#error-0').doesNotExist();
    await click('#submit');
    assert.dom('#error-0').hasText('Name is required.');
    await click('#set');
    assert.dom('#error-0').hasText('Name is required.');
    assert.dom('#error-1').hasText("This shouldn't exist! What the hell!");
  });

  test('setError -- FormidableError -- It should set an error ', async function (assert) {
    const customError = {
      message: "This shouldn't exist! What the hell!",
      type: 'random',
    } as FormidableError;

    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          <button id='set' type='button' {{on 'click' (fn api.setError 'name' customError)}}>SET
            ERROR</button>
          {{#each api.errors.name as |error index|}}
            <p id={{concat 'error-' index}}>{{error.message}}</p>
            <p id={{concat 'type-' index}}>{{error.type}}</p>
          {{/each}}
        </form>
      </Formidable>
    </template>);
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

  test('isValid -- It should be update the valid state', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if api.isValid}}
            <p id='is-valid'>VALID</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    assert.dom('#is-valid').exists();
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#is-valid').doesNotExist();
  });

  test('invalidFields -- It should show invalid fields', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <input type='email' id='email' {{api.register 'email'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if (get api.invalidFields 'name')}}
            <p id='invalid-name'>INVALID</p>
          {{/if}}
          {{#if (get api.invalidFields 'email')}}
            <p id='invalid-email'>INVALID</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

    assert.dom('#invalid-name').doesNotExist();
    assert.dom('#invalid-email').doesNotExist();
    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#invalid-name').exists();
    assert.dom('#invalid-email').doesNotExist();
  });

  test('errorMessages -- It should show errors', async function (assert) {
    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <input type='email' id='email' {{api.register 'email'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#each api.errorMessages as |error|}}
            <p id='error'>{{error}}</p>
          {{/each}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').hasText('Name is required.');
  });

  test('getFieldState -- It should update the state', async function (assert) {
    const getError = (state: FieldState) => {
      return state.error?.[0]?.message;
    };

    await render(<template>
      <Formidable @values={{data}} @validator={{validator}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <input type='email' id='email' {{api.register 'email'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#if (get (api.getFieldState 'name') 'isInvalid')}}
            <p id='invalid-name'>INVALID</p>
          {{/if}}
          {{#if (get (api.getFieldState 'name') 'error')}}
            <p id='error-name'>{{getError (api.getFieldState 'name')}}</p>
          {{/if}}
          {{#if (get (api.getFieldState 'email') 'isInvalid')}}
            <p id='invalid-email'>INVALID</p>
          {{/if}}
          {{#if (get (api.getFieldState 'email') 'error')}}
            <p id='error-email'>{{getError (api.getFieldState 'email')}}</p>
          {{/if}}
        </form>
      </Formidable>
    </template>);

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

  test('revalidateOn -- onChange -- It should revalidate errors', async function (assert) {
    const validateOn: HandlerEvent[] = ['onSubmit'];
    const revalidateOn: HandlerEvent[] = ['onChange'];

    await render(<template>
      <Formidable
        @values={{data}}
        @validator={{validator}}
        @validateOn={{validateOn}}
        @revalidateOn={{revalidateOn}}
        as |api|
      >
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='name' {{api.register 'name'}} />
          <input type='email' id='email' {{api.register 'email'}} />
          <button id='submit' type='submit'>SUBMIT</button>
          {{#each api.errorMessages as |error|}}
            <p id='error'>{{error}}</p>
          {{/each}}
        </form>
      </Formidable>
    </template>);

    await fillIn('#name', '');
    await click('#submit');
    assert.dom('#error').hasText('Name is required.');
    await fillIn('#name', 'Nicolas Sarkozy');
    assert.dom('#error').doesNotExist();
  });
});
