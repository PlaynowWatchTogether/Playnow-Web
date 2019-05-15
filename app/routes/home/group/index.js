import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {debug} from '@ember/debug';

export default Route.extend({
  db: service(),
  activate() {
    $('body').addClass('index');
  },
  setupController(controller, model) {
    this.controllerFor('home/group/index').activate();
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('index');
  },
  resetController(controller) {
    controller.reset()
  }
});
