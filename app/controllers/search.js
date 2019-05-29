import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import $ from 'jquery';
import { get } from '@ember/object';
import UserFeedPager from '../custom-objects/user-feed-pager';
import { addObserver } from '@ember/object/observers';
import { removeObserver } from '@ember/object/observers';
import FeedGroupSource from '../custom-objects/feed-group-source';
import {debug}from '@ember/debug';
export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);
    this.addObserver('model', this, 'modelObserver');
    this.search = {};
    this.sentRequests = [];

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

  },
  activate(){
    if (this.get('db').get('feedUpdated')){
      this.get('groupPublicSide').load(true);
    }
    addObserver(this.get('db'),'feedUpdated', this,'feedUpdated');
  },
  reset(){
    removeObserver(this.get('db'),'feedUpdated', this,'feedUpdated');
  },
  feedUpdated(obj){
    debug('feedUpdated');
    obj.set('lastUpdate',new Date().getTime());
    this.get('groupPublicSide').set('synced',true);
    this.get('groupPublicSide').load(false);
  },
  publicFeeds(){
    const myID = this.db.myId();
    const q = this.get('model.query');
    return this.store.peekAll('feed-item').filter((elem) => {

      const title = get(elem,'GroupName');
      if (!q || q.length===0)
        return true;
      else{
        return title.toLowerCase().includes(q.toLowerCase())
      }
    });
  },
  modelObserver(arg) {
    $('.trigger-search').addClass('active');
    let q = arg.get('model.query');
    this.set('loadingUsers',true);
    arg.set('search.users', []);
    arg.store.query('user', {
      orderBy: 'Email',
      startAt: q,
      limitToFirst: 10
    }).then((res) => {
      arg.set('search.users', res);
      this.set('loadingUsers',false);
      $('.trigger-search').removeClass('active');
    });
    this.set('loadingRooms',true);

    this.get('groupPublicSide').load(true);
        
    this.db.profile(this.get('profile.id')).then((profile)=>{
      let friends = get(profile,'Friends');
      this.get('sentRequests').addObjects(Object.keys(friends).map((friend) => {
        let payload = friends[friend];
        payload['id'] = friend;
        return payload;
      }));
      this.notifyPropertyChange('sentRequests');
    });


  },
  actions: {
    followUser(user) {
      this.get('db').followUser(user);
      this.get('sentRequests').addObject(user);
      this.notifyPropertyChange('sentRequests');
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
      this.transitionToRoute('home.chat', get(group,'id'),'feed');
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
