import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';

export default Route.extend({
  khanAuth: service(),
  queryParams: {
    oauth_token_secret: {
      refreshModel: true
    },
    oauth_verifier: {
      refreshModel: true
    },
    oauth_token:{
      refreshModel: true
    }
  },
  model(params){
    debug(`got params ${JSON.stringify(params)}`);
    return new Promise((resolve,reject)=>{
      this.get('khanAuth').getCallback(params);      
    });
  }
})
