import Component from '@ember/component';
import $ from 'jquery';
import {bind} from '@ember/runloop';
import {debug} from '@ember/debug';
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
          // $(this.element).scrollTop(diff);
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
    $(this.element).on('scroll', () => {

      if ($(this.element).height() === 0)
        return;
      let maxScrollY = $(this.element).find(this.get('scrollChild')).height() - $(this.element).height();
      let scrollHalf = maxScrollY / 4;
      let scrollHalfEnd = 2 * maxScrollY / 3;

      let scrolled = $(this.element).scrollTop();
      if (this.get('handleEnd')) {
        if (scrolled > scrollHalfEnd) {
          if (!$(this.element).hasClass('loading')) {
            this.onScrolledHalf();
          }
        }
      } else {
        let scrollTop = $(this.element).scrollTop();
        let windowHeight = $(this.element).height();
        var currentMin = null;
        $(this.element).find(this.get('scrollChild')).children('.messageHolder').each((index,child)=>{
            var offset = $(child).offset();
            if (offset.top > 0 && currentMin === null){
                currentMin = child;
            }
            //debug(`top: ${scrollTop} offset: ${JSON.stringify(offset)}`);
        });
        if (this.get('onTopChildChanged')){
          this.get('onTopChildChanged')(currentMin);
        }
        if (scrolled < scrollHalf) {
          if (!$(this.element).hasClass('loading')) {
            this.onScrolledHalf();
          }
        }
      }
    })
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
