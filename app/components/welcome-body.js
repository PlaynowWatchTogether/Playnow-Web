import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
  minHeight: 700,
  init() {
    this._super(arguments);
    $(window).on('resize', this.handleSize.bind(this));
  },
  willDestroyElement() {
    this._super(...arguments);
    $(window).off("resize");
  },
  handleSize() {
    let calcHeight = Math.max($('body').height(), this.minHeight) - $('header').height() - $('footer').height();
    $(this.element).css('height', calcHeight);
  },
  didInsertElement() {
    this._super(...arguments);
    this.handleSize()

  },

});
