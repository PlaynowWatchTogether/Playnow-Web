import EmberObject from '@ember/object';
import FeedFeedActionsMixin from 'web/mixins/feed/feed-actions';
import { module, test } from 'qunit';

module('Unit | Mixin | feed/feed-actions', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let FeedFeedActionsObject = EmberObject.extend(FeedFeedActionsMixin);
    let subject = FeedFeedActionsObject.create();
    assert.ok(subject);
  });
});
