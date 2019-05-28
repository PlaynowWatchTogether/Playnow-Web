import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';

export default Route.extend({
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
  model() {
    return new Promise((resolve) => {
      this.get('db').authClb((user) => {

        if (user) {
          resolve({id:user.uid});
        } else {
          resolve({})
        }
      })

    });
  }
});
