import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  db: service(),
  model() {
    return []
  },
  renderTemplate(controller, model) {
    this._super(arguments);
    let friendsController = this.controllerFor('home/friends');
    friendsController.set('model', model);
    this.render('home/friends', {
      outlet: 'friends',
      into: 'home',
      controller: friendsController
    });
  }
});
