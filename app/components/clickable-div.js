import Component from '@ember/component';

export default Component.extend({
  click(event) {
    event.stopPropagation();
    this.clickAction();
    return false;
  }
});
