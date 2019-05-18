import Component from '@ember/component';
import {computed} from '@ember/object';
import PicturedObject from "../custom-objects/pictured-object";
import {inject as service} from '@ember/service';
import {htmlSafe} from '@ember/template';
import emojione from 'emojione';
export default Component.extend({
  classNameBindings: ['unread','online', 'playing'],
  db: service(),
  firebaseApp: service(),
  init() {
    this._super(...arguments);
    this.addObserver('model', this, 'modelObserver');
    if (this.get('model')) {
      this.modelObserver(this);
    }
  },
  unread: computed('model.hasNewMessages', function () {
    return this.get('model.hasNewMessages');
  }),
  online: computed('model.isOnline', function () {
    return this.get('model.isOnline');
  }),
  playing: computed('model.videoType', function () {
    let type = this.get('model.videoType');
    return type ? 'playing':'';
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
    return htmlSafe(emojione.shortnameToUnicode(this.get('model.lastMessage')||'').replace(/(<([^>]+)>)/ig,""));
  })
});
