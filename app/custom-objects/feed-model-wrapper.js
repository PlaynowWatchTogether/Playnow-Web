import ObjectProxy from '@ember/object/proxy';
import {computed} from '@ember/object';
import moment from 'moment';
import { get } from '@ember/object';

export default ObjectProxy.extend({
  isFollowing(id){
    return Object.keys(this.get('content.Followers')||{}).includes(id);
  },
  isAdmin(id){
    return this.get('content.creatorId') === id || Object.keys(this.get('content.Admins')||{}).includes(id);
  },
  isRequestedFollow(id){
    return Object.keys(this.get('content.FollowRequests')||{}).includes(id);
  },
  followersCount: computed('content', function(){
    const watching = this.get('content.Followers')||{};
    return Object.keys(watching).length;
  }),
  recentEvent: computed('content', function(){
    const events = this.get('content.Events')||{};

    const sorted = Object.values(events).sort((a,b)=>{
      return (b.serverDate || 0) - (a.serverDate || 0);
    });
    return sorted.length > 0 ? sorted[0] : null;
  }),
  lastMessage: computed('content', function(){
    const messages = this.get('content.Messages')||{};
    const sorted = Object.values(messages).sort((a,b)=>{
      return b.serverDate - a.serverDate;
    });
    return sorted.length > 0 ? sorted[0] : null;
  }),
  isPlaying: computed('content', function(){
    const watching = this.get('content.videoWatching')||{};
    let hasPlaying = false;
    Object.values(watching).forEach((watcher)=>{
      hasPlaying|=watcher.state !== 'closed';
    });
    return hasPlaying;
  }),
  isPlaying: computed('content', function(){
    const watching = this.get('content.videoWatching')||{};
    let hasPlaying = false;
    Object.values(watching).forEach((watcher)=>{
      hasPlaying|=watcher.state !== 'closed';
    });
    return hasPlaying;
  }),
  playingVideoTitle: computed('content', function(){
    return this.get('content.videoState.videoName');
  }),
  playingVideoThumbnail: computed('content', function(){
    return this.get('content.videoState.videoThumbnail');
  }),
  groupViewers: computed('content', function(){
    const watching = this.get('content.videoWatching')||{};
    return Object.values(watching);
  }),
  videoWatchers: computed('content', function(){
    const watching = this.get('content.videoWatching')||{};
    const hasPlaying = [];
    Object.values(watching).forEach((watcher)=>{
      if (watcher.state !== 'closed'){
        hasPlaying.push(watcher);
      }
    });
    return hasPlaying;
  }),
  playingViews: computed('content', function(){
    const watching = this.get('content.videoWatching')||{};
    let hasPlaying = 0;
    Object.values(watching).forEach((watcher)=>{
      if (watcher.state !== 'closed'){
        hasPlaying+=1;
      }
    });
    return hasPlaying;
  }),
  isPublic: computed('content', function(){
    return this.get('content.GroupAccess') === 1;
  }),
});
