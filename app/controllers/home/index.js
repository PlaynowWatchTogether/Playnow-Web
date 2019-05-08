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
  // filteredModel: computed('model.@each.lastUpdate', 'roomQuery', function () {
  //   let q = this.get('roomQuery');
  //   return this.get('model').filter((elem) => {
  //     if (!q || q.length === 0)
  //       return true;
  //     let title = get(elem, 'videoName');
  //     if (title) {
  //       return title.toLowerCase().includes(q.toLowerCase());
  //     } else {
  //       return false;
  //     }
  //   }).sort((a, b) => {
  //     return b.viewersCount - a.viewersCount;
  //   })
  // }),
  discoverFeeds: computed('model.@each.lastUpdate','userLocation', function(){
    const location = this.get('userLocation');
    const myID = this.db.myId();
    return this.get('model').map((elem)=>{
      return FeedModelWrapper.create({content:elem.get('obj')});
    }).filter((elem) => {
      return elem.get('creatorId') !== myID;
    }).sort((a,b)=>{
      if (location){
        let aD = Number.MAX_SAFE_INTEGER;
        let bD = Number.MAX_SAFE_INTEGER;
        const locA = get(a,'GroupLocation.l');
        const locB = get(b,'GroupLocation.l');
        if (typeof(locA) === 'object'){
          aD = this.distance(locA[1],locA[0],location.lng,location.lat);
        }
        if (typeof(locB) === 'object'){
          bD = this.distance(locB[1],locB[0],location.lng,location.lat);
        }
        return aD - bD;
      }else{
        return get(a,'lastServerUpdate') - get(b,'lastServerUpdate');
      }
    });
  }),
  toRad(val) {
    return val * Math.PI / 180;
  },
  distance(lon1, lat1, lon2, lat2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.toRad(lat2-lat1);  // Javascript functions in radians
    var dLon = this.toRad(lon2-lon1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  },
  actions:{
    discoverFeedClicked(){

    },
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
