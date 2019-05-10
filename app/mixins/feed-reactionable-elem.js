import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';

export default Mixin.create({
  db:service(),
  postCommentsCount: computed('model.Comments.@each', function(){
    const comments = this.get('model.Comments') || {};
    return Object.keys(comments).length;
  }),
  isLiked: computed('model.Likes.@each', function(){
    const likes = this.get('model.Likes');
    return (Object.keys(likes || {})).includes(this.get('db').myId());
  }),
  postLikesCount: computed('model.Likes.@each', function(){
    const likes = this.get('model.Likes') || {};
    return Object.keys(likes).length
  }),
  modelComments: computed('model.Comments.@each.id', function(){
    const comments = this.get('model.Comments') || {};
    return Object.values(comments).sort(function(a,b){
      return a['serverDate'] - b['serverDate'];
    })
  }),
  actions:{
    toggleReactionComments(){
      this.toggleProperty('showComments');
      const act = this.get('willShowCommentsForMessage');
      if (act){
        act(this.get('showComments'));
      }
      return true;
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
