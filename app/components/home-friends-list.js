import Component from '@ember/component';
import {computed} from '@ember/object'
import {debug} from '@ember/debug';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.limit = 30;
    this.addObserver('friendsQuery', this, 'onQueryChanged')
  },
  onQueryChanged(obj) {
    obj.set('limit', 30);
  },
  queriedModel: computed('model.@each.latestMessageDate', 'friendsQuery', 'limit', function () {
    if (!this.get('friendsQuery') || this.get('friendsQuery').length === 0) {
      return this.get('model').sort((a, b) => {
        debug('compare ' + b.get('filterTitle') + ':' + b.get('latestMessageDate') + ' and ' + a.get('filterTitle') + ':' + a.get('latestMessageDate'));
        return b.get('latestMessageDate') - a.get('latestMessageDate')
      }).filter(() => {
        return true;
      }).slice(0, this.get('limit'))
    }
    let query = this.get('friendsQuery');
    return this.get('model').filter((elem) => {
      let title = elem.get('filterTitle');
      if (title) {
        return title.toLowerCase().includes(query.toLowerCase());
      } else {
        return false
      }
    }).slice(0, this.get('limit'));
  }),
  totalFriends: computed('queriedModel.@each.id', function () {
    return this.get('queriedModel').length;
  }),
  hasMoreFriends: computed('queriedModel.@each.id', 'limit', function () {
    return this.get('queriedModel').length >= this.limit;
  }),
  actions: {
    loadMore() {
      this.set('limit', this.get('limit') + 10);
    },
    openCompose(){
      this.get('onOpenCompose')();
    }
  }
});
