import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  firebaseApp: service(),
  beforeModel() {
    return new Promise((resolve) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
          this.transitionTo('home');
        } else {
          resolve();
        }
      })
    })
  }
});
