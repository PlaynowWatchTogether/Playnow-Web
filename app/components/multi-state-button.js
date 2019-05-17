import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNameBindings:['isTrue:state-true','isFalse:state-false'],
  isTrue: computed('model', function(){
    return this.get('model');
  }),
  isFalse: computed('model', function(){
    return !this.get('model');
  }),
  actions:{
    onClickAction(){
      this.get('clickAction')();
    }
  }
});
