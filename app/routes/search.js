import Route from '@ember/routing/route';
import $ from "jquery";
import AuthRouteMixin from '../mixins/auth-route-mixin'
import {inject as service } from '@ember/service';
export default Route.extend(AuthRouteMixin, {
  db:service(),
  activate() {
    this._super(...arguments);
    $('body').addClass('search');
    let applicationCtrl = this.controllerFor('application');
    let searchCtrl = this.controllerFor('search');
    searchCtrl.set('profile', applicationCtrl.get('model'));

  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('search');
  },
});
