import EmberObject from '@ember/object';
import ApplicationNotificationsMixinMixin from 'web/mixins/application-notifications-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | application-notifications-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ApplicationNotificationsMixinObject = EmberObject.extend(ApplicationNotificationsMixinMixin);
    let subject = ApplicationNotificationsMixinObject.create();
    assert.ok(subject);
  });
});
