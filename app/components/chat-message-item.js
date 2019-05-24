import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
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
        title: model.video.title,
        channelTitle: model.video.channelTitle,
        thumbnails: {
          medium:{
            url: model.video.imageURL
          }
        }
      }
    }
  }),
  messageTextClass: computed('model.{messageIndex,maxIndex}', function(){
    const model = this.get('model');
    const index = model.messageIndex;
    const max = model.maxIndex;
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
  messageUid: computed('model.uid', function () {
    return this.get('model.uid');
  }),
  mine: computed('model', 'auth.uid', function () {
    return this.get('model').senderId === this.auth.get('uid')
  }),
  textAuthorId: computed(function(){
    return this.get('model.senderId');
  }),
  inReplyTo: computed(function(){
    return this.get('model.inReplyTo');
  }),
  isAttachment: computed(function(){
    let model = this.get('model');
    let type = model['type'];
    return type === 'attachment' || type === 'photo' || type === 'Video';
  }),
  isLoading: computed(function(){
    let model = this.get('model');
    return model['isLoading'];
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
    const video = model.video;
    return `${video.title} | ${video.channelTitle}`;

  }),
  isShareVideo: computed(function(){
    let model = this.get('model');
    let type = model['type'];
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
       var clr = this.get('memberColors')[model.senderId];
       if (clr)
          return htmlSafe(`color: ${clr}`);
        clr = this.randomColor();
        this.get('memberColors')[model.senderId] = clr;
        return htmlSafe(`color: ${clr}`);
    }
    return htmlSafe('');
  }),
  photoThumbnail: computed(function(){
      let model = this.get('model');
      if (model.type === 'photo'){
        return this.get('model.thumbnail');
      }else if (model.type === 'attachment'){
        return model.attachment.url;
      }else {
        return '';
      }
  }),
  isPhoto: computed(function () {
    let model = this.get('model');
    let type = model['type'];
    if (type === 'photo'){
      return true;
    }
    if (type === 'attachment'){
      return model.attachment.type.startsWith('image/');
    }
    return false;
  }),
  isVideo: computed(function () {
    let model = this.get('model');
    let type = model['type'];
    if (type === 'Video'){
      return true;
    }
    if (type === 'attachment'){
      return model.attachment.type === 'video/mp4' || model.attachment.type==='video/quicktime';
    }
    return false;
  }),
  attachmentName: computed(function(){
    let model = this.get('model');
    return model.attachment.name;
  }),
  videoSrc: computed(function () {
    let model = this.get('model');
    if (model.type === 'Video'){
      return model['media'];
    }
    if (model.type === 'attachment'){
      return model.attachment.url;
    }
    return '';
  }),
  videoThumbnail: computed(function () {
    let model = this.get('model');
    return model['media_thumbnail'];
  }),
  hasVideoThumbnail: computed(function () {
    let model = this.get('model');
    return model['media_thumbnail'] && model['media_thumbnail'].length > 0;
  }),
  attachmentUrl: computed(function(){
    let model = this.get('model');
    return model.attachment.url;
  }),
  isVideoRequest: computed(function () {
    let model = this.get('model');
    let type = model['type'];
    return type === 'VideoRequest';
  }),
  requestTitle: computed(function () {
    let model = this.get('model');
    return model['senderName'] + ' requested to watch:';
  }),
  requestThumbnail: computed(function () {
    let model = this.get('model');
    return model['video']['imageURL'];
  }),
  requestChannel: computed(function () {
    let model = this.get('model');
    return model['video']['title'];
  }),
  videoRequestClass: computed(function () {
    return this.get('canClick') ? 'clickable' : '';
  }),
  bodyMessage: computed(function () {
    let model = this.get('model');
    return model['text'].autoLink();
  }),
  isLocal: computed('model.isLocal', function(){
    return this.get('model.isLocal');
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
  tooltipPlacement: computed(function(){
    if (this.get('model').senderId === this.auth.get('uid')){
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
        if (elem.id !== model.senderId) {
          receiver = elem;
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
        this.get('onClick')(this.model);
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
