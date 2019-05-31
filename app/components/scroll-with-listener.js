import Component from '@ember/component';
import {debug} from "@ember/debug";
import J from 'jquery';

export default Component.extend({
  classNameBindings: ['music', 'loading'],
  didInsertElement() {
    this._super(...arguments);
    $(this.element).closest(this.get('scrollParent')).on('scroll', () => {

      if ($(this.element).height() === 0)
        return;
      let maxScrollY = $(this.element).height() - $(this.element).closest(this.get('scrollParent')).height();
      let scrollHalf = 2 * maxScrollY / 3;

      let scrolled = $(this.element).closest(this.get('scrollParent')).scrollTop();
      if (scrolled > scrollHalf) {
        if (!$(this.element).hasClass('loading')) {
          this.onScrolledHalf();
          debug('Scrolled more then half with ' + $(this.element).height() + ' ' + $(this.element).closest(this.get('scrollParent')).height());
        }

      }
    })
  }
});
