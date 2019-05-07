import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
export default Component.extend({
  db: service(),
  isFollowing: computed('model', function(){
    return this.get('model').isFollowing(this.db.myId());
  }),
  isRequestedFollow: computed('model.FollowRequestsObject', function(){
    return this.get('model').isRequestedFollow(this.db.myId());
  }),
  actions:{
    followGroup(){
      this.get('onFollowGroup')(this.get('model'));
    },
    unFollowGroup(){
      this.get('onUnFollowGroup')(this.get('model'));
    }
  }
});
