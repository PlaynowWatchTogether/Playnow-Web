import EmberObject from '@ember/object';
import CreateEventMixinMixin from 'web/mixins/create-event-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | create-event-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CreateEventMixinObject = EmberObject.extend(CreateEventMixinMixin);
    let subject = CreateEventMixinObject.create();
    assert.ok(subject);
  });
});
