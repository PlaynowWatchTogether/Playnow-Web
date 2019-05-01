import EmberObject from '@ember/object';
import FileUploadHelperMixin from 'web/mixins/file-upload-helper';
import { module, test } from 'qunit';

module('Unit | Mixin | file-upload-helper', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let FileUploadHelperObject = EmberObject.extend(FileUploadHelperMixin);
    let subject = FileUploadHelperObject.create();
    assert.ok(subject);
  });
});
