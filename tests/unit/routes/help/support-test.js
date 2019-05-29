import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | help/support', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:help/support');
    assert.ok(route);
  });
});
