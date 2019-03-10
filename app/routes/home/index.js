import Route from '@ember/routing/route';
import Ember from 'ember'

export default Route.extend({
  activate() {
    this._super(...arguments);
    Ember.$('body').addClass('index');
  },
  deactivate() {
    this._super(...arguments);
    Ember.$('body').removeClass('index');
  }
});
