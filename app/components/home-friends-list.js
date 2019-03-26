import Component from '@ember/component';
import {computed} from '@ember/object'

export default Component.extend({
  init() {
    this._super(...arguments);
    this.limit = 10;
  },
  queriedModel: computed('model', 'friendsQuery', 'limit', function () {
    if (!this.get('friendsQuery') || this.get('friendsQuery').length === 0) {
      return this.get('model').filter(() => {
        return true;
      }).slice(0, this.get('limit'))
    }
    let query = this.get('friendsQuery');
    return this.get('model').filter((elem) => {
      let title = '';
      if (elem.get('type') === 'friend') {
        title = elem.get('model.firstName') + ' ' + this.get('model.lastName');
      } else {
        title = elem.get('model.GroupName');
      }
      if (title) {
        return title.toLowerCase().includes(query.toLowerCase());
      } else {
        return false
      }
    }).slice(0, this.get('limit'));
  }),
  totalFriends: computed('model', function () {
    return this.get('model').length;
  }),
  hasMoreFriends: computed('model', 'limit', function () {
    return this.get('model').length >= this.limit;
  }),
  actions: {
    loadMore() {
      this.set('limit', this.get('limit') + 10);
    }
  }
});
