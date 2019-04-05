import Component from '@ember/component';
import {computed} from '@ember/object';
import PicturedObject from "../custom-objects/pictured-object";
import {inject as service} from '@ember/service';
export default Component.extend({
  db: service(),
  store: service(),
  init() {
    this._super(...arguments);

    this.addObserver('model.lastUpdate', this, 'modelObserver');

    this.loadWatchers();
  },
  loadWatchers() {
    let watchers = this.get('model.videoWatching');
    if (watchers) {
      Promise.all(Object.keys(watchers).filter((elem) => {
        return watchers[elem]['state'] === 'playing'
      }).map((elem) => {
        if (elem === 'playnow') {
          return this.db.profile('IZ3cAldc41PsvRnppzngv85utJf2')
        } else {
          return this.db.profile(elem)
        }
      })).then((members) => {
        let store = this.get('store');
        let realMembers = [];
        members.forEach((member) => {
          let id = `${this.get('model.id')}_${member['id']}`;
          let roomId = this.get('model.id');
          let normalizedData = store.normalize('room-member', {
            id: id,
            memberId: member['id'],
            roomId: roomId,
            member: JSON.stringify(member)
          });
          store.push(normalizedData);
          realMembers.push(member['id']);
        });
        this.set('realMembers', realMembers);


        // this.set('members', members.map((elem, index) => {
        //   elem.className = 'z' + (members.length - index);
        //   return PicturedObject.create({content: elem})
        // }).slice(0,5));
      })
    }
  },
  modelObserver(obj) {
    obj.loadWatchers()
  },
  members: computed('model.lastUpdate', 'realMembers.@each', function () {
    let realMembers = this.get('realMembers') || [];
    return this.get('store').peekAll('room-member').filter((elem) => {
      return elem.get('roomId') === this.get('model.id') && realMembers.includes(elem.get('memberId'))
    }).slice(0, 5)
  }),
  // members: computed('model', function () {
  //   let members = this.get('model.Members');
  //   return Object.keys(members).map((key, index) => {
  //
  //   });
  // }),
  videoState: computed('model', function () {
    let watchers = this.get('model.videoWatching');
    let any = false;
    if (watchers) {
      Object.keys(watchers).forEach((elem) => {
        any |= watchers[elem]['state'] === 'playing';
      });
    }

    return any ? 'Now playing' : 'Not playing';
  })
});
