import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
import DS from 'ember-data';


export default Component.extend({
  db:service(),
  postSenderPic: computed('model', function(){
    return DS.PromiseObject.create({
      promise: this.get('db').profile(this.get('model'))
    });
  }),
});
