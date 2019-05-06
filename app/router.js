import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import googlePageview from './mixins/google-pageview';

const Router = EmberRouter.extend(googlePageview, {
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('welcome', {path: '/welcome'});
  this.route('logout');
  this.route('home', {path: '/'}, function () {
    this.route('friends');
    this.route('chat', {path: '/chat/:chat_id/:type'});
    this.route('create');
    this.route('group', function(){
      this.route('show',{path: ':group_id'})
    });
  });
  this.route('search', {path: '/search/:query'});
  this.route('mobile');
  this.route('404');  
});

export default Router;
