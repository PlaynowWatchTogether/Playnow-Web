import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);
    $(this.element).find('.dropdown-toggle').on('click', function (event) {
      // $(this).parent().toggleClass('open');
    });
    $(this.element).find('.actionItem').click(function (e) {
      // e.stopPropagation();
    });
    $(this.element).on('show.bs.dropdown', function (e) {
      console.log('shown dropdown');
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
