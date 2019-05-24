import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
export default Route.extend({
  firebaseApp: service(),
  db: service(),
  beforeModel() {
    this._super(...arguments);
    return new Promise((resolve, reject) => {
      this.get('db').authClb((user) => {
        if (user) {
          resolve()
        } else {
          reject()
        }
      })

    });
  }
})
