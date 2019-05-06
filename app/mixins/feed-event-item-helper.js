import Mixin from '@ember/object/mixin';
import {computed} from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';

export default Mixin.create({
  db: service(),
  isCreator: computed('model', function(){
    return this.get('model.obj.creatorId') === this.db.myId();
  }),
  isMember: computed('model.obj', function(){
    return Object.keys(this.get('model.obj.Members')||{}).includes(this.db.myId());
  }),
  actions: {
    joinEvent(){
      this.get('joinEvent')(this.get('model.obj'));
    },
    unJoinEvent(){
      this.get('leaveEvent')(this.get('model.obj'));
    }
  }
});
