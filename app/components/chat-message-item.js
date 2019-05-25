import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {get} from '@ember/object';
import $ from 'jquery';
import moment from 'moment';
import { htmlSafe } from '@ember/template';
import MessageAttachmentsWrapper from '../mixins/message-attachments-wrapper';

export default Component.extend(MessageAttachmentsWrapper, {
  classNameBindings: ['mine','senderSpace:sender-space'],
  store: service(),
  auth: service(),
  attributeBindings: ['messageUid','messageTS','messageDate','messageIndex:message-index'],
  shouldDisplaySender: computed('model', 'displaySender', function(){
    return this.get('displaySender') && !this.get('isShareVideo');
  }),
  videoRequestModel: computed('model', function(){
    let model = this.get('model');
    return {
      snippet: {
        title: model.get('video.title'),
        channelTitle: model.get('video.channelTitle'),
        thumbnails: {
          medium:{
            url: model.get('video.imageURL')
          }
        }
      }
    }
  }),
  messageTextClass: computed('model.{messageIndex,maxIndex}', function(){
    const model = this.get('model');
    const index = model.get('messageIndex');
    const max = model.get('maxIndex');
    if (max == 1){
      return 'single';
    }
    if (index === 0){
      return 'multiple-first';
    }
    if (index === max-1){
      return 'multiple-last';
    }
    return 'multiple-middle';
  }),
  messageIndex: computed('model.messageIndex', function(){
    return this.get('model.messageIndex');
  }),
  messageDate: computed(function(){
    return moment(this.get('model.date')).format('MM-DD-YYYY');
  }),
  messageTS: computed('model.date', function(){
    return this.get('model.date');
  }),
  messageUid: computed(function () {
    return this.get('model.uid');
  }),
  mine: computed(function () {
    return this.get('model.senderId') === this.auth.get('uid')
  }),
  textAuthorId: computed(function(){
    return this.get('model.senderId');
  }),
  inReplyTo: computed(function(){
    return this.get('model.inReplyTo');
  }),
  isAttachment: computed(function(){
    let model = this.get('model');
    let type = model.get('type');
    return type === 'attachment' || type === 'photo' || type === 'Video';
  }),

  senderName: computed(function(){
    return this.get('model.senderName');
  }),
  randomColor(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },
  shareVideoTitle: computed(function(){
    const model = this.get('model');
    const video = model.get('video');
    return `${video.title} | ${video.channelTitle}`;

  }),
  isShareVideo: computed(function(){
    let model = this.get('model');
    let type = model.get('type');
    return type === 'ShareVideo';
  }),
  attachments: computed(function(){
    let model = this.get('model');

    return this.wrapMessageAttachments(model);
  }),

  textAuthorClass: computed('model','members', function(){
    let members = this.get('members');
    let model = this.get('model');
    if (members && model){
       var clr = this.get('memberColors')[model.get('senderId')];
       if (clr)
          return htmlSafe(`color: ${clr}`);
        clr = this.randomColor();
        this.get('memberColors')[model.get('senderId')] = clr;
        return htmlSafe(`color: ${clr}`);
    }
    return htmlSafe('');
  }),

  videoSrc: computed(function () {
    let model = this.get('model');
    if (model.get('type') === 'Video'){
      return model.get('media');
    }
    if (model.get('type') === 'attachment'){
      return model.attachment.url;
    }
    return '';
  }),
  isVideoRequest: computed(function () {
    let model = this.get('model');
    let type = model.get('type');
    return type === 'VideoRequest';
  }),
  requestTitle: computed(function () {
    let model = this.get('model');
    return model.get('senderName') + ' requested to watch:';
  }),
  requestThumbnail: computed(function () {
    let model = this.get('model');
    return model.get('video.imageURL');
  }),
  requestChannel: computed(function () {
    let model = this.get('model');
    return model.get('video.title');
  }),
  videoRequestClass: computed(function () {
    return this.get('canClick') ? 'clickable' : '';
  }),
  bodyMessage: computed(function () {
    let model = this.get('model');
    return model.get('text').autoLink();
  }),
  isLocal: computed('model.isLocal', function(){
    return this.get('model.isLocal');
  }),
  isLastSeen: computed('lastSeen', function () {
    let ret = false;
    let seen = this.get('lastSeen');
    let myId = this.get('myID');
    let model = this.get('model');
    if (seen && model.get('senderId') === myId) {
      seen.forEach((elem) => {
        if (get(elem,'userId') !== myId && model.get('uid') === elem.messageId) {
          ret = true;
        }
      })
    }
    return ret;
  }),
  tooltipPlacement: computed(function(){
    if (this.get('model.senderId') === this.auth.get('uid')){
      return 'right';
    }else{
      return 'left';
    }
  }),
  tooltipValue: computed(function(){
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
  receiver: computed(function () {
    let members = this.get('members');
    let model = this.get('model');
    if (members) {
      let receiver = null;
      members.forEach((elem) => {
        if (get(elem,'id') !== model.get('senderId')) {
          receiver = elem;
        }
      });
      return receiver;
    }
    return null;
  }),

  click() {
    if (this.get('canClick')) {
      this.get('onClick')(this.get('model'));
    }
  },
  didInsertElement() {
    this._super(...arguments);
    $(this.element).find('.with-tooltip').tooltip({container: 'body',boundary: 'window'});
  },
  actions: {
    scrollToMessage(uid){
      const act = this.get('onScrollToMessage');
      if (act){
        act(uid);
      }
    },
    videoShareClick(){

    },
    videoRequestClick(){
      if (this.get('canClick')) {
        this.get('onClick')(this.get('model'));
      }
    },
    clickOnPhoto() {
      this.get('onPhotoSelect')(this.get('model.thumbnail'));
    },
    reply(){
      this.get('onReplyTo')(this.get('model'));
    }
  }


});
