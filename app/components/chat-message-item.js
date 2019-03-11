import Ember from 'ember';
import Component from '@ember/component';
import EmberObject, {computed} from '@ember/object';

export default Component.extend({
  classNameBindings: ['mine'],
  store: Ember.inject.service(),
  auth: Ember.inject.service(),
  user: computed('model', function () {
    return this.store.find('user', this.get('model').senderId);
  }),
  mine: computed('model', 'auth.uid', function () {
    return this.get('model').senderId === this.auth.get('uid')
  })
});
