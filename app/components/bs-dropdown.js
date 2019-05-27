import Component from '@ember/component';
import {debug} from "@ember/debug";
import $ from 'jquery';

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);
    $(this.element).find('.dropdown-toggle').on('click', function () {
      // $(this).parent().toggleClass('open');
    });
    $(this.element).find('.actionItem').click(function () {
      // e.stopPropagation();
    });
    $(this.element).on('show.bs.dropdown', function () {
      debug('shown dropdown');
    });
    $(this.element).on('hidden.bs.dropdown', ()=> {
      debug('hidden dropdown');
      const act = this.get('onClose');
      if (act){
        act();
      }
    });
  }
});
