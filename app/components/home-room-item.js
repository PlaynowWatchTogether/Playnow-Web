import Component from '@ember/component';
import {computed} from '@ember/object';
import PicturedObject from "../custom-objects/pictured-object";

export default Component.extend({
  members: computed('model', function () {
    let members = this.get('model.Members');
    return Object.keys(members).map((key, index) => {
      let elem = members[key];
      elem.id = key;
      elem.className = 'z' + (members.length - index);
      return PicturedObject.create({content: elem})
    });
  }),
  videoState: computed('model', function () {
    let watchers = this.get('model.videoWatching');
    let any = false;
    Object.keys(watchers).forEach((elem) => {
      any |= watchers[elem]['state'] === 'playing';
    });

    return any ? 'Now playing' : 'Not playing';
  })
});
