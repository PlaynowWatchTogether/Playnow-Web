import Route from '@ember/routing/route';
import Ember from "ember";

export default Route.extend({
  activate() {
    this._super(...arguments);
    Ember.$('body').addClass('search');
  },
  deactivate() {
    this._super(...arguments);
    Ember.$('body').removeClass('search');
  },
});
