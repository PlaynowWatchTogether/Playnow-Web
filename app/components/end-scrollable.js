import Component from '@ember/component';
import $ from 'jquery';
import {bind} from '@ember/runloop';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.lastHeight = 0
  },
  didRender() {
    this._super(...arguments);
    if ($(this.element)[0].scrollHeight !== this.lastHeight) {
      let newHeight = $(this.element)[0].scrollHeight;
      let diff = newHeight - this.lastHeight;
      this.lastHeight = newHeight;
      if (!this.get('blockScroll')) {
        $(this.element).scrollTop(this.lastHeight);
      } else {
        if (diff > 0) {
          $(this.element).scrollTop(diff);
        }
      }
    }
  },
  didInsertElement() {
    this._super(...arguments);
    this._mutationObserver = new MutationObserver(bind(this, this.domChanged));
    this._mutationObserver.observe(this.element, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });
  },
  domChanged() {
    if ($(this.element)[0].scrollHeight !== this.lastHeight) {
      this.lastHeight = $(this.element)[0].scrollHeight;
      if (!this.get('blockScroll')) {
        $(this.element).scrollTop(this.lastHeight);
      }
    }
  }
});
