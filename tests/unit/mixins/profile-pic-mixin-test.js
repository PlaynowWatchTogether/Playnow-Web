import EmberObject from '@ember/object';
import ProfilePicMixinMixin from 'web/mixins/profile-pic-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | profile-pic-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ProfilePicMixinObject = EmberObject.extend(ProfilePicMixinMixin);
    let subject = ProfilePicMixinObject.create();
    assert.ok(subject);
  });
});
