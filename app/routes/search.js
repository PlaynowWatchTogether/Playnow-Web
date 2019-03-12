import Route from '@ember/routing/route';
import Ember from "ember";
import AuthRouteMixin from '../mixins/auth-route-mixin'

export default Route.extend(AuthRouteMixin, {
  activate() {
    this._super(...arguments);
    $('body').addClass('search');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('search');
  },
});
