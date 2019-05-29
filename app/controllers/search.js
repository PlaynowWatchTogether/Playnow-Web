import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import $ from 'jquery';
import { get } from '@ember/object';
export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);
    this.addObserver('model', this, 'modelObserver');
    this.search = {};
    this.sentRequests = [];
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
    arg.set('search.rooms',[]);
    arg.db.roomsOnce().then((res) => {
      arg.set('search.rooms', res.filter((elem) => {
        return (elem['videoName'] || '').toLowerCase().includes(arg.get('model.query').toLowerCase())
      }));
      this.set('loadingRooms',false);
    });
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
    }
  }
});
