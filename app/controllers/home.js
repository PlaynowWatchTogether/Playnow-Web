import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {sort} from '@ember/object/computed';

export default Controller.extend({
  db: service(),
  actions: {
    chatFriend(friend) {
      this.transitionToRoute('home.chat', {chat_id: friend.id, type: 'one2one'});
    },
    triggerSearch() {
      this.transitionToRoute('search', {query: this.get('searchQuery')});
    }
  },
  sortedFriends: sort('friends', function (a, b) {
    if (a['latestMessageDate'] > b['latestMessageDate']) {
      return -1;
    } else if (a['latestMessageDate'] < b['latestMessageDate']) {
      return 1;
    }

    return 0;
  })
});
