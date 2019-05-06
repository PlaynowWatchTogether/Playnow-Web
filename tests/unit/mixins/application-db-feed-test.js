import EmberObject from '@ember/object';
import ApplicationDbFeedMixin from 'web/mixins/application-db-feed';
import { module, test } from 'qunit';

module('Unit | Mixin | application-db-feed', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ApplicationDbFeedObject = EmberObject.extend(ApplicationDbFeedMixin);
    let subject = ApplicationDbFeedObject.create();
    assert.ok(subject);
  });
});
