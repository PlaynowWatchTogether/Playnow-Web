import Route from '@ember/routing/route';
import Ember from "ember";

export default Route.extend({
  model(params) {
    return params
  },
  activate() {
    this._super(...arguments);
    Ember.$('body').addClass('chat');
  },
  deactivate() {
    this._super(...arguments);
    Ember.$('body').removeClass('chat');
  },
  resetController(controller, isExiting, transition) {
    controller.reset()
  }
});
