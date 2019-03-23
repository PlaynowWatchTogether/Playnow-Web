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
      // if (!$(this).find('.dropdown-menu').is(e.target)
      //   && $(this).find('.dropdown-menu').has(e.target).length === 0
      //   && $(this).find('.show').has(e.target).length === 0
      // ) {
      //   $(this).find('.dropdown-menu').removeClass('show');
      // }
    });
    // $('dropdown-backdrop').on('click', () => {
    //   $('.dropdown-menu').hide();
    //   $('.dropdown-backdrop').hide();
    //   $('.dropdown').removeClass('active');
    // });
    // $('.dropdown-toggle').on('click', () => {
    //   $('.dropdown').addClass('active');
    //   $('.dropdown-menu').show();
    //   $('.dropdown-backdrop').show();
    // })
  }
});
