import EmberObject from '@ember/object';
import ApplicationFriendsMixinMixin from 'web/mixins/application-friends-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | application-friends-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ApplicationFriendsMixinObject = EmberObject.extend(ApplicationFriendsMixinMixin);
    let subject = ApplicationFriendsMixinObject.create();
    assert.ok(subject);
  });
});
