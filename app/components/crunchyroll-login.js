import Component from '@ember/component';
import { inject as service } from '@ember/service';
import J from 'jquery';

export default Component.extend({
  crunchyrollAuth: service(),
  init(){
    this._super(...arguments);
    this.set('errors',{});
  },
  actions: {
    login(){
      this.set('errors',{});
      const username = this.get('username');
      const password = this.get('password');
      if (!username || username.length === 0){
        this.set('errors.username', 'Should not be empty');
        return;
      }
      if (!password || password.length === 0){
        this.set('errors.password', 'Should not be empty');
        return;
      }
      this.crunchyrollAuth.login(username, password).then((data)=>{
        $(this.element).modal('hide');
      }).catch((error)=>{
        this.set('errors.username', 'Failed to login');
      })
    }
  }
});
