import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object'
import {get} from '@ember/object';
import { debug } from '@ember/debug';
import { sort } from '@ember/object/computed';
import FeedModelWrapper from '../../custom-objects/feed-model-wrapper';
import FeedGroupSource from '../../custom-objects/feed-group-source';
import UserFeedPager from '../../custom-objects/user-feed-pager';
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
    this.set('groupPublicSide',UserFeedPager.create({
      content: [],
      limit: 10,
      loadHandler: ()=>{
        return new Promise((resolve)=>{
          setTimeout(()=>{
            resolve(this.publicFeeds());
          },100);

        });
      }
    }));
    this.set('groupDiscover',UserFeedPager.create({
      content: [],
      limit: 10,
      loadHandler: ()=>{
        return new Promise((resolve)=>{
          setTimeout(()=>{
            resolve(this.discoverFeeds());
          },100);

        });
      }
    }));
    this.set('groupOwner',UserFeedPager.create({
      content: [],
      limit: -1,
      loadHandler: ()=>{
        return new Promise((resolve)=>{
          setTimeout(()=>{
            resolve(this.myFeeds());
          },100);

        });
      }
    }));
    this.set('groupFollowing',UserFeedPager.create({
      content: [],
      limit: -1,
      loadHandler: ()=>{
        return new Promise((resolve)=>{
          setTimeout(()=>{
            resolve(this.followedFeeds());
          },100);

        });
      }
    }));
    this.set('userFeed', UserFeedPager.create({
      content: [],
      loadHandler: ()=>{
        return new Promise((resolve)=>{
          setTimeout(()=>{
            resolve(this.get('sortedUserFeed'));
          },100);
        });
      },
      loadCompleted: (empty)=>{
        this.get('db').set('emptyUserFeed',empty);
      }
    }));

  },
  activate(){
    // this.get('userFeed').load(true);
    // this.get('groupOwner').load(true);
    // this.get('groupFollowing').load(true);
    // this.get('groupPublicSide').load(true);
    // this.get('groupPublic').load(true);

    addObserver(this.get('db'),'feedUpdated', this,'feedUpdated');
    addObserver(this.get('db'),'userFeedUpdated', this,'userFeedUpdated');
    addObserver(this.get('db'),'emptyUserFeed', this,'userFeedEmptyUpdated');
    this.get('userFeed').reload();
    this.get('groupOwner').reload();
    this.get('groupFollowing').reload();
    this.get('groupPublicSide').reload();
    this.get('groupDiscover').reload();
  },
  userFeedEmptyUpdated(obj){
    debug('user feed empty updated');
    if (this.get('db').get('emptyUserFeed')){
      $('#content-tabs .tab-discover a').tab('show');
    }
  },
  userFeedUpdated(obj){
    debug('userFeedUpdated');
    this.set('emptyUserFeed',this.get('db').get('emptyUserFeed'));
    this.get('userFeed').load(false);
  },
  feedUpdated(obj){
    debug('feedUpdated');
    obj.set('lastUpdate',new Date().getTime());
    this.get('groupPublicSide').load(false);
    this.get('groupOwner').load(false);
    this.get('groupFollowing').load(false);
    this.get('groupDiscover').load(false);
  },
  reset(){
    removeObserver(this.get('db'),'feedUpdated', this,'feedUpdated');
    removeObserver(this.get('db'),'userFeedUpdated', this,'userFeedUpdated')
    removeObserver(this.get('db'),'emptyUserFeed', this,'userFeedEmptyUpdated')
    this.get('userFeed').beforeReload();
    this.get('groupOwner').beforeReload();
    this.get('groupFollowing').beforeReload();
    this.get('groupPublicSide').beforeReload();
    this.get('groupDiscover').beforeReload();
  },
  userFeedSort: ['createdAt:desc'],
  userFeedLocal: computed(function(){
    return this.store.peekAll('user-feed-item');
  }),
  sortedUserFeed: sort('userFeedLocal','userFeedSort'),
  myFeeds(){
    const myID = this.db.myId();
    return this.store.peekAll('feed-item').filter((elem) => {
      return elem.get('creatorId') === myID;
    });
  },
  followedFeeds(){
    const myID = this.db.myId();
    return this.store.peekAll('feed-item').filter((elem) => {
      return elem.get('creatorId') !== myID && elem.isFollowing(myID);
    });
  },
  publicFeeds(){
    const myID = this.db.myId();
    return this.store.peekAll('feed-item').filter((elem) => {
      return elem.get('creatorId') !== myID;
    });
  },
  discoverFeeds(){
    const location = this.get('db.userLocation');
    const myID = this.db.myId();
    return this.store.peekAll('feed-item').filter((elem) => {
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
  },
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
    loadMoreSide(){
      this.get('groupPublicSide').loadMore();
      debug('loadMoreSide');

    },
    loadMoreDiscover(){
      this.get('groupPublic').loadMore();
      debug('loadMoreDiscover');
    },
    loadMoreUserFeed(){
      this.get('userFeed').loadMore();
      debug('loadMoreUserFeed');
    },
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
    openDetails(group,live){
      if (live){
        this.transitionToRoute('home.chat', get(group,'id'),'feed');
      }else{
        this.transitionToRoute('home.group.show', get(group,'id'));
      }

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
