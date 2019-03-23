import Component from '@ember/component';
import {computed} from '@ember/object';
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
  modelObserver() {

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
