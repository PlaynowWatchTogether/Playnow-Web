import Route from '@ember/routing/route';

export default Route.extend({
  activate() {
    $('body').addClass('group');

  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('group');   
  }
});
