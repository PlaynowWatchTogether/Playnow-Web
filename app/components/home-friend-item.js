import Component from '@ember/component';
import EmberObject, {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import MessageDataSource from '../custom-objects/message-data-source'
export default Component.extend({
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
  unreadClass: computed('model', function () {
    return this.get('model.hasNewMessages') ? 'unread' : '';
  }),
  modelObserver(obj) {
    let ds = this.get('dataSource');
    if (ds) {
      ds.stop();
    }
    let newDs = MessageDataSource.create({
      type: 'one2one',
      user: obj.get('model'),
      myId: this.firebaseApp.auth().currentUser.uid,
      db: this.firebaseApp.database()
    });
    this.set('dataSource', newDs);
    newDs.messages((messages) => {
      let sorted = messages.sort(function (a, b) {
        return a['date'] - b['date'];
      });
      sorted.forEach((elem) => {
        if (elem['text'] && elem['text'].length > 0) {
          obj.set('lastMessage', elem);
          return;
        }
      });

    })
  },
  safeProfilePic: computed('model.profilePic', function () {
    let m = this.get('model');
    if (!m['profilePic'] || m['profilePic'].length === 0) {
      return '/assets/monalisa.png'
    } else {
      return m['profilePic']
    }
  }),
  lastMessageText: computed('lastMessage', function () {
    return this.get('lastMessage.text');
  }),
  didInsertElement() {
    this._super(...arguments);

    // this.get('db')

  },
  willDestroyElement() {
    this._super(...arguments);
  }
});
