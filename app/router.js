import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('welcome', {path: '/'});
  this.route('logout');
  this.route('home', function () {
    this.route('friends');
    this.route('chat', {path: '/chat/:chat_id/:type'});
    this.route('create');
  });
  this.route('search', {path: '/search/:query'});
});

export default Router;
