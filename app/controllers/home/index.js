import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object'
import {get} from '@ember/object';
import { debug } from '@ember/debug';
import { sort } from '@ember/object/computed';
import FeedModelWrapper from '../../custom-objects/feed-model-wrapper';
import FeedGroupSource from '../../custom-objects/feed-group-source';
import { addObserver } from '@ember/object/observers';
import { removeObserver } from '@ember/object/observers';
import DS from 'ember-data';
import {Promise} from 'rsvp';
export default Controller.extend({
  db: service(),
  firebaseApp: service(),
  auth: service(),
  init() {
    this._super(...arguments);
    this.set('isLoadingUserFeed',true);

  },
  activate(){
    this.set('isLoadingUserFeed',true);
    addObserver(this.get('db'),'feedUpdated', this,'feedUpdated');
    this.loadUserFeed();
  },
  loadUserFeed(){
    new Promise((resolve)=>{
      setTimeout(()=>{
        resolve(this.get('sortedUserFeed'));
      },1000);

    }).then((data)=>{
      this.set('isLoadingUserFeed',false);
      this.set('userFeed', data.slice(0,10));
    })
  },
  feedUpdated(obj){
    debug('feedUpdated');
    obj.set('lastUpdate',new Date().getTime());
    this.loadUserFeed();
  },
  reset(){
    removeObserver(this.get('db'),'feedUpdated', this,'feedUpdated');
    this.set('userFeed',null);
  },
  userFeedSort: ['createdAt:desc'],
  userFeedLocal: computed(function(){
    return this.store.peekAll('user-feed-item');
  }),
  sortedUserFeed: sort('userFeedLocal','userFeedSort'),
  myFeeds: computed('model.groups', function(){
    return DS.PromiseArray.create({
      promise: new Promise((resolve)=>{
        const myID = this.db.myId();

        resolve(this.get('model.groups').filter((elem) => {
          return elem.get('creatorId') === myID;
        }));

      })
    });

  }),
  followedFeeds: computed('model.groups', function(){
    return DS.PromiseArray.create({
      promise: new Promise((resolve)=>{
        const myID = this.db.myId();
        resolve(this.get('model.groups').filter((elem) => {
          return elem.get('creatorId') !== myID && elem.isFollowing(myID);
        }));
      })
    });
  }),
  publicFeeds: computed('model.groups', function(){
    return DS.PromiseArray.create({
      promise: new Promise((resolve)=>{
        const myID = this.db.myId();
        resolve(this.get('model.groups').filter((elem) => {
          return elem.get('creatorId') !== myID;
        }));
      })
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
  discoverFeeds: computed('model.groups.@each.lastUpdate','db.userLocation', function(){
    return DS.PromiseArray.create({
      promise: new Promise((resolve)=>{
        const location = this.get('db.userLocation');
        const myID = this.db.myId();
        resolve(this.get('model.groups').filter((elem) => {
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
        }));
      })
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
    openDetails(group){
      this.transitionToRoute('home.group.show', get(group,'id'));
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
