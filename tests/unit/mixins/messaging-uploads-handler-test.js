import EmberObject from '@ember/object';
import MessagingUploadsHandlerMixin from 'web/mixins/messaging-uploads-handler';
import { module, test } from 'qunit';

module('Unit | Mixin | messaging-uploads-handler', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let MessagingUploadsHandlerObject = EmberObject.extend(MessagingUploadsHandlerMixin);
    let subject = MessagingUploadsHandlerObject.create();
    assert.ok(subject);
  });
});
