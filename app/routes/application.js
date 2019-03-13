import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  auth: service(),
  db: service(),
  firebaseApp: service(),
  activate() {
    this._super(...arguments);
  },
  afterModel() {
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        this.db.followers(user.uid, (list) => {
          let ct = this.controllerFor('application');
          ct.set('followers', list);
        });
        this.store.find('user', user.uid).then((model) => {
          this.set('model', model);
          let ct = this.controllerFor('application');
          ct.set('model', model);
        });
      } else {
        this.set('model', null);
        let ct = this.controllerFor('application');
        ct.set('model', null);
      }

    });
  },
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
