import EmberObject from '@ember/object';
import FeedEventItemHelperMixin from 'web/mixins/feed-event-item-helper';
import { module, test } from 'qunit';

module('Unit | Mixin | feed-event-item-helper', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let FeedEventItemHelperObject = EmberObject.extend(FeedEventItemHelperMixin);
    let subject = FeedEventItemHelperObject.create();
    assert.ok(subject);
  });
});
