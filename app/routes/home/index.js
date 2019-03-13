import Route from '@ember/routing/route';
import Ember from 'ember'
import AuthRouteMixin from '../../mixins/auth-route-mixin'
import {inject as service} from '@ember/service';

export default Route.extend(AuthRouteMixin, {
  db: service(),
  model() {
    return this.store.query('room', {});
  },
  activate() {
    this.get('db').rooms(() => {
    }, () => {
    });
    this._super(...arguments);
    $('body').addClass('index');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('index');
  }
});
