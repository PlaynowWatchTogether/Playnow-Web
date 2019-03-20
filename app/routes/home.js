import Route from '@ember/routing/route';
import Ember from 'ember'
import {inject as service} from '@ember/service';

export default Route.extend({
  db: service(),
  firebaseApp: service(),
  auth: service(),

  beforeModel() {
    this._super(...arguments);
    return new Promise((resolve, reject) => {
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
    return Ember.RSVP.hash({
      profile: this.store.find('user', this.get('user').uid)
    });
  },
  activate() {
    this._super(...arguments);
    this.get('db').friends((friends) => {
      let ctrl = this.controllerFor('home');
      ctrl.set('friends', friends);
    }, () => {

    });
    this.get('db').groups((friends) => {
      let ctrl = this.controllerFor('home');
      ctrl.set('groups', friends);
    }, () => {

    });
    $('body').addClass('home');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('home');
  }
});
