import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({
  classNames:"home-user-feed",
  classNameBindings: ['isEmpty:empty'],
  isEmpty: computed('model.@each','isLoading', function(){
    return this.get('model').length==0;
  }),
  actions: {
    openDetails(feed,live){
      this.get('openDetails')(feed,live);
    }
  }
});
