import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
  didInsertComponent() {
    this._super(...arguments);
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
