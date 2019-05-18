import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {htmlSafe} from '@ember/template'
import emojione from 'emojione';
export default Component.extend({
  classNameBindings: ['unread', 'online', 'playing'],
  db: service(),
  firebaseApp: service(),
  init() {
    this._super(...arguments);
    this.addObserver('model', this, 'modelObserver');
    if (this.get('model')) {
      this.modelObserver(this);
    }
  },
  playing: computed('model.videoIsPlaying', function () {
    return this.get('model.videoIsPlaying');
  }),
  online: computed('model.isOnline', function () {
    return this.get('model.isOnline');
  }),
  unread: computed('model.hasNewMessages', function () {
    return this.get('model.hasNewMessages');
  }),
  modelObserver() {

  },
  lastMessageText: computed('model.lastMessage', function () {
    return htmlSafe(emojione.shortnameToUnicode(this.get('model.lastMessage')||'').replace(/(<([^>]+)>)/ig,""));
  }),
  willDestroyElement() {
    let ds = this.get('dataSource');
    if (ds) {
      ds.stop();
    }
    this._super(...arguments);
  }
});
