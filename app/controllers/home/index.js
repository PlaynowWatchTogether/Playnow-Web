import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object'
import {get} from '@ember/object';
import FeedModelWrapper from '../../custom-objects/feed-model-wrapper';
export default Controller.extend({
  db: service(),
  firebaseApp: service(),
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
        this.get('db').followFeedGroup(group.id);
      }else{
        this.get('db').requestFollowFeedGroup(group.id);
      }
    },
    unFollowGroup(group){
      this.get('db').unFollowFeedGroup(group.id);
    }
  }
});
