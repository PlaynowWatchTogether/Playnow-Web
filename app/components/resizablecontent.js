import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);
    $(window).on('resize', ()=>{
      $(this.element).css('height', $(this.get('parentSelector')).height() - $(this.element).offset().top);
    });
    $(this.element).css('height', $(this.get('parentSelector')).height() - $(this.element).offset().top);
  }
});
