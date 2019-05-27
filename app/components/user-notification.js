import Component from '@ember/component';
import {computed} from '@ember/object';
export default Component.extend({
  classNameBindings: ['isRead:read'],
  isRead:computed('model.read', function(){
    return this.get('model.read');
  }),
  click(){
    this.get('openDetails')(this.get('model'));
  },
  actions:{
    clearNotification(){
      this.get('clearNotification')(this.get('model'));
    }
  }
});
