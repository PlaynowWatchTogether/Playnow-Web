import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import $ from 'jquery';

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
    let q = arg.get('model.query')
    arg.store.query('user', {
      orderBy: 'Email',
      startAt: q.toUpperCase(),
      endAt: q.toLowerCase(),
      limitToFirst: 10
    }).then((res) => {
      arg.set('search.users', res);
      $('.trigger-search').removeClass('active');
    });
    arg.db.roomsOnce().then((res) => {
      arg.set('search.rooms', res.filter((elem) => {
        return (elem['videoName'] || '').toLowerCase().includes(arg.get('model.query').toLowerCase())
      }));
    });
    let friends = this.get('profile.Friends');
    this.get('sentRequests').addObjects(Object.keys(friends).map((friend) => {
      let payload = friends[friend];
      payload['id'] = friend;
      return payload;
    }));
    this.notifyPropertyChange('sentRequests');
  },
  actions: {
    followUser(user) {
      this.get('db').followUser(user);
      this.get('sentRequests').addObject(user);
      this.notifyPropertyChange('sentRequests');
    }
  }
});
