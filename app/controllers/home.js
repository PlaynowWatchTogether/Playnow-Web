import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {sort} from '@ember/object/computed';
import {computed} from '@ember/object';
import FriendListItemObj from '../custom-objects/friend-list-item-obj'
import $ from "jquery";
export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);
  },
  actions: {
    triggerSearch() {
      $('.trigger-search').addClass('active');
      this.transitionToRoute('search', {query: this.get('searchQuery')});
    },
    onOpenCompose(){
      this.transitionToRoute("home.chat","compose","group");
    }
  },
  storeFriends: computed(function(){
    return this.store.peekAll('home-friend');
  }),
  sortedFriends: sort('storeFriends.@each.{latestMessageDate,FirstName,LastName,profilePic,isOnline,videoIsPlaying}', function (a, b) {
    if (a.get('latestMessageDate') > b.get('latestMessageDate')) {
      return -1;
    } else if (a.get('latestMessageDate') < b.get('latestMessageDate')) {
      return 1;
    }

    return 0;
  })
});
