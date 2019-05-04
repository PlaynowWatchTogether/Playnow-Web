import Component from '@ember/component';
import $ from 'jquery';
import {bind} from '@ember/runloop';
import {debug} from '@ember/debug';
export default Component.extend({
  init() {
    this._super(...arguments);
    this.lastHeight = 0;
    this.addObserver('refreshScroll', this,'onRefreshScroll');
  },
  onRefreshScroll(obj){
      obj.scrollDown();
  },
  scrollDown(){
    this.lastHeight = $(this.element)[0].scrollHeight;
    $(this.element).scrollTop(this.lastHeight);
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
  updateCurrentTopChild(){
    var currentMaxOffScreen = null;
    const rootOffset = $(this.element).offset().top;
    const childrens = $(this.element).find(this.get('scrollChild')).children(this.get('itemTimeSelector'));
    const fixedHolder = $('.message-scroll-date-holder').offset();
    if (!fixedHolder)
      return;
    childrens.each((index,child)=>{
        const offset = $(child).offset();
        const childOffset = offset.top - rootOffset-20;
        const headerOffset = fixedHolder.top - rootOffset;
        if (childOffset <= headerOffset){
            currentMaxOffScreen = child;
            $(child).css('opacity',0);
        }else{
          $(child).css('opacity',1);
        }
    });
    if (!currentMaxOffScreen && childrens.length>0){
      currentMaxOffScreen = childrens[0];
    }
    if (this.get('onTopChildChanged')){
      this.get('onTopChildChanged')(currentMaxOffScreen);
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
    this.updateCurrentTopChild();
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
        this.updateCurrentTopChild();
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
    this.updateCurrentTopChild();
  }
});
