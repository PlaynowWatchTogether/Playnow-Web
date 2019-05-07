import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  hasViewers: computed('model', function(){
    return this.get('groupViewers').length > 0;
  }),
  groupViewers: computed('model', function(){
    return Object.values(this.get('model.videoWatching'));
  }),
  isPlaying: computed('model', function(){
    return false;
  })
});
