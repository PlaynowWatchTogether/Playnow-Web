import Component from '@ember/component';

export default Component.extend({
  classNameBindings: ['music', 'loading'],
  didInsertElement() {
    this._super(...arguments);
    $(this.element).closest(this.get('scrollParent')).on('scroll', () => {

      if ($(this.element).height() === 0)
        return;
      let maxScrollY = $(this.element).height() - $(this.element).closest(this.get('scrollParent')).height();
      let scrollHalf = maxScrollY / 2;

      let scrolled = $(this.element).closest(this.get('scrollParent')).scrollTop();
      if (scrolled > scrollHalf) {
        if (!$(this.element).hasClass('loading')) {
          this.onScrolledHalf();
          console.log('Scrolled more then half with ' + $(this.element).height() + ' ' + $(this.element).closest(this.get('scrollParent')).height());
        } else {

        }

      }
    })
  }
});
