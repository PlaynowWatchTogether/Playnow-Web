import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import FeedActionsMixins from '../../mixins/feed/feed-actions';
export default Component.extend(FeedActionsMixins, {
  store: service(),
  db: service(),
  isOwner: computed('model', function(){
    return this.get('model').isOwner(this.db.myId());
  }),
  isFollowing: computed('model.Followers', function(){
    return this.get('model').isFollowing(this.db.myId());
  }),
  isRequestedFollow: computed('model.FollowRequests', function(){
    return this.get('model').isRequestedFollow(this.db.myId());
  }),
});
