import EmberObject from '@ember/object';
import VideosSearchMixinMixin from 'web/mixins/videos-search-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | videos-search-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let VideosSearchMixinObject = EmberObject.extend(VideosSearchMixinMixin);
    let subject = VideosSearchMixinObject.create();
    assert.ok(subject);
  });
});
