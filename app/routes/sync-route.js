import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
import ApplicationFriendsMixin from '../mixins/application-friends-mixin';
import ApplicationDBFeed from '../mixins/application-db-feed';
import ApplicationUserFeed from '../mixins/application-user-feed';
import ApplicationNotificationMixin from '../mixins/application-notifications-mixin';
export default Route.extend(ApplicationFriendsMixin,ApplicationDBFeed,ApplicationUserFeed,ApplicationNotificationMixin, {
  firebaseApp: service(),
  db: service(),
  auth: service(),
  gcmManager: service(),
  activate(){
    const myId = this.get('db').myId();
    this._super(...arguments);
    this.handleFeedSync();
    this.handleNotificationSync();
    this.db.handleOnline();
    const ctrl = this.controllerFor('application');
    this.db.followers(myId, (list) => {
      ctrl.set('followers', list);
    });

    this.db.profileObserver(myId, (model) => {
      // this.set('model', model);
      ctrl.set('model', model);
    });
    this.syncFriends(()=>{
      ctrl.set('lastUpdate',new Date());
    });
  },
  beforeModel() {
    this._super(...arguments);
    return new Promise((resolve, reject) => {
      this.get('db').authClb((user) => {
        if (user) {
          resolve()
        } else {
          reject()
        }
      })

    });
  }
})
