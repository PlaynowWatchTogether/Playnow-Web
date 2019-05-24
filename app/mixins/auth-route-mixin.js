import Mixin from '@ember/object/mixin';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
export default Mixin.create({
  firebaseApp: service(),
  db:service(),
  beforeModel() {
    return new Promise((resolve) => {
      this.get('db').authClb((user) => {
        if (user) {
          resolve()
        } else {
          this.transitionTo('welcome')
        }
      })
    });
  }
});
