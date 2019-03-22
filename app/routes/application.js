import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
export default Route.extend({
  auth: service(),
  db: service(),
  firebaseApp: service(),
  firebaseMessage: service(),
  ntp: service(),
  activate() {
    this._super(...arguments);
    this.get('ntp');
  },
  afterModel() {
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {

        this.db.messaging.requestPermission().then(() => {
          console.log('Notification permission granted.');
          this.db.messagePermissionsGranted();

        }).catch((err) => {
          console.log('Unable to get permission to notify.', err);
        });
        this.db.handleOnline();
        this.db.followers(user.uid, (list) => {
          let ct = this.controllerFor('application');
          ct.set('followers', list);
        });

        this.db.profileObserver(user.uid, (model) => {
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
