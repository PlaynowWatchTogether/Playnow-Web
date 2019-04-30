import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import $ from 'jquery';
import moment from 'moment';

export default Component.extend({
  classNameBindings: ['mine'],
  store: service(),
  auth: service(),
  attributeBindings: ['messageUid','messageTS'],
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
  user: computed('model', function () {
    return this.store.find('user', this.get('model').senderId);
  }),
  messageTS: computed('model', function(){
    return this.get('model.date');
  }),
  messageUid: computed('model', function () {
    return this.get('model.uid');
  }),
  mine: computed('model', 'auth.uid', function () {
    return this.get('model').senderId === this.auth.get('uid')
  }),
  inReplyTo: computed('model', function(){
    return this.get('model.inReplyTo');
  }),
  isAttachment: computed('model', function(){
    let model = this.get('model');
    let type = model['type'];
    return type === 'attachment' || type === 'photo' || type === 'Video';
  }),
  isLoading: computed('model', function(){
    let model = this.get('model');
    return model['isLoading'];
  }),
  senderName: computed('model', function(){
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
  shareVideoTitle: computed('model', function(){
    const model = this.get('model');
    const video = model.video;
    return `${video.title} | ${video.channelTitle}`;

  }),
  isShareVideo: computed('model', function(){
    let model = this.get('model');
    let type = model['type'];
    return type === 'ShareVideo';
  }),
  attachments: computed('model', function(){
    let model = this.get('model');
    let type = model['type'];
    let attachments = [];
    if (type === 'photo'){//back compatible photo
      attachments.push({
        type:'image/*',
        url: model.thumbnail
      });
    }
    if (type === 'Video'){//back compatible video
      attachments.push({
        type:'video/*',
        url: model.media
      });
    }
    if (type === 'attachment'){//back compatible one attachment      
      attachments.push(model.attachment);    
    }
    if (model.attachments){
      model.attachments.forEach((elem)=>{
        attachments.push(elem);
      });
    }
    return attachments;
  }),
  textAuthorClass: computed('model','members', function(){
    let members = this.get('members');
    let model = this.get('model');    
    if (members && model){
       var clr = this.get('memberColors')[model.senderId];
       if (clr)
          return `color: ${clr}`;
        clr = this.randomColor();
        this.get('memberColors')[model.senderId] = clr;
        return `color: ${clr}`;
    }
    return '';
  }),
  photoThumbnail: computed('model', function(){
      let model = this.get('model');
      if (model.type === 'photo'){
        return this.get('model.thumbnail');
      }else if (model.type === 'attachment'){
        return model.attachment.url;
      }else {
        return '';
      }
  }),
  isPhoto: computed('model', function () {
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
  isVideo: computed('model', function () {
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
  attachmentName: computed('model', function(){
    let model = this.get('model');
    return model.attachment.name;
  }),
  videoSrc: computed('model', function () {
    let model = this.get('model');
    if (model.type === 'Video'){
      return model['media'];
    }
    if (model.type === 'attachment'){
      return model.attachment.url;
    }
    return '';
  }),
  videoThumbnail: computed('model', function () {
    let model = this.get('model');
    return model['media_thumbnail'];
  }),
  hasVideoThumbnail: computed('model', function () {
    let model = this.get('model');
    return model['media_thumbnail'] && model['media_thumbnail'].length > 0;
  }),
  attachmentUrl: computed('model', function(){
    let model = this.get('model');
    return model.attachment.url;
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
