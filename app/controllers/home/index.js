import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object'
import {get} from '@ember/object';
import FeedModelWrapper from '../../custom-objects/feed-model-wrapper';
import FeedGroupSource from '../../custom-objects/feed-group-source';
export default Controller.extend({
  db: service(),
  firebaseApp: service(),
  auth: service(),
  init() {
    this._super(...arguments);
  },
  reset(){

  },
  myFeeds: computed('model.@each.lastUpdate', function(){
    const myID = this.db.myId();
    return this.get('model').map((elem)=>{
      return FeedModelWrapper.create({content:elem.get('obj')});
    }).filter((elem) => {
      return elem.get('creatorId') === myID;
    });
  }),
  followedFeeds: computed('model.@each.lastUpdate', function(){
    const myID = this.db.myId();
    return this.get('model').map((elem)=>{
      return FeedModelWrapper.create({content:elem.get('obj')});
    }).filter((elem) => {
      return elem.get('creatorId') !== myID && elem.isFollowing(myID);
    });
  }),
  publicFeeds: computed('model.@each.lastUpdate', function(){
    const myID = this.db.myId();
    return this.get('model').map((elem)=>{
      return FeedModelWrapper.create({content:elem.get('obj')});
    }).filter((elem) => {
      return elem.get('creatorId') !== myID;
    });
  }),
  filteredModel: computed('model.@each.lastUpdate', 'roomQuery', function () {
    let q = this.get('roomQuery');
    return this.get('model').filter((elem) => {
      if (!q || q.length === 0)
        return true;
      let title = get(elem, 'videoName');
      if (title) {
        return title.toLowerCase().includes(q.toLowerCase());
      } else {
        return false;
      }
    }).sort((a, b) => {
      return b.viewersCount - a.viewersCount;
    })
  }),
  actions:{
    followGroup(group){
      if (group.get('isPublic')){
        return this.get('db').followFeedGroup(get(group,'id'));
      }else{
        return this.get('db').requestFollowFeedGroup(get(group,'id'));
      }
    },
    unFollowGroup(group){
      this.get('db').unFollowFeedGroup(get(group,'id'));
    },
    onJoinEvent(group, event){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });

      ds.joinEvent(get(group,'id'),get(event,'id'));
    },
    onLeaveEvent(group, event){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });
      ds.leaveEvent(get(group,'id'),get(event,'id'));
    },
  }
});
