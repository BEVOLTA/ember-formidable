/* eslint-disable qunit/require-expect */
import { on } from '@ember/modifier';
import { click, fillIn, render } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Formidable } from 'ember-formidable';
import { setupRenderingTest } from 'test-app/tests/helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('Service -- Service should return updated values', async function (assert) {
    const formidable = this.owner.lookup('service:formidable');

    assert.ok(formidable);

    const data = {
      foo: 'DEFAULT',
      bar: 'BAZ',
    };

    await render(<template>
      <Formidable @serviceId='test' @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    await fillIn('#foo', 'CHANGED');

    await click('#submit');
    assert.strictEqual(formidable.getFormidableApi('test').values['foo'], 'CHANGED');
    assert.strictEqual(formidable.getValue('test', 'foo'), 'CHANGED');

    assert.deepEqual(formidable.getValues('test', ['foo', 'bar']), {
      foo: 'CHANGED',
      bar: 'BAZ',
    });
  });

  test('Service -- It should unregister', async function (assert) {
    const formidable = this.owner.lookup('service:formidable');

    assert.ok(formidable);

    const data = {
      foo: 'DEFAULT',
      bar: 'BAZ',
    };

    await render(<template>
      <Formidable @serviceId='test' @values={{data}} as |api|>
        <form {{on 'submit' api.onSubmit}}>
          <input type='text' id='foo' {{api.register 'foo'}} />
          <button id='submit' type='submit'>SUBMIT</button>
        </form>
      </Formidable>
    </template>);

    assert.ok(formidable.getFormidableApi('test'));

    await render(<template><div>EMPTY</div></template>);

    assert.throws(() => formidable.getFormidableApi('test'));
  });
});
