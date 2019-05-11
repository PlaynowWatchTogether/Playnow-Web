import EmberObject from '@ember/object';
import ModelFeedItemModelAccessMixin from 'web/mixins/model/feed-item-model-access';
import { module, test } from 'qunit';

module('Unit | Mixin | model/feed-item-model-access', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ModelFeedItemModelAccessObject = EmberObject.extend(ModelFeedItemModelAccessMixin);
    let subject = ModelFeedItemModelAccessObject.create();
    assert.ok(subject);
  });
});
