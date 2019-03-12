import Ember from 'ember';
import Service from '@ember/service';
import {storageFor} from 'ember-local-storage';

export default Service.extend({
  uid: null,
  localStore: storageFor('user-session'),
  firebaseApp: Ember.inject.service(),
  store: Ember.inject.service(),
  init() {
    this._super(...arguments);
    const localStore = this.get('localStore');
    this.set('uid', localStore.get('uid'));
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setUID(user.uid)
      } else {
        this.setUID("")
      }
    });
  },
  logout() {
    this.firebaseApp.auth().signOut().then(() => {
      location.reload();
    });
  },
  setUID(id) {
    this.set('uid', id);
    this.set('localStore.uid', id);
  }
});
