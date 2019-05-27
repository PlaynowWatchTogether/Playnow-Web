import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import MessageDataSource from "../custom-objects/message-data-source";
import {debug} from '@ember/debug';
import $ from 'jquery';
import {Promise} from 'rsvp';
import ApplicationFriendsMixin from '../mixins/application-friends-mixin';
import ApplicationDBFeed from '../mixins/application-db-feed';
import ApplicationUserFeed from '../mixins/application-user-feed';
import ApplicationNotificationMixin from '../mixins/application-notifications-mixin';
export default Route.extend(ApplicationFriendsMixin,ApplicationDBFeed,ApplicationUserFeed,ApplicationNotificationMixin, {
  firebaseApp: service(),
  auth: service(),
  gcmManager: service(),
  db:service(),
  init() {
    this._super(...arguments);
    this.groupListeners = [];
  },
  beforeModel() {
    this._super(...arguments);
    return new Promise((resolve) => {
      this.get('db').authClb((user) => {
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
    return new Promise((resolve,reject)=>{
      const myID = this.get('db').myId();
      this.get('db').profile(myID).then((profile)=>{
        resolve(profile);
      }).catch((error)=>{
        reject(error);
      })
    });
  },
  activate() {
    this._super(...arguments);
    let ctrl = this.controllerFor('home');
    const myId = this.get('db').myId();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position)=>{
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.set('db.userLocation', {lat: lat, lng: lng});
        });
    }
    this.handleFeedSync();
    this.handleNotificationSync();
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
    this.db.followers(myId, (list) => {
      let ct = this.controllerFor('application');
      ct.set('followers', list);
    });

    this.db.profileObserver(myId, (model) => {
      this.set('model', model);
      let ct = this.controllerFor('application');
      ct.set('model', model);
    });
    this.syncFriends(()=>{
      ctrl.set('lastUpdate',new Date());
    });
    ctrl.activate();
    $('body').addClass('home');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('home');
  }
});
