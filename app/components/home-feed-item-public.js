import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import moment from 'moment';
import FeedEventModelWrapper from '../custom-objects/feed-event-model-wrapper';
export default Component.extend({
  db: service(),
  isFollowing: computed('model', function(){
    return this.get('model').isFollowing(this.db.myId());
  }),
  isRequestedFollow: computed('model.FollowRequests', function(){
    return this.get('model').isRequestedFollow(this.db.myId());
  }),
  viewsNumber: computed('model', function(){
    return this.get('model.followersCount');
  }),
  recentAction: computed('model', function(){
    const playing = this.get('model.isPlaying');
    if (playing){
      return {isOnline: true, video: this.get('model.videoState')};
    }
    const mes = this.get('model.lastMessage');
    const event = this.get('model.recentEvent');
    if (mes && !event)
      return {isPost: true, post: mes};
    if (!mes && event){
      return {isEvent:true, event:event};
    }
    if (mes.serverDate > event.serverDate){
      return {isPost: true, post: mes};
    }
    return {isEvent:true, event: FeedEventModelWrapper.create({content:event})};
  }),
  canShowRecent: computed('model', function(){
    const isPublic = this.get("model.isPublic");
    if (isPublic)
      return true;
    const myID = this.get('db').myId();
    return this.get('model').isMember(myID);
  }),
  hasRecentAction: computed('model', function(){
    const playing = this.get('model.isPlaying');
    if (playing){
      return true;
    }
    const mes = this.get('model.lastMessage');
    if (mes)
      return true;
    const event = this.get('model.recentEvent');
    if (event){
      return true;
    }
    return false;

  }),
  actions:{
    followGroup(){
      this.get('onFollowGroup')(this.get('model'));
    },
    unFollowGroup(){
      this.get('onUnFollowGroup')(this.get('model'));
    },
    onJoinEvent(){
      this.get('onJoinEvent')(this.get('model'), this.get('recentAction.event'));
    },
    onLeaveEvent(){
      this.get('onLeaveEvent')(this.get('model'), this.get('recentAction.event'));
    }
  }
});
