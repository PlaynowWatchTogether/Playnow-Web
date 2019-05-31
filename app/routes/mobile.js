import Route from '@ember/routing/route';
import J from 'jquery'

export default Route.extend({
  activate() {
    this._super(...arguments);
    $('body').addClass('mobile');
  }
});
