import EmberObject from '@ember/object';
import FeedEventModelAccessMixin from 'web/mixins/feed-event-model-access';
import { module, test } from 'qunit';

module('Unit | Mixin | feed-event-model-access', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let FeedEventModelAccessObject = EmberObject.extend(FeedEventModelAccessMixin);
    let subject = FeedEventModelAccessObject.create();
    assert.ok(subject);
  });
});
