import Route from '@ember/routing/route';
import Ember from 'ember'
import AuthRouteMixin from '../../mixins/auth-route-mixin'

export default Route.extend(AuthRouteMixin, {
  model() {
    return this.store.query('room', {});
  },
  activate() {
    this._super(...arguments);
    $('body').addClass('index');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('index');
  }
});
