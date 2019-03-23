import Route from '@ember/routing/route';
import $ from "jquery";
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
    let body = $('body');
    body.removeClass('chat');
    body.removeClass('room');
  },
  afterModel(model) {
    let body = $('body');
    if (model.type === 'room') {
      body.addClass('room');
    } else {
      body.removeClass('room');
    }
  },
  resetController(controller) {
    controller.reset()
  }
});
