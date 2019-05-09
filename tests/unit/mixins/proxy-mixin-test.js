import EmberObject from '@ember/object';
import ProxyMixinMixin from 'web/mixins/proxy-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | proxy-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ProxyMixinObject = EmberObject.extend(ProxyMixinMixin);
    let subject = ProxyMixinObject.create();
    assert.ok(subject);
  });
});
