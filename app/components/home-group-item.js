import Component from '@ember/component';
import EmberObject, {computed} from '@ember/object';
import MessageDataSource from "../custom-objects/message-data-source";
import PicturedObject from "../custom-objects/pictured-object";
import {inject as service} from '@ember/service';

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
  playingClass: computed('model.videoType', function () {
    let type = this.get('model.videoType');
    if (type === 'youtubeVideo') {
      return 'playing-video'
    } else if (type === 'youtubeMusic') {
      return 'playing-music'
    } else {
      return ''
    }
  }),
  onlineClass: computed('model.isOnline', function () {
    return this.get('model.isOnline') ? 'online' : '';
  }),
  unreadClass: computed('model', function () {
    return this.get('model.hasNewMessages') ? 'unread' : '';
  }),
  members: computed('model.groupPics', function () {
    let profilePics = this.get('model.groupPics');
    if (profilePics) {
      let urls = profilePics.split(",");
      return urls.slice(0, 3).map((elem) => {
        return PicturedObject.create({content: {ProfilePic: elem}});
      });
    } else {
      return [];
    }
  }),
  modelObserver(obj) {


    // let ds = obj.get('dataSource');
    // if (ds) {
    //   ds.stop();
    // }
    // let newDs = MessageDataSource.create({
    //   type: 'group',
    //   group: obj.get('model'),
    //   myId: obj.firebaseApp.auth().currentUser.uid,
    //   db: obj.firebaseApp.database()
    // });
    // newDs.messages((messages) => {
    //   let sorted = messages.sort(function (a, b) {
    //     return a['date'] - b['date'];
    //   });
    //   sorted.forEach((elem) => {
    //     if (elem['text'] && elem['text'].length > 0) {
    //       obj.set('lastMessage', elem);
    //       return;
    //     }
    //   });
    // })
    // newDs.membersOnce().then((members) => {
    //   obj.set('members', members.slice(0, 3).map((elem) => {
    //     return PicturedObject.create({content: elem});
    //   }));
    // })
  },
  profilePicClass: computed('members', function () {
    let members = this.get('members');
    if (members) {
      return 'split-profile-pic' + members.length;
    } else {
      return '';
    }
  }),
  lastMessageText: computed('model.lastMessage', function () {
    return this.get('model.lastMessage');
  })
});
