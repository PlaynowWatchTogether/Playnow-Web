import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  auth: service(),
  firebaseApp: service(),
  model() {
    return new Promise((resolve, reject) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
          this.store.find('user', user.uid).then((model) => {
            // let controller = this.controllerFor('application');
            // controller.set('user',model)
            resolve(model);
          });

        } else {
          resolve()
        }
      })

    });
  }
});
