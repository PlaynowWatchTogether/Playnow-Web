import ObjectProxy from '@ember/object/proxy';
import {computed} from '@ember/object';

export default ObjectProxy.extend({
  isFollowing(id){
    return Object.keys(this.get('content.Followers')||{}).includes(id);
  },
  isRequestedFollow(id){
    return Object.keys(this.get('content.FollowRequests')||{}).includes(id);
  },
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
