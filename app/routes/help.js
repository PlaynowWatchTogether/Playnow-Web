import Route from '@ember/routing/route';

export default Route.extend({
  activate() {
    this._super(...arguments);
    $('body').addClass('help');
  },
  deactivate() {
    $('body').removeClass('help');
    this._super(...arguments);
  }
});
