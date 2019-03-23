import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  classNameBindings: ['unread'],
  db: service(),
  firebaseApp: service(),
  init() {
    this._super(...arguments);
    this.addObserver('model', this, 'modelObserver');
    if (this.get('model')) {
      this.modelObserver(this);
    }
  },
  playingClass: computed('model.videoIsPlaying', function () {
    return this.get('model.videoIsPlaying') ? 'playing' : '';
  }),
  onlineClass: computed('model.isOnline', function () {
    return this.get('model.isOnline') ? 'online' : '';
  }),
  unread: computed('model.hasNewMessages', function () {
    return this.get('model.hasNewMessages');
  }),
  unreadClass: computed('model', function () {
    return this.get('model.hasNewMessages') ? 'unread' : '';
  }),
  modelObserver() {

  },
  safeProfilePic: computed('model.profilePic', function () {
    let m = this.get('model');
    if (!m['profilePic'] || m['profilePic'].length === 0) {
      return '/assets/monalisa.png'
    } else {
      return m['profilePic']
    }
  }),
  lastMessageText: computed('model.lastMessage', function () {
    return this.get('model.lastMessage');
  }),
  didInsertElement() {
    this._super(...arguments);

    // this.get('db')

  },
  willDestroyElement() {
    let ds = this.get('dataSource');
    if (ds) {
      ds.stop();
    }
    this._super(...arguments);
  }
});
