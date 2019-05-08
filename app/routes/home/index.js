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
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position)=>{
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const controller = this.controllerFor('home.index');
          controller.set('userLocation', {lat: lat, lng: lng});
        });
    }
    this._super(...arguments);
    $('body').addClass('index');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('index');

    this.get('db').feedsOff();
  },
  resetController(controller) {
    controller.reset()
  }
});
