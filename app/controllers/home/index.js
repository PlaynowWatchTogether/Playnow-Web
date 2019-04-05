import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object'
import {get} from '@ember/object';

export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);
  },
  filteredModel: computed('model.@each.lastUpdate', 'roomQuery', function () {
    let q = this.get('roomQuery');
    return this.get('model').filter((elem) => {
      if (!q || q.length === 0)
        return true;
      let title = get(elem, 'videoName');
      if (title) {
        return title.toLowerCase().includes(q.toLowerCase());
      } else {
        return false;
      }
    }).sort((a, b) => {
      return b.viewersCount - a.viewersCount;
    })
  })
});
