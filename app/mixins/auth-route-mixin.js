import Mixin from '@ember/object/mixin';
import {inject as service} from '@ember/service';

export default Mixin.create({
  firebaseApp: service(),
  beforeModel() {
    return new Promise((resolve) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
          resolve()
        } else {
          this.transitionTo('welcome')
        }
      })
    });
  }
});
