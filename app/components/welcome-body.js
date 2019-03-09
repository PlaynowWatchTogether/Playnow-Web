import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
  init() {
    this._super(arguments)
    $(window).on('resize', this.handleSize.bind(this));
  },
  willDestroyElement() {
    this._super(...arguments);
    $(window).off("resize");
  },
  handleSize() {
    let minHeight = 700;
    let calcHeight = Math.max($('body').height(), minHeight) - $('header').height() - $('footer').height()
    $(this.element).css('height', calcHeight)
  },
  didInsertElement() {
    this._super(...arguments);
    this.handleSize()

  },

});
