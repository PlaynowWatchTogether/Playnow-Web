import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | home/group', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:home/group');
    assert.ok(route);
  });
});
