import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {storageFor} from 'ember-local-storage';
import ProfileObject from '../custom-objects/profile-object';

export default Service.extend({
  uid: null,
  localStore: storageFor('user-session'),
  firebaseApp: service(),
  store: service(),
  current: null,
  init() {
    this._super(...arguments);
    const localStore = this.get('localStore');
    this.set('uid', localStore.get('uid'));
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        this.userUpdate = (profile) => {
          this.current = ProfileObject.create({model: profile.val()});
        };
        this.firebaseApp.database().ref("Users/" + user.uid).on('value', this.userUpdate);
        this.setUID(user.uid)
      } else {
        this.setUID("")
      }
    });
  },
  logout() {
    return new Promise((resolve) => {
      this.firebaseApp.auth().signOut().then(() => {
        resolve();
      });
    });
  },
  setUID(id) {
    this.set('uid', id);
    this.set('localStore.uid', id);
  }
});
