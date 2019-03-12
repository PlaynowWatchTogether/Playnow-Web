import EmberObject from '@ember/object';
import AuthRouteMixinMixin from 'web/mixins/auth-route-mixin';
import {module, test} from 'qunit';

module('Unit | Mixin | AuthRouteMixin', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let AuthRouteMixinObject = EmberObject.extend(AuthRouteMixinMixin);
    let subject = AuthRouteMixinObject.create();
    assert.ok(subject);
  });
});
