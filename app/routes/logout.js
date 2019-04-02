import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
export default Route.extend({
  auth: service(),
  firebaseApp: service(),
  beforeModel() {
    this._super(...arguments);
    return new Promise((resolve) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
        this.set('user', user);
        if (user) {
          resolve()
        } else {
          this.transitionTo('welcome')
        }
      })

    });
  },
  model() {
    return new Promise((resolve) => {
      if (this.get('user')) {
        this.get('auth').logout().then(() => {
          location.reload();
        })
      } else {
        this.transitionTo('home');
      }
    })
  }
});
