import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | help/privacy', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:help/privacy');
    assert.ok(route);
  });
});
