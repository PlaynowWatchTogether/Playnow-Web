import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import $ from 'jquery';
import moment from 'moment';

export default Component.extend({
  classNameBindings: ['mine'],
  store: service(),
  auth: service(),
  attributeBindings: ['data-uid:messageUid'],
  user: computed('model', function () {
    return this.store.find('user', this.get('model').senderId);
  }),
  messageUid: computed('model', function () {
    return this.get('model.uid');
  }),
  mine: computed('model', 'auth.uid', function () {
    return this.get('model').senderId === this.auth.get('uid')
  }),
  isPhoto: computed('model', function () {
    let model = this.get('model');
    let type = model['type'];
    return type === 'photo';
  }),
  isVideo: computed('model', function () {
    let model = this.get('model');
    let type = model['type'];
    return type === 'Video';
  }),
  videoSrc: computed('model', function () {
    let model = this.get('model');
    return model['media'];
  }),
  videoThumbnail: computed('model', function () {
    let model = this.get('model');
    return model['media_thumbnail'];
  }),
  hasVideoThumbnail: computed('model', function () {
    let model = this.get('model');
    return model['media_thumbnail'] && model['media_thumbnail'].length > 0;
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
  tooltipPlacement: computed('model', 'auth.uid', function(){
    if (this.get('model').senderId === this.auth.get('uid')){
      return 'right';
    }else{
      return 'left';
    }
  }),
  tooltipValue: computed('model', function(){
    let mesDate = this.get('model.date')
    if (this.get('model.serverDate')) {
      mesDate = this.get('model.serverDate');
    } else {
      if (this.get('model.date') % 1 !== 0) {
        mesDate = this.get('model.date') * 1000;
      }
    }
    return moment(mesDate).format("ddd, hh:mm A")
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
  didInsertElement() {
    this._super(...arguments);
    $(this.element).find('.with-tooltip').tooltip({container: 'body',boundary: 'window'});
  },
  actions: {
    clickOnPhoto() {
      this.get('onPhotoSelect')(this.get('model.thumbnail'));
    },
    reply(){
      this.get('onReplyTo')(this.get('model'));
    }
  }


});
