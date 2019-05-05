import EmberObject from '@ember/object';
import VideosSearchYoutubeMixinMixin from 'web/mixins/videos-search-youtube-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | videos-search-youtube-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let VideosSearchYoutubeMixinObject = EmberObject.extend(VideosSearchYoutubeMixinMixin);
    let subject = VideosSearchYoutubeMixinObject.create();
    assert.ok(subject);
  });
});
