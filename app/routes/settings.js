import Route from '@ember/routing/route';
import AuthRouteMixin from '../mixins/auth-route-mixin'
import {inject as service} from '@ember/service';

export default Route.extend(AuthRouteMixin, {
  firebaseApp: service(),
  db: service(),
  model() {
    return new Promise((resolve, reject) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
          this.db.profile(user.uid).then((profile) => {
            resolve(profile);
          }).catch((error) => {
            reject(error);
          });
        } else {
          reject()
        }
      })
    });

  }
});
