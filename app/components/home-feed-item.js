import Component from '@ember/component';
import { computed } from '@ember/object';
import FeedModelWrapper from '../custom-objects/feed-model-wrapper';
export default Component.extend({
  hasViewers: computed('model', function(){
    return this.get('groupViewers').length > 0;
  }),
  groupViewers: computed('model', function(){
    return this.get('model.groupViewers');
  }),
  viewsNumber: computed('model', function(){
    return this.get('model.groupViewers').length;
  })
});
