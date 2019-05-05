import Route from '@ember/routing/route';
import AuthRouteMixin from '../../mixins/auth-route-mixin'
import {inject as service} from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import $ from 'jquery';

export default Route.extend(AuthRouteMixin, {
  db: service(),
  init() {
    this._super(...arguments);
    this.arProxy = ArrayProxy.create({content: []});
  },
  model() {
    return this.store.peekAll('feed-item');
  },
  activate() {

    // let ctrl = this.controllerFor('home/index');
    // ctrl.set('model', arProxy);
    this.get('db').feeds((feeds)=>{
      const ids = feeds.map((elem) => {
        return elem['id'];
      });
      const localRooms = this.store.peekAll('feed-item');
      localRooms.forEach((feed) => {
        if (!ids.includes(feed.get('id'))) {
          feed.unloadRecord();
        }
      });
      feeds.forEach((feed) => {
        feed['rawData'] = JSON.stringify(feed);
        feed['lastUpdate'] = new Date().getUTCMilliseconds();
        feed['Followers'] = JSON.stringify(feed.Followers || {});
        feed['FollowRequests'] = JSON.stringify(feed.FollowRequests || {});
        feed['Playlist'] = JSON.stringify(feed.Playlist || {});
        feed['Admins'] = JSON.stringify(feed.Admins || {});
        let normalizedData = this.store.normalize('feed-item', feed);
        this.store.push(normalizedData);
      });
    })
    this._super(...arguments);
    $('body').addClass('index');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('index');
    this.get('db').feedsOff();
  }
});
