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
  }),
  videoRequestClass: computed('canClick', function () {
    return this.get('canClick') ? 'clickable' : '';
  }),
  bodyMessage: computed('model', function () {
    let model = this.get('model');
    return model['text'].autoLink();
  }),
  isLastSeen: computed('lastSeen', function () {
    let ret = false;
    let seen = this.get('lastSeen');
    let myId = this.get('myID');
    let model = this.get('model');
    if (seen && model.senderId === myId) {
      seen.forEach((elem) => {
        if (elem.userId !== myId && model['id'] === elem.messageId) {
          ret = true;
        }
      })
    }
    return ret;
  }),
  receiver: computed('model', 'members', function () {
    let members = this.get('members');
    let model = this.get('model');
    if (members) {
      let receiver = null;
      members.forEach((elem) => {
        if (elem.id !== model.senderId) {
          receiver = this.store.find('user', elem.id);
        }
      });
      return receiver;
    }
    return null;
  }),
  click() {
    if (this.get('canClick')) {
      this.get('onClick')(this.model);
    }
  },
  actions: {
    clickOnPhoto() {
      this.get('onPhotoSelect')(this.get('model.thumbnail'));
    }
  }


});
