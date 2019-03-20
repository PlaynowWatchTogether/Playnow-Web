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
    let headerHeight = $('header').height();
    let footerHeight = $('footer').height();
    if (this.get('useFooter')) {
      footerHeight = footerHeight * this.get('useFooter');
    }
    let calcHeight = Math.max($('body').height(), this.minHeight) - (headerHeight ? headerHeight : 0) - (footerHeight ? footerHeight : 0);
    $(this.element).css('height', calcHeight);
  },
  didInsertElement() {
    this._super(...arguments);
    this.handleSize()
  }

});
