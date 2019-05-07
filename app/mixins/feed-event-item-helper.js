import Mixin from '@ember/object/mixin';
import {computed} from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';
import { get } from '@ember/object';
export default Mixin.create({
  db: service(),
  isCreator: computed('model', function(){
    return this.get('model.creatorId') === this.db.myId();
  }),
  isMember: computed('model', function(){
    let found = false;
    (this.get('model.Members')||[]).forEach((member)=>{
      if (this.db.myId() === get(member,'id')){
        found = true;
      }
    })
    return found;
  }),
  actions: {
    joinEvent(){
      this.get('joinEvent')(this.get('model'));
    },
    unJoinEvent(){
      this.get('leaveEvent')(this.get('model'));
    }
  }
});
