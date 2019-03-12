import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
  didInsertComponent() {
    this._super(...arguments);
    Ember.$('dropdown-backdrop').on('click', () => {
      this.$('dropdown-menu').hide();
      Ember.$('dropdown-backdrop').hide();
      this.$().removeClass('active');
    });
    this.$('.dropdown-toggle').on('click', () => {
      this.$().addClass('active');
      this.$('dropdown-menu').show();
      Ember.$('dropdown-backdrop').show();
    })
  }
});
