import { module, test } from 'qunit';

import { setupTest } from 'test-app/tests/helpers';

module('Unit | Model | parent', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('parent', {});
    assert.ok(model);
  });
});
