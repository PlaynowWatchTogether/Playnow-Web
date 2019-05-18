import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({
  init(){
    this._super(...arguments);
    this.set('currentPosition', 0);
  },
  hasNext: computed('currentPosition', function(){
    return this.get('currentPosition') !== this.get('model').length-1;
  }),
  hasPrev: computed('currentPosition', function(){
    return this.get('currentPosition') !==0;
  }),
  actions:{
    displayPrev(){
      this.decrementProperty('currentPosition');
    },
    displayNext(){
      this.incrementProperty('currentPosition');
    }
  }
});
