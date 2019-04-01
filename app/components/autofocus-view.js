import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
  didRender() {
    this._super(...arguments);
    let focusSeletor = this.get('focusSelector');
    if (focusSeletor) {
      $(this.element).find(focusSeletor).focus();
    }
  }
});
