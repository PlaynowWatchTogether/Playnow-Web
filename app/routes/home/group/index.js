import Route from '@ember/routing/route';

export default Route.extend({
  activate() {
    $('body').addClass('index');

  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('index');
  },
  resetController(controller) {
    controller.reset()
  }
});
