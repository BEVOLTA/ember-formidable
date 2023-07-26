/* eslint-disable qunit/require-expect */
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { FormidableContext } from 'test-app/tests/types';

import { click, fillIn, render } from '@ember/test-helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('Service -- Service should return updated values', async function (this: FormidableContext, assert) {
    const formidable = this.owner.lookup('service:formidable');
    assert.ok(formidable);
    this.values = {
      foo: 'DEFAULT',
    };

    await render(hbs`
      <Formidable @serviceId="test" @values={{this.values}}  as |values api|>
        <form {{on "submit" api.onSubmit}}>
          <input type="text" id="foo" {{api.register "foo"}} />
          <p id="isSubmitted">{{api.isSubmitted}}</p>
          <button id="submit"  type="submit">SUBMIT</button>
        </form>
      </Formidable>
    `);

    await fillIn('#foo', 'CHANGED');

    await click('#submit');
    assert.strictEqual(
      // @ts-ignore
      formidable.getFormidableApi('test').values.foo,
      'CHANGED'
    );
  });
});
