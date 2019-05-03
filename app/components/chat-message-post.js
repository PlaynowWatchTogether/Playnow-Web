import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';
import MessageAttachmentsWrapper from '../mixins/message-attachments-wrapper';

export default Component.extend(MessageAttachmentsWrapper, {
  db: service(),
  classNameBindings:['isMine:mine'],
  isMine: computed('model', function(){
    return this.get('model.senderId') === this.get('db').myId();
  }),
  postTimeFormatted: computed('model', function(){
      return moment(this.get('model.date')).format('ddd, hh:mm A');
  }),
  postCommentsCount: computed('model', function(){
    return this.get('model.commentsCount') || 0
  }),
  postLikesCount: computed('model', function(){
    return this.get('model.likesCount') || 0
  }),
  attachments: computed('model', function(){
    let model = this.get('model');
    return this.wrapMessageAttachments(model);
  }),
  hasText: computed('model', function(){
    return this.get('model.text').trim().length>0;
  })

});
