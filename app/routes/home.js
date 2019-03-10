import Route from '@ember/routing/route';
import Ember from 'ember'
import {inject as service} from '@ember/service';

export default Route.extend({
  db: service(),
  model() {
    return Ember.RSVP.hash({friends: this.store.peekAll('friends')});
  },
  activate() {
    this._super(...arguments);

    this.db.friends(() => {

    }, () => {

    });
    Ember.$('body').addClass('home');
  },
  deactivate() {
    this._super(...arguments);
    Ember.$('body').removeClass('home');
  }
});
