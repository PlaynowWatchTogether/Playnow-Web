import EmberObject from '@ember/object';
import MessagingMessageHelperMixin from 'web/mixins/messaging-message-helper';
import { module, test } from 'qunit';

module('Unit | Mixin | messaging-message-helper', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let MessagingMessageHelperObject = EmberObject.extend(MessagingMessageHelperMixin);
    let subject = MessagingMessageHelperObject.create();
    assert.ok(subject);
  });
});
