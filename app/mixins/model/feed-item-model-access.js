import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { get } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import ArrayProxy from '@ember/array/proxy';
import ArrayUniqObject from '../../custom-objects/array-uniq-object';
export default Mixin.create({
  init(){
    this._super(...arguments);
    this.set('AdminsArrayInternal', ArrayProxy.create({content:[]}));
    this.addObserver('content', this,'contentObserver');
    this.set('membersOnline',ArrayUniqObject.create({on: this, key:'content.videoWatching',uniqKey: 'userId'}));
    this.set('videoWatchers',ArrayUniqObject.create({
      on: this,
      key:'content.videoWatching',
      uniqKey: 'userId',
      filterElements: (watcher)=>{
        return get(watcher,'state') !== 'closed';
      }
    }));
  },
  contentObserver(obj){
    if (!obj.get('content')){
      obj.get('AdminsArrayInternal').setObjects([]);
      return;
    }
    const admins = ArrayProxy.create(
      {
        content:Object.values(this.get('content.Admins')||{})
      }
    )
    const localAdmins = obj.get('AdminsArrayInternal');
    admins.forEach((remote)=>{
      const local = localAdmins.findBy('id',get(remote,'id'));
      if (!local){
        localAdmins.addObject(ObjectProxy.create({content:remote}));
      }else{
        local.set('content',remote);
      }
    });
    localAdmins.forEach((local)=>{
      const remote = admins.findBy('id',get(local,'id'));
      if (!remote){
        localAdmins.removeObject(local);
      }
    })
    // obj.get('AdminsArrayInternal').setObjects();
  },
  isOwner(id){
    return this.get('content.creatorId') === id;
  },
  isFollowing(id){
    return Object.keys(this.get('content.Followers')||{}).includes(id);
  },
  isMember(id){
    return this.isAdmin(id) || Object.keys(this.get('content.Followers')||{}).includes(id);
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
  isPlaying: computed('content.videoWatching', function(){
    const watching = this.get('content.videoWatching')||{};
    let hasPlaying = false;
    Object.values(watching).forEach((watcher)=>{
      hasPlaying|=watcher.state !== 'closed';
    });
    return hasPlaying;
  }),
  playingVideoTitle: computed('content.videoState', function(){
    return this.get('content.videoState.videoName');
  }),
  playingVideoThumbnail: computed('content.videoState', function(){
    return this.get('content.videoState.videoThumbnail');
  }),
  groupViewers: computed('content.videoWatching', function(){
    const watching = this.get('content.videoWatching')||{};
    return Object.values(watching);
  }),
  playingViews: computed('content.videoWatching', function(){
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
  AdminsArray: computed('AdminsArrayInternal', function(){
    return this.get('AdminsArrayInternal');
  })
});
