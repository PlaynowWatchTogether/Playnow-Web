import Route from '@ember/routing/route';
import $ from 'jquery';

export default Route.extend({
  activate() {
    this._super(...arguments);
    $('body').addClass('create');
    let ctrl = this.controllerFor('home/create');
    ctrl.activated();
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('create');
  },
  resetController(controller) {
    controller.reset()
  }
});
