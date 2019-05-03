import EmberObject from '@ember/object';
import MessagingMesssagePagerMixin from 'web/mixins/messaging-messsage-pager';
import { module, test } from 'qunit';

module('Unit | Mixin | messaging-messsage-pager', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let MessagingMesssagePagerObject = EmberObject.extend(MessagingMesssagePagerMixin);
    let subject = MessagingMesssagePagerObject.create();
    assert.ok(subject);
  });
});
