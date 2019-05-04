import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';

export default Component.extend({
  db: service(),
  authorName: computed('model', function(){
    const myId = this.get('db').myId();
    const sender = this.get('model.senderId');
    if (sender === myId){
      return 'You';
    }else{
      return this.get('model.senderName');
    }
  }),
  isLiked:computed('model', function(){
    const likes = this.get('model.Likes');
    const myId = this.get('db').myId();
    return (Object.keys(likes || {}).includes(myId));
  }),
  actions:{
    toggleLike(){
      const act = this.get('onLikeComment')
      if (this.get('isLiked')){
        act(this.get('model'), false);
      }else{
        act(this.get('model'), true);
      }
    }
  }
});
