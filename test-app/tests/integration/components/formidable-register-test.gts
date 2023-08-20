/* eslint-disable qunit/no-only */
/* eslint-disable qunit/require-expect */
import { on } from '@ember/modifier';
import { click, fillIn, render, select } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('Values -- text -- It should update the value', async function (assert) {
    const data = {
      foo: 'DEFAULT',
    };

    const onUpdate = (data: { foo: string }) => {
      assert.strictEqual(data.foo, 'CHANGED');
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    await click('#submit');
  });

  test('Values -- no name positionnal -- It should update the value', async function (assert) {
    const data = {
      foo: 'DEFAULT',
    };

    const onUpdate = (data: { foo: string }) => {
      assert.strictEqual(data.foo, 'CHANGED');
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' name='foo' {{api.register}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    await click('#submit');
  });

  test('Values -- textarea -- It should update the value ', async function (assert) {
    const data = {
      foo: 'DEFAULT',
    };

    const onUpdate = (data: { foo: string }) => {
      assert.strictEqual(data.foo, 'CHANGED');
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <textarea id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    await click('#submit');
  });

  test('Values -- select -- It should update the value ', async function (assert) {
    const data = {
      pet: '🐶',
    };

    const onUpdate = (data: { pet: string }) => {
      assert.strictEqual(data.pet, '🐱');
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <select id='pet' {{api.register 'pet'}}>
            <option value='🐶' id='dog'>Dog</option>
            <option value='🐱' id='cat'>Cat</option>
            <option value='hamster' id='hamster'>Hamster</option>
          </select>
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#pet').hasValue('🐶');
    await select('#pet', '🐱');
    await click('#submit');
    assert.dom('#pet').hasValue('🐱');
  });

  test('Values -- radio -- It should update the value', async function (assert) {
    const data = {
      drone: 'huey',
    };

    const onUpdate = (data: { drone: string }) => {
      assert.strictEqual(data.drone, 'dewey');
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <fieldset>
            <legend>Select a maintenance drone:</legend>
            <div>
              <input type='radio' id='huey' value='huey' {{api.register 'drone'}} />
              <label for='huey'>Huey</label>
            </div>

            <div>
              <input type='radio' id='dewey' {{api.register 'drone'}} value='dewey' />
              <label for='dewey'>Dewey</label>
            </div>

            <div>
              <input type='radio' id='louie' {{api.register 'drone'}} value='louie' />
              <label for='louie'>Louie</label>
            </div>
          </fieldset>
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#huey').isChecked();
    await click('#dewey');
    await click('#submit');
    assert.dom('#dewey').isChecked();
  });

  test('Values -- checkbox -- It should update the value ', async function (assert) {
    const data = {
      foo: '🐍',
    };

    const onUpdate = (data: { foo: string }) => {
      assert.strictEqual(data.foo, '🦎');
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='checkbox' id='foo' {{api.register 'foo'}} value='🐍' />
          <input type='checkbox' id='bar' {{api.register 'foo'}} value='🦎' />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo').isChecked();
    assert.dom('#bar').isNotChecked();

    await click('#foo');
    await click('#bar');

    await click('#submit');
    assert.dom('#foo').isNotChecked();
    assert.dom('#bar').isChecked();
  });

  test('Values -- number -- It should update the value ', async function (assert) {
    const data = {
      foo: 3,
    };

    const onUpdate = (data: { foo: number }) => {
      assert.strictEqual(data.foo, 5);
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo' valueAsNumber=true}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo').hasValue('3');
    await fillIn('#foo', '5');
    await click('#submit');
  });

  test('Values -- date -- It should update the value ', async function (assert) {
    const data = {
      foo: new Date('2000-05-05'),
    };

    const onUpdate = (data: { foo: Date }) => {
      assert.deepEqual(data.foo, new Date('2001-05-05'));
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo' valueAsDate=true}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo').hasValue(new Date('2000-05-05').toString());
    await fillIn('#foo', '2001-05-05');
    await click('#submit');
  });

  test('Values -- object -- It should update the value ', async function (assert) {
    const data = {
      foo: { bar: 'DEFAULT' },
    };

    const onUpdate = (data: { foo: { bar: string } }) => {
      assert.strictEqual(data.foo.bar, 'CHANGED');
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo.bar'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    assert.dom('#foo').hasValue('DEFAULT');
    await fillIn('#foo', 'CHANGED');
    await click('#submit');
  });

  test('Values -- array -- It should update the value ', async function (assert) {
    const data = {
      foo: ['💞', '💝'],
    };

    const onUpdate = (data: { foo: string[] }) => {
      assert.deepEqual(data.foo, ['*', '**']);
    };

    await render(<template>
      <Formidable @values={{data}} @onValuesChanged={{onUpdate}} as |values api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo0' {{api.register 'foo.0'}} />
          <input type='text' id='foo1' {{api.register 'foo.1'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);
    assert.dom('#foo0').hasValue('💞');
    assert.dom('#foo1').hasValue('💝');

    await fillIn('#foo0', '*');

    await fillIn('#foo1', '**');
    await click('#submit');
  });
});
