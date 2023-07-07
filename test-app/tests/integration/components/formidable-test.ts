import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';

import { render, TestContext } from '@ember/test-helpers';

module('Integration | Component | formidable', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (this: TestContext, assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Formidable />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <Formidable>
        template block text
      </Formidable>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
