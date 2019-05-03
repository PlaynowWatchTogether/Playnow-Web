import EmberObject from '@ember/object';
import UuidGeneratorMixin from 'web/mixins/uuid-generator';
import { module, test } from 'qunit';

module('Unit | Mixin | uuid-generator', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let UuidGeneratorObject = EmberObject.extend(UuidGeneratorMixin);
    let subject = UuidGeneratorObject.create();
    assert.ok(subject);
  });
});
