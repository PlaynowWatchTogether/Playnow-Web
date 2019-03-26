import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {sort} from '@ember/object/computed';
import {computed} from '@ember/object';
import FriendListItemObj from '../custom-objects/friend-list-item-obj'
export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);
  },
  actions: {
    triggerSearch() {
      this.transitionToRoute('search', {query: this.get('searchQuery')});
    }
  },
  contactList: computed('friends.@each.latestMessageDate', 'groups.@each.latestMessageDate', function () {
    let f = (this.get('friends') || []).map((elem) => {
      return FriendListItemObj.create({type: 'friend', model: elem})
    });
    let g = (this.get('groups') || []).map((elem) => {
      return FriendListItemObj.create({type: 'group', model: elem})
    });
    return f.concat(g)
  }),
  sortedFriends: sort('contactList.@each.latestMessageDate', function (a, b) {
    if (a.get('latestMessageDate') > b.get('latestMessageDate')) {
      return -1;
    } else if (a.get('latestMessageDate') < b.get('latestMessageDate')) {
      return 1;
    }

    return 0;
  })
});
