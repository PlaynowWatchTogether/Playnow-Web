import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import ApplicationDBFeed from '../mixins/application-db-feed';
import ApplicationUserFeed from '../mixins/application-user-feed';

export default Route.extend(ApplicationDBFeed,ApplicationUserFeed, {
  auth: service(),
  db: service(),
  firebaseApp: service(),
  ntp: service(),
  isMobile: service(),
  activate() {
    this._super(...arguments);
    this.get('ntp');
  },
  beforeModel() {
    if (this.get('isMobile.any')) {
      this.transitionTo('mobile')
    }
  },
  afterModel() {
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        this.handleFeedSync();
        this.handleUserFeedSync();

        this.db.messaging.requestPermission().then(() => {
          debug('Notification permission granted.');
          this.db.messagePermissionsGranted();
          this.db.messaging.onMessage((message) => {
            debug('Message received ' + message);
          });
          this.db.messaging.setBackgroundMessageHandler(function (payload) {
            debug('[firebase-messaging-sw.js] Received background message ', payload);
            self.clients.matchAll({includeUncontrolled: true}).then(function (clients) {
              debug.log(clients);
              //you can see your main window client in this list.
              clients.forEach(function (client) {
                client.postMessage('YOUR_MESSAGE_HERE');
              })
            })
          });

        }).catch((err) => {
          debug('Unable to get permission to notify.', err);
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
    return new Promise((resolve) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
          this.db.profile(user.uid).then((model) => {
            resolve(model);
          })


        } else {
          resolve()
        }
      })

    });
  }
});
