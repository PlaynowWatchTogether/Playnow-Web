import EmberObject from '@ember/object';
import MessageAttachmentsWrapperMixin from 'web/mixins/message-attachments-wrapper';
import { module, test } from 'qunit';

module('Unit | Mixin | message-attachments-wrapper', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let MessageAttachmentsWrapperObject = EmberObject.extend(MessageAttachmentsWrapperMixin);
    let subject = MessageAttachmentsWrapperObject.create();
    assert.ok(subject);
  });
});
