import EmberObject from '@ember/object';
import ChatPlaylistHandlerMixin from 'web/mixins/chat-playlist-handler';
import { module, test } from 'qunit';

module('Unit | Mixin | chat-playlist-handler', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ChatPlaylistHandlerObject = EmberObject.extend(ChatPlaylistHandlerMixin);
    let subject = ChatPlaylistHandlerObject.create();
    assert.ok(subject);
  });
});
