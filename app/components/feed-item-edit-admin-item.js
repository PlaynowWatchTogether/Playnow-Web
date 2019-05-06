import Component from '@ember/component';
import {computed} from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';

export default Component.extend({
  db: service(),
  isOwner: computed('model', function(){
    const id = this.db.myId();
    return this.get('feed.creatorId') === this.get('model.id');
  }),
  actions: {
    removeAsAdmin(){
      this.get('removeAsAdmin')(this.get('model'));
    }
  }
});
