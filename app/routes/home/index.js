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
    return this.store.peekAll('room');
  },
  activate() {

    // let ctrl = this.controllerFor('home/index');
    // ctrl.set('model', arProxy);
    this.get('db').rooms((rooms) => {
      rooms.forEach((room) => {
        room['rawData'] = JSON.stringify(room);
        room['lastUpdate'] = new Date().getUTCMilliseconds();
        let normalizedData = this.store.normalize('room', room);
        this.store.push(normalizedData);
      });

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
