import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
export default Route.extend({
  firebaseApp: service(),
  beforeModel() {
    this._super(...arguments);
    return new Promise((resolve, reject) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
          resolve()
        } else {
          reject()
        }
      })

    });
  }
})
