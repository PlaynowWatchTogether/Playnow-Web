import EmberObject from '@ember/object';
import FeedReactionableElemMixin from 'web/mixins/feed-reactionable-elem';
import { module, test } from 'qunit';

module('Unit | Mixin | feed-reactionable-elem', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let FeedReactionableElemObject = EmberObject.extend(FeedReactionableElemMixin);
    let subject = FeedReactionableElemObject.create();
    assert.ok(subject);
  });
});
