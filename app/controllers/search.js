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
    arg.store.query('user', {orderBy: 'Email', startAt: arg.get('model.query'), limitToFirst: 10}).then((res) => {
      arg.set('search.users', res);
      $('.trigger-search').removeClass('active');
    });
    arg.db.roomsOnce().then((res) => {
      arg.set('search.rooms', res.filter((elem) => {
        return (elem['videoName'] || '').toLowerCase().includes(arg.get('model.query').toLowerCase())
      }));
    })
  },
  actions: {
    followUser(user) {
      this.get('db').followUser(user);
      this.get('sentRequests').addObject(user);
      this.notifyPropertyChange('sentRequests');
    }
  }
});
