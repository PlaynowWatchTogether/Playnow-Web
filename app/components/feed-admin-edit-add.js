import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  userName: computed('model', function(){
    return this.get('model.Email').split('@')[0];
  }),
  actions: {
    addAdmin(){
      this.set('isAdded', true);
      this.get('addAdmin')(this.get('model'));      
    }
  }
});
