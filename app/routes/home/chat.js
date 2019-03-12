import Route from '@ember/routing/route';
import Ember from "ember";
import AuthRouteMixin from '../../mixins/auth-route-mixin'

export default Route.extend(AuthRouteMixin, {
  model(params) {
    return params
  },
  activate() {
    this._super(...arguments);
    $('body').addClass('chat');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('chat');
  },
  resetController(controller, isExiting, transition) {
    controller.reset()
  }
});
