import EmberObject from '@ember/object';
import {computed} from '@ember/object';

export default EmberObject.extend({
  model: null,

  userName: computed('model', function () {
    let uname = this.get('model')['Username'];
    if (uname)
      return uname;
    let email = this.get('model.Email');
    return email.split("@")[0];
  })
});
