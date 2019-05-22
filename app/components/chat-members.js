import Component from '@ember/component';
import $ from 'jquery';
export default Component.extend({
  classNameBindings: ['fullscreen:fullscreen'],
  didInsertElement(){
    this._super(...arguments);
    $(this.element).on('click','.member', (event)=>{
      $(event.target).toggleClass('large');
    });
  }
});
