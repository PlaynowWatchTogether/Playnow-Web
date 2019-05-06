import Route from '@ember/routing/route';
import AuthRouteMixin from '../../mixins/auth-route-mixin'
import {inject as service} from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import $ from 'jquery';

export default Route.extend(AuthRouteMixin, {
  db: service(),
  init() {
    this._super(...arguments);
    this.arProxy = ArrayProxy.create({content: []});
  },
  model() {
    return this.store.peekAll('feed-item');
  },
  activate() {    
    this._super(...arguments);
    $('body').addClass('index');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('index');
    this.get('db').feedsOff();
  }
});
