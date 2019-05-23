import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import MessageDataSource from "../custom-objects/message-data-source";
import {hash} from 'rsvp';
import $ from 'jquery';
import {Promise} from 'rsvp';
import ApplicationFriendsMixin from '../mixins/application-friends-mixin';
export default Route.extend(ApplicationFriendsMixin, {
  firebaseApp: service(),
  auth: service(),
  gcmManager: service(),
  init() {
    this._super(...arguments);
    this.groupListeners = [];
  },
  beforeModel() {
    this._super(...arguments);
    return new Promise((resolve) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
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
    return hash({
      profile: this.store.find('user', this.get('user').uid)
    });
  },
  activate() {
    this._super(...arguments);
    let ctrl = this.controllerFor('home');
    // ctrl.set('friends', this.store.peekAll('friends'));
    // ctrl.set('groups', this.store.peekAll('group'));
    // ctrl.set('loading', true);
    this.syncFriends();
    ctrl.activate();
    $('body').addClass('home');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('home');
  }
});
