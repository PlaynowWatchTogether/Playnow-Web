import Route from '@ember/routing/route';

export default Route.extend({
  activate() {
    $('body').addClass('show');
  },
  model(params) {
    return params
  },
  resetController(controller) {
    controller.reset()
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('show');
  }
});
