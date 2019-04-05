import Route from '@ember/routing/route';
import $ from "jquery";

export default Route.extend({

  activate() {
    this._super(...arguments);
    $('body').addClass('home index');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('home index');
  }
});
