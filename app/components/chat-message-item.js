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
  }),
  isPhoto: computed('model', function () {
    let model = this.get('model');
    let type = model['type'];
    return type === 'photo';
  }),
  isVideoRequest: computed('model', function () {
    let model = this.get('model');
    let type = model['type'];
    return type === 'VideoRequest';
  }),
  requestTitle: computed('model', function () {
    let model = this.get('model');
    return model['senderName'] + ' requested to watch:';
  }),
  requestThumbnail: computed('model', function () {
    let model = this.get('model');
    return model['video']['imageURL'];
  }),
  requestChannel: computed('model', function () {
    let model = this.get('model');
    return model['video']['title'];
  })
});
