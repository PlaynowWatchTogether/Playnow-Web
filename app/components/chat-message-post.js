import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';
import MessageAttachmentsWrapper from '../mixins/message-attachments-wrapper';
import {Promise} from 'rsvp';
import DS from 'ember-data';
import FeedReactionableElem from '../mixins/feed-reactionable-elem';
import { get } from '@ember/object';

export default Component.extend(MessageAttachmentsWrapper, FeedReactionableElem, {
  db: service(),
  classNameBindings:['isMine:mine'],
  isMine: computed(function(){
    return this.get('model.senderId') === this.get('db').myId();
  }),
  postTimeFormatted: computed(function(){
      return moment(this.get('model.date')).format('ddd, hh:mm A');
  }),

  attachments: computed(function(){
    let model = this.get('model');
    return this.wrapMessageAttachments(model).filter((elem)=>{
      return !get(elem,'type').startsWith('image/');
    });
  }),
  allAttachments: computed(function(){
    let model = this.get('model');
    return this.wrapMessageAttachments(model);
  }),
  imageAttachments: computed(function(){
    let model = this.get('model');
    return this.wrapMessageAttachments(model).filter((elem)=>{
      return get(elem,'type').startsWith('image/');
    });
  }),
  hasText: computed(function(){
    return (this.get('model.text')||'').trim().length>0;
  }),
  actions: {

  }

});
