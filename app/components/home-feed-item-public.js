import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
export default Component.extend({
  db: service(),
  isFollowing: computed('model.FollowersObject', function(){
    return Object.keys(this.get('model.FollowersObject')).includes(this.db.myId());
  }),
  isRequestedFollow: computed('model.FollowRequestsObject', function(){
    return Object.keys(this.get('model.FollowRequestsObject')).includes(this.db.myId());
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
