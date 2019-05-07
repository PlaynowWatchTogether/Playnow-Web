import EmberObject from '@ember/object';
import ChatModelHelperMixin from 'web/mixins/chat-model-helper';
import { module, test } from 'qunit';

module('Unit | Mixin | chat-model-helper', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ChatModelHelperObject = EmberObject.extend(ChatModelHelperMixin);
    let subject = ChatModelHelperObject.create();
    assert.ok(subject);
  });
});
