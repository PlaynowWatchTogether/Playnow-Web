import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);
    $(window).on('resize', ()=>{
      this.handleSize();
    });
    this.handleSize();
  },
  didRender(){
    this._super(...arguments);
    this.handleSize();
  },
  handleSize(){
    const minus = this.get('minusSelector').split(';');
    let height = $(this.get('parentSelector')).height();
    const parentOffset = $(this.get('parentSelector')).offset().top;
    const windowHeight = $(window).height();
    const maxParentHeight = windowHeight-parentOffset;
    height = maxParentHeight;
    minus.forEach((elem)=>{
      height-=$(elem).height();
    });
    $(this.element).css('height', height);
  }
});
