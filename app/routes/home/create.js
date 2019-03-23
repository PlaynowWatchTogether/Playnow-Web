import Route from '@ember/routing/route';
import $ from 'jquery';

export default Route.extend({
  activate() {
    this._super(...arguments);
    $('body').addClass('create');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('create');
  }
});
