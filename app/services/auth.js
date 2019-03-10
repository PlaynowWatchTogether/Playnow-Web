import Service from '@ember/service';
import {storageFor} from 'ember-local-storage';

export default Service.extend({
  uid: null,
  localStore: storageFor('user-session'),
  init() {
    this._super(...arguments);
    const localStore = this.get('localStore');
    this.set('uid', localStore.get('uid'));
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setUid(user.uid)
      } else {
        this.setUid("")
      }
    });
  },
  setUID(id) {
    this.set('uid', id);
    this.set('localStore.uid', id);
  }
});
