import Route from '@ember/routing/route';
import Ember from 'ember'
import {inject as service} from '@ember/service';

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
