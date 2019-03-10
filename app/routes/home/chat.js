import Route from '@ember/routing/route';
import Ember from "ember";

export default Route.extend({
  model(params) {
    return Ember.RSVP.hash({
      chat: this.store.peekRecord('friends', params['chat_id']),
      mode: params['mode']
    });
  },
  activate() {
    this._super(...arguments);
    Ember.$('body').addClass('chat');
  },
  deactivate() {
    this._super(...arguments);
    Ember.$('body').removeClass('chat');
  }
});
