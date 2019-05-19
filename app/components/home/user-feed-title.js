import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import FeedActionsMixins from '../../mixins/feed/feed-actions';
export default Component.extend(FeedActionsMixins, {
  store: service(),
  db: service(),
  click(){
    this.get('clickAction')();
  },
  isOwner: computed('model', function(){
    if (this.get('model')){
      return this.get('model').isOwner(this.db.myId());
    }
    return false;
  }),
  isFollowing: computed('model.Followers', function(){
    if (this.get('model')){
      return this.get('model').isFollowing(this.db.myId());
    }
    return false;
  }),
  isRequestedFollow: computed('model.FollowRequests', function(){
    if (this.get('model')){
      return this.get('model').isRequestedFollow(this.db.myId());
    }
    return false;
  }),
});
