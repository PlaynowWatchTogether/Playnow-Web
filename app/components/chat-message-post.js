import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';
import MessageAttachmentsWrapper from '../mixins/message-attachments-wrapper';
import {Promise} from 'rsvp';
import DS from 'ember-data';
export default Component.extend(MessageAttachmentsWrapper, {
  db: service(),
  classNameBindings:['isMine:mine'],
  isMine: computed('model', function(){
    return this.get('model.senderId') === this.get('db').myId();
  }),
  postTimeFormatted: computed('model.date', function(){
      return moment(this.get('model.date')).format('ddd, hh:mm A');
  }),
  postCommentsCount: computed('model.commentsCount', function(){
    return this.get('model.commentsCount') || 0
  }),
  isLiked: computed('model.Likes.@each', function(){
    const likes = this.get('model.Likes');
    return (Object.keys(likes || {})).includes(this.get('db').myId());
  }),
  postLikesCount: computed('model.likesCount', function(){
    return this.get('model.likesCount') || 0
  }),
  attachments: computed('model', function(){
    let model = this.get('model');
    return this.wrapMessageAttachments(model);
  }),
  hasText: computed('model.text', function(){
    return this.get('model.text').trim().length>0;
  }),
  modelComments: computed('model.Comments.@each.id', function(){
    const comments = this.get('model.Comments') || {};
    return Object.values(comments).sort(function(a,b){
      return a['serverDate'] - b['serverDate'];
    })
  }),
  actions: {
    toggleReactionComments(){
      this.toggleProperty('showComments');
      const act = this.get('willShowCommentsForMessage');
      if (act){
        act(this.get('showComments'));
      }

    },
    toggleLike(){
      const act = this.get('onLikePost');
      if (this.get('isLiked')){
        act(this.get('model'), false);
      }else{
        act(this.get('model'), true);
      }
    },
    onLikeComment(comment, like){
      const act = this.get('onLikeComment');
      act(this.get('model'), comment, like);
    },
    postComment(){
      const text = this.get('commentText');
      if (!text || text.length === 0)
        return;
      const act = this.get('postCommentForMessage');
      act(this.get('model'), this.get('commentText'));
      this.set('commentText','');
    }
  }

});
