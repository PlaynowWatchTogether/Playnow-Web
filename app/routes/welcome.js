import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
export default Route.extend({
  firebaseApp: service(),
  db: service(),
  beforeModel() {
    return new Promise((resolve) => {
      this.get('db').authClb((user) => {
        if (user) {
          this.transitionTo('home');
        } else {
          resolve();
        }
      })
    })
  },
  activate() {
    this._super(...arguments);
    $('body').addClass('welcome');
  },
  deactivate() {
    $('body').removeClass('welcome');
    this._super(...arguments);
  }
});
