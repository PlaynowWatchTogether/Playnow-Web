import Component from '@ember/component';
import $ from 'jquery';
import {debug} from '@ember/debug';

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);
    let element = this;
    if ($(this.element).find(this.get('searchSelector') || 'input').val().length === 0) {
      $(element.element).find(element.get('closeSelector') || '.close-search').css('visibility', 'hidden');
    } else {
      $(element.element).find(element.get('closeSelector') || '.close-search').css('visibility', 'visible');
    }
    $(element.element).find(element.get('closeSelector') || '.close-search').on('click', () => {
      $(this.element).find(this.get('searchSelector') || 'input').val('');
      $(this.element).find(this.get('searchSelector') || 'input').trigger('change');
      $(this.element).find(this.get('searchSelector') || 'input').trigger('input');
      $(this.element).find(this.get('searchSelector') || 'input').focus();
    });
    $(this.element).find(this.get('searchSelector') || 'input').on('input', function () {
      if ($(this).val().length === 0) {
        $(element.element).find(element.get('closeSelector') || '.close-search').css('visibility', 'hidden');
      } else {
        $(element.element).find(element.get('closeSelector') || '.close-search').css('visibility', 'visible');

      }
    })
  }
});
