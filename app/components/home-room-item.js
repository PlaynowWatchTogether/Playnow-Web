import Component from '@ember/component';
import {computed} from '@ember/object';
import PicturedObject from "../custom-objects/pictured-object";
import {inject as service} from '@ember/service';
export default Component.extend({
  db: service(),
  init() {
    this._super(...arguments);
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
        this.set('members', members.map((elem, index) => {
          elem.className = 'z' + (members.length - index);
          return PicturedObject.create({content: elem})
        }));
      })
    }
  },

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
