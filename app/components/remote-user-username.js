import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
import DS from 'ember-data';


export default Component.extend({
  db:service(),
  didInsertElement(){
    this._super(...arguments);
    this.get('db').profile(this.get('model')).then((profile)=>{
      const email = profile.Email;
      const parts = email.split('@');
      this.set('username', parts[0]);
    });
  }
});
