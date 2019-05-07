import EmberObject from '@ember/object';
import VideoStateHandlerMixinMixin from 'web/mixins/video-state-handler-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | video-state-handler-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let VideoStateHandlerMixinObject = EmberObject.extend(VideoStateHandlerMixinMixin);
    let subject = VideoStateHandlerMixinObject.create();
    assert.ok(subject);
  });
});
