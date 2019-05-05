import EmberObject from '@ember/object';
import YoutubeVideoViewMixin from 'web/mixins/youtube-video-view';
import { module, test } from 'qunit';

module('Unit | Mixin | youtube-video-view', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let YoutubeVideoViewObject = EmberObject.extend(YoutubeVideoViewMixin);
    let subject = YoutubeVideoViewObject.create();
    assert.ok(subject);
  });
});
