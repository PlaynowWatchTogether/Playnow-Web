import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
import DS from 'ember-data';
import UserProfileView from './user-profile-view';

export default UserProfileView.extend({
  db:service(),
  click(){
    if (this.get('detailsOnClick')){
      this._super(...arguments);
    }
  },
  didInsertElement(){
    this._super(...arguments);
    this.get('db').profile(this.get('model')).then((profile)=>{
      if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
        const email = profile.Email;
        if (email){
          const parts = email.split('@');
          this.set('username', parts[0]);
        }
      }
    });
  }
});
