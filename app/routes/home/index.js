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
    return this.arProxy;
  },
  activate() {

    // let ctrl = this.controllerFor('home/index');
    // ctrl.set('model', arProxy);
    this.get('db').rooms((rooms) => {
      this.arProxy.setObjects(rooms.filter((elem) => {
        return elem['videoThumbnail'] && elem['videoThumbnail'].length > 0
      }));
    }, () => {
    });
    this._super(...arguments);
    $('body').addClass('index');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('index');
    this.get('db').roomsOff();
  }
});
